import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { calculateBreakEven, generateFullDiagnostic } from './src/utils/diagnosticCalculator';
import { DiagnosticFormData, EvidenceData, GooglePlacesEvidence, NewsItemEvidence } from './src/types';
import Stripe from 'stripe';

console.log('🚀 SERVIDOR INICIADO COM SUCESSO');
console.log('🔑 GOOGLE_PLACES_API_KEY:', process.env.GOOGLE_PLACES_API_KEY ? '✅ Configurada' : '❌ Não configurada');
console.log('🔑 GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Configurada' : '❌ Não configurada');
console.log('🔑 STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Configurada' : '❌ Não configurada');

const DATA_DIR = path.join(process.cwd(), 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.jsonl');

function registrarLeadPago(formData: DiagnosticFormData, result: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const record = {
      timestamp: new Date().toISOString(),
      pago: true,
      nome: formData.contactName || '',
      email: formData.contactEmail || '',
      telefone: formData.contactPhone || '',
      consentimento: !!formData.consentGiven,
      empresa: formData.companyName || formData.cnpjData?.razaoSocial || '',
      cnpj: formData.cnpj || '',
      segmento: formData.segment || '',
      cidade: formData.cityState || '',
      faturamentoMensal: formData.monthlyRevenue ?? null,
      indiceClareza: result?.clarityIndex ?? null,
      gargaloPrincipal: result?.primaryBottleneck?.name ?? null,
      gargaloSecundario: result?.secondaryBottleneck?.name ?? null,
      objetivoPrincipal: formData.mainGoal || '',
      maiorDificuldade: formData.biggestDifficulty || '',
    };
    fs.appendFileSync(LEADS_FILE, JSON.stringify(record) + '\n');

    const webhookUrl = process.env.LEAD_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      }).catch((err) => console.warn('Falha ao enviar lead pro webhook:', err));
    }
  } catch (err) {
    console.error('Falha ao registrar lead:', err);
  }
}

async function fetchGooglePlacesEvidence(query: string): Promise<GooglePlacesEvidence> {
  if (!query) return { rating: null, userRatingsTotal: null, status: 'not_found' };
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return { rating: null, userRatingsTotal: null, status: 'no_api_key' };
  try {
    const findUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,rating,user_ratings_total,formatted_address&key=${apiKey}`;
    const findRes = await fetch(findUrl);
    if (!findRes.ok) return { rating: null, userRatingsTotal: null, status: 'error' };
    const findData = await findRes.json();
    if (findData.candidates && findData.candidates.length > 0) {
      const place = findData.candidates[0];
      if (place.rating !== undefined) {
        return { name: place.name, rating: place.rating, userRatingsTotal: place.user_ratings_total || 0, address: place.formatted_address, status: 'success' };
      }
      if (place.place_id) {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,user_ratings_total,formatted_address&key=${apiKey}`;
        const detailsRes = await fetch(detailsUrl);
        if (detailsRes.ok) {
          const detailsData = await detailsRes.json();
          if (detailsData.result) {
            return { name: detailsData.result.name, rating: detailsData.result.rating || null, userRatingsTotal: detailsData.result.user_ratings_total || 0, address: detailsData.result.formatted_address || '', status: 'success' };
          }
        }
      }
    }
    return { rating: null, userRatingsTotal: null, status: 'not_found' };
  } catch (err: any) {
    console.warn('Google Places fetch failed:', err.message);
    return { rating: null, userRatingsTotal: null, status: 'error' };
  }
}

async function fetchNewsEvidence(query: string): Promise<NewsItemEvidence[]> {
  if (!query) return [];
  const serpApiKey = process.env.SERP_API_KEY;
  if (serpApiKey) {
    try {
      const serpUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&tbm=nws&hl=pt-br&gl=br&api_key=${serpApiKey}`;
      const serpRes = await fetch(serpUrl);
      if (serpRes.ok) {
        const serpData = await serpRes.json();
        if (serpData.news_results && Array.isArray(serpData.news_results)) {
          return serpData.news_results.slice(0, 5).map((item: any) => ({ title: item.title, source: item.source || 'Notícias', date: item.date || 'Recente', link: item.link, snippet: item.snippet }));
        }
      }
    } catch (serpErr) {
      console.warn('SerpAPI fetch error, using Google News RSS fallback:', serpErr);
    }
  }
  try {
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
    const rssRes = await fetch(rssUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (rssRes.ok) {
      const xmlText = await rssRes.text();
      const itemRegex = /<item>[\s\S]*?<\/item>/gi;
      const matches = xmlText.match(itemRegex) || [];
      return matches.slice(0, 5).map((itemXml) => {
        const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i);
        const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
        const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
        const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
        let title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1') : 'Menção na Imprensa';
        title = title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        let source = sourceMatch ? sourceMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1') : 'Google News';
        let rawDate = pubDateMatch ? pubDateMatch[1] : '';
        let dateStr = rawDate ? new Date(rawDate).toLocaleDateString('pt-BR') : 'Recente';
        return { title, source, date: dateStr, link: linkMatch ? linkMatch[1] : '' };
      });
    }
  } catch (rssErr) {
    console.warn('Google News RSS parse failed:', rssErr);
  }
  return [];
}

async function getEvidenceData(companyName: string, cityState: string): Promise<EvidenceData> {
  const queryPlaces = `${companyName} ${cityState}`.trim();
  const queryNews = companyName.trim();
  const [googlePlaces, news] = await Promise.all([fetchGooglePlacesEvidence(queryPlaces), fetchNewsEvidence(queryNews)]);
  return { googlePlaces, news, fetchedAt: new Date().toLocaleDateString('pt-BR') };
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  app.use(express.json({ limit: '10mb' }));

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-02-24.acacia',
  });

  // ===== ROTAS PÚBLICAS =====
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Ponto de Impacto Diagnostic API (TFAZZIO)', timestamp: new Date().toISOString() });
  });

  app.get('/api/cnpj/:cnpj', async (req, res) => {
    try {
      const cleanCnpj = req.params.cnpj.replace(/\D/g, '');
      if (cleanCnpj.length !== 14) return res.status(400).json({ error: 'CNPJ inválido. Deve conter 14 dígitos.' });
      let data: any = null;
      let source = 'brasilapi';
      try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
        if (response.ok) data = await response.json();
      } catch (e) { console.warn('BrasilAPI fetch failed, trying fallback...'); }
      if (!data) {
        try {
          const fallbackRes = await fetch(`https://publica.cnpj.ws/cnpj/${cleanCnpj}`);
          if (fallbackRes.ok) {
            const raw = await fallbackRes.json();
            source = 'cnpj.ws';
            data = {
              cnpj: cleanCnpj, razao_social: raw.razao_social,
              nome_fantasia: raw.estabelecimento?.nome_fantasia || raw.razao_social,
              porte: raw.porte?.descricao || 'PME',
              cnae_fiscal: raw.estabelecimento?.atividade_principal?.id,
              cnae_fiscal_descricao: raw.estabelecimento?.atividade_principal?.descricao,
              logradouro: `${raw.estabelecimento?.tipo_logradouro || ''} ${raw.estabelecimento?.logradouro || ''}`.trim(),
              municipio: raw.estabelecimento?.cidade?.nome, uf: raw.estabelecimento?.estado?.sigla,
              descricao_situacao_cadastral: raw.estabelecimento?.situacao_cadastral,
              capital_social: raw.capital_social, data_inicio_atividade: raw.estabelecimento?.data_inicio_atividade,
            };
          }
        } catch (e) { console.warn('Fallback CNPJ fetch failed too'); }
      }
      if (!data) return res.status(444).json({ error: 'Não foi possível obter dados automáticos do CNPJ nas bases públicas. Você pode preencher os dados manualmente.' });
      const formattedCompany = {
        cnpj: cleanCnpj, razaoSocial: data.razao_social || data.nome || 'Razão Social não informada',
        nomeFantasia: data.nome_fantasia || data.fantasia || data.razao_social || 'Nome Fantasia não informado',
        porte: data.porte || 'PME', cnaeCodigo: String(data.cnae_fiscal || data.cnae_fiscal_principal || ''),
        cnaeDescricao: data.cnae_fiscal_descricao || data.cnae_fiscal_principal_descricao || 'Atividade principal',
        logradouro: data.logradouro || '', municipio: data.municipio || data.cidade || '', uf: data.uf || data.estado || '',
        situacaoCadastral: data.descricao_situacao_cadastral || 'Ativa', capitalSocial: Number(data.capital_social || 0),
        dataAbertura: data.data_inicio_atividade || data.data_abertura || '', source,
      };
      return res.json(formattedCompany);
    } catch (error: any) {
      console.error('Error fetching CNPJ:', error);
      return res.status(500).json({ error: 'Erro ao consultar CNPJ', details: error.message });
    }
  });

  app.get('/api/google-places', async (req, res) => {
    try { return res.json(await fetchGooglePlacesEvidence(String(req.query.query || req.query.q || '').trim())); }
    catch (err: any) { return res.json({ rating: null, userRatingsTotal: null, status: 'error' }); }
  });

  app.get('/api/google-places/:query', async (req, res) => {
    try { return res.json(await fetchGooglePlacesEvidence(String(req.params.query || '').trim())); }
    catch (err: any) { return res.json({ rating: null, userRatingsTotal: null, status: 'error' }); }
  });

  app.get('/api/news', async (req, res) => {
    try { return res.json({ news: await fetchNewsEvidence(String(req.query.query || req.query.q || '').trim()) }); }
    catch (err: any) { return res.json({ news: [] }); }
  });

  // ===== CHECKOUT =====
  app.post('/api/checkout/create', async (req, res) => {
    try {
      console.log('📦 Requisição de checkout recebida:', req.body);

      const { email, cupom } = req.body;
      const priceId = process.env.STRIPE_PRICE_ID;

      if (!priceId) {
        console.error('❌ STRIPE_PRICE_ID não está configurada');
        return res.status(500).json({ error: 'ID do preço não configurado' });
      }

      if (cupom && cupom.startsWith('TTFAZZIO')) {
        console.log('🎫 Cupom de teste TTFAZZIO detectado! BYPASS ATIVADO.');
        return res.json({ 
          url: `https://ponto.tfazzio.com.br/checkout/success?session_id=teste_${Date.now()}`
        });
      }

      console.log('🔄 Criando sessão Stripe para pagamento real...');

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: email || undefined,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `https://ponto.tfazzio.com.br/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://ponto.tfazzio.com.br/checkout/cancel`,
        metadata: {
          email: email || '',
          cupom: cupom || '',
        },
      });

      console.log('✅ Sessão Stripe criada com sucesso:', session.id);
      return res.json({ url: session.url });
    } catch (err: any) {
      console.error('❌ ERRO DETALHADO DO STRIPE:', err);
      return res.status(500).json({ error: err.message || 'Erro ao criar sessão de pagamento' });
    }
  });

  app.get('/checkout/success', (req, res) => {
    const sessionId = req.query.session_id;
    console.log('✅ Checkout success para session_id:', sessionId);
    res.redirect(`https://ponto.tfazzio.com.br/?success=true&session_id=${sessionId}`);
  });

  app.get('/checkout/cancel', (req, res) => {
    res.redirect('https://ponto.tfazzio.com.br/?canceled=true');
  });

  // ===== DIAGNÓSTICO =====
  app.post('/api/diagnostico/gerar', async (req, res) => {
    try {
      console.log('📊 Recebendo solicitação de diagnóstico (sem IA)...');
      const formData: DiagnosticFormData = req.body;
      const baseResult = generateFullDiagnostic(formData);
      const companyName = formData.companyName || formData.cnpjData?.razaoSocial || '';
      const evidence = await getEvidenceData(companyName, formData.cityState || '');
      const result = { ...baseResult, evidenceData: evidence };
      registrarLeadPago(formData, result);
      return res.json(result);
    } catch (error: any) {
      console.error('Error calculating diagnostic:', error);
      return res.status(500).json({ error: 'Erro ao processar diagnóstico', details: error.message });
    }
  });

  // ===== DIAGNÓSTICO COM IA (COM TIMEOUT DE 15 SEGUNDOS) =====
  app.post('/api/diagnostico/ia-gerar', async (req, res) => {
    console.log('🤖 Iniciando geração com IA...');
    const formData: DiagnosticFormData = req.body;
    const baseResult = generateFullDiagnostic(formData);
    const companyName = formData.companyName || formData.cnpjData?.razaoSocial || '';
    const evidencePromise = getEvidenceData(companyName, formData.cityState || '');
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY não configurada. Usando fallback local.');
      const evidence = await evidencePromise;
      const result = { ...baseResult, evidenceData: evidence };
      registrarLeadPago(formData, result);
      return res.json(result);
    }

    try {
      console.log('🔄 Chamando API do Gemini (com timeout de 15s)...');
      const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
      const breakEven = baseResult.breakEven;
      const prompt = `Você é um consultor empresarial executivo sênior do grupo TFAZZIO, especialista em reestruturação e aceleração de PMEs brasileiras.
Analise os dados reais do diagnóstico empresarial "Ponto de Impacto" para a seguinte empresa:
DADOS DA EMPRESA:
- Razão Social/Nome: ${formData.companyName || formData.cnpjData?.razaoSocial || 'Empresa PME'}
- CNPJ: ${formData.cnpj || 'Não informado'}
- Porte / CNAE: ${formData.cnpjData?.porte || 'PME'} - ${formData.cnpjData?.cnaeDescricao || formData.segment}
- Segmento: ${formData.segment} | Tempo no Mercado: ${formData.timeInMarket} | Funcionários: ${formData.employeesCount} | Regime: ${formData.taxRegime}
DADOS FINANCEIROS:
- Faturamento Mensal: R$ ${formData.monthlyRevenue} | Custos Fixos Totais: R$ ${breakEven.fixedCostsTotal}
- Break-Even: R$ ${breakEven.breakEvenRevenue} (${breakEven.breakEvenPercentage}%) | Margem de Contribuição: ${breakEven.contributionMarginPercent}%
- Lucro Líquido Estimado: R$ ${breakEven.estimatedNetProfit} (${breakEven.estimatedNetMarginPercent}%)
GARGALOS: Principal: ${baseResult.primaryBottleneck.name} (${baseResult.primaryBottleneck.score}) | Secundário: ${baseResult.secondaryBottleneck.name} (${baseResult.secondaryBottleneck.score})
Objetivo: "${formData.mainGoal || 'Expandir de forma estruturada'}" | Dificuldade: "${formData.biggestDifficulty || 'Gargalo operacional'}"
TAREFA: Gere uma análise executiva curta e personalizada em JSON: {"executiveSummary": "...", "textualDiagnosis": "...", "strategicRecommendations": ["...","...","...","..."]}. Responda APENAS em JSON válido em português do Brasil.`;

      // CRIA UMA PROMESSA COM TIMEOUT DE 15 SEGUNDOS
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Gemini API timeout após 15 segundos')), 15000)
      );

      // CORRE A IA E O TIMEOUT EM PARALELO (QUEM GANHAR PRIMEIRO VENCE)
      const response = await Promise.race([
        ai.models.generateContent({ model: 'gemini-3.6-flash', contents: prompt, config: { responseMimeType: 'application/json', temperature: 0.7 } }),
        timeoutPromise
      ]) as any;

      const responseText = response.text || '';
      console.log('✅ Resposta do Gemini recebida com sucesso.');
      
      const evidence = await evidencePromise;

      try {
        const aiParsed = JSON.parse(responseText.trim());
        const mergedResult = { ...baseResult, executiveSummary: aiParsed.executiveSummary || baseResult.executiveSummary, textualDiagnosis: aiParsed.textualDiagnosis || baseResult.textualDiagnosis, strategicRecommendations: aiParsed.strategicRecommendations || baseResult.strategicRecommendations, aiGenerated: true, evidenceData: evidence };
        registrarLeadPago(formData, mergedResult);
        console.log('🎉 Diagnóstico com IA concluído!');
        return res.json(mergedResult);
      } catch (pErr) {
        console.warn('⚠️ Erro ao analisar JSON da IA. Usando fallback.');
        const fallbackResult = { ...baseResult, evidenceData: evidence };
        registrarLeadPago(formData, fallbackResult);
        return res.json(fallbackResult);
      }
    } catch (aiErr: any) {
      console.error('⏰ TIMEOUT OU ERRO NA IA GEMINI:', aiErr.message || aiErr);
      // FALLBACK: Retorna o diagnóstico local sem a IA
      const evidence = await evidencePromise;
      const fallbackResult = { ...baseResult, evidenceData: evidence };
      registrarLeadPago(formData, fallbackResult);
      console.log('✅ Diagnóstico gerado via fallback local (sem IA)');
      return res.json(fallbackResult);
    }
  });

  // ===== ADMIN =====
  app.get('/api/admin/leads', (req, res) => {
    const token = String(req.query.token || '');
    if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    try {
      if (!fs.existsSync(LEADS_FILE)) return res.json({ count: 0, leads: [] });
      const lines = fs.readFileSync(LEADS_FILE, 'utf-8').trim().split('\n').filter(Boolean);
      const leads = lines.map((l) => JSON.parse(l));
      return res.json({ count: leads.length, leads });
    } catch (err: any) { return res.status(500).json({ error: err.message }); }
  });

  // ===== ARQUIVOS ESTÁTICOS =====
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Arquivo index.html não encontrado. Rode npm run build primeiro.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server "Ponto de Impacto (TFAZZIO)" running on http://0.0.0.0:${PORT}`);
  });
}

startServer();