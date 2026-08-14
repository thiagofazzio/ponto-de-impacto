import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { calculateBreakEven, generateFullDiagnostic } from './src/utils/diagnosticCalculator';
import { DiagnosticFormData, EvidenceData, GooglePlacesEvidence, NewsItemEvidence } from './src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.jsonl');

console.log('🔑 GOOGLE_PLACES_API_KEY:', process.env.GOOGLE_PLACES_API_KEY ? '✅ Configurada' : '❌ Não configurada');
console.log('🔑 GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Configurada' : '❌ Não configurada');

function registrarLead(formData: DiagnosticFormData, result: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const record = {
      timestamp: new Date().toISOString(),
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
  console.log('🔍 Google Places - Query:', query);
  console.log('🔑 API Key usada:', apiKey ? apiKey.substring(0, 10) + '...' : '❌ NENHUMA');
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

  // ===== ROTAS DA API =====
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

  app.post('/api/diagnostico/calcular', async (req, res) => {
    try {
      const formData: DiagnosticFormData = req.body;
      const baseResult = generateFullDiagnostic(formData);
      const companyName = formData.companyName || formData.cnpjData?.razaoSocial || '';
      const evidence = await getEvidenceData(companyName, formData.cityState || '');
      const result = { ...baseResult, evidenceData: evidence };
      registrarLead(formData, result);
      return res.json(result);
    } catch (error: any) {
      console.error('Error calculating diagnostic:', error);
      return res.status(500).json({ error: 'Erro ao processar diagnóstico', details: error.message });
    }
  });

  app.post('/api/diagnostico/ia-gerar', async (req, res) => {
    const formData: DiagnosticFormData = req.body;
    const baseResult = generateFullDiagnostic(formData);
    const companyName = formData.companyName || formData.cnpjData?.razaoSocial || '';
    const evidencePromise = getEvidenceData(companyName, formData.cityState || '');
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      const evidence = await evidencePromise;
      const result = { ...baseResult, evidenceData: evidence };
      registrarLead(formData, result);
      return res.json(result);
    }

    try {
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

      const response = await ai.models.generateContent({ model: 'gemini-3.6-flash', contents: prompt, config: { responseMimeType: 'application/json', temperature: 0.7 } });
      const responseText = response.text || '';
      const evidence = await evidencePromise;

      try {
        const aiParsed = JSON.parse(responseText.trim());
        const mergedResult = { ...baseResult, executiveSummary: aiParsed.executiveSummary || baseResult.executiveSummary, textualDiagnosis: aiParsed.textualDiagnosis || baseResult.textualDiagnosis, strategicRecommendations: aiParsed.strategicRecommendations || baseResult.strategicRecommendations, aiGenerated: true, evidenceData: evidence };
        registrarLead(formData, mergedResult);
        return res.json(mergedResult);
      } catch (pErr) {
        const fallbackResult = { ...baseResult, evidenceData: evidence };
        registrarLead(formData, fallbackResult);
        return res.json(fallbackResult);
      }
    } catch (aiErr: any) {
      console.error('Gemini API call failed:', aiErr);
      const evidence = await evidencePromise;
      const fallbackResult = { ...baseResult, evidenceData: evidence };
      registrarLead(formData, fallbackResult);
      return res.json(fallbackResult);
    }
  });

  app.get('/api/admin/leads', (req, res) => {
    console.log('🔍 Token recebido:', req.query.token);
    console.log('🔍 Token esperado (ADMIN_TOKEN):', process.env.ADMIN_TOKEN);
    const token = String(req.query.token || '');
    if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
      console.log('❌ Token inválido!');
      return res.status(401).json({ error: 'Não autorizado' });
    }
    console.log('✅ Token válido!');
    try {
      if (!fs.existsSync(LEADS_FILE)) return res.json({ count: 0, leads: [] });
      const lines = fs.readFileSync(LEADS_FILE, 'utf-8').trim().split('\n').filter(Boolean);
      const leads = lines.map((l) => JSON.parse(l));
      return res.json({ count: leads.length, leads });
    } catch (err: any) { return res.status(500).json({ error: err.message }); }
  });
// ===== ROTA PARA O MOTOR DE DECISÃO =====
app.post('/api/motor/diagnose', async (req, res) => {
  try {
    const formData = req.body;
    const motorUrl = process.env.MOTOR_URL || 'https://motor-tfazzio.onrender.com';
    
    console.log('🔗 Chamando motor:', motorUrl);
    
    // Mapear dados do GAS para o formato do motor
    const payload = {
      cnpj: formData.cnpj || '',
      faturamento: formData.monthlyRevenue || 0,
      equipe: formData.employeesCount || 0,
      desafio: formData.mainGoal || 'crescer_faturamento',
      respostas: {
        ...formData
      }
    };

    const response = await fetch(`${motorUrl}/diagnose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Motor error: ${response.status}`);
    }

    const motorResult = await response.json();
    const localResult = generateFullDiagnostic(formData);
    
    // Combinar resultados
    const mergedResult = {
      ...localResult,
      motor: motorResult,
      motorIntegrado: true,
      // Priorizar dados do motor quando disponíveis
      hipoteseMotor: motorResult.hipotese_vencedora || null,
      acoesMotor: motorResult.acoes || [],
      // Manter os dados locais como fallback
      primaryBottleneck: motorResult.hipotese_vencedora || localResult.primaryBottleneck,
      strategicRecommendations: motorResult.acoes?.length > 0 ? motorResult.acoes : localResult.strategicRecommendations
    };

    registrarLead(formData, mergedResult);
    return res.json(mergedResult);
    
  } catch (error) {
    console.error('❌ Motor API error:', error);
    // Fallback para diagnóstico local
    const localResult = generateFullDiagnostic(req.body);
    registrarLead(req.body, localResult);
    return res.json({
      ...localResult,
      motorIntegrado: false,
      motorErro: error.message
    });
  }
});
  // ===== SERVER ARQUIVOS ESTÁTICOS =====
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server "Ponto de Impacto (TFAZZIO)" running on http://0.0.0.0:${PORT}`);
    console.log('✅ Google Places:', process.env.GOOGLE_PLACES_API_KEY ? 'Configurada' : '❌ Não configurada');
    console.log('✅ Gemini:', process.env.GEMINI_API_KEY ? 'Configurada' : '❌ Não configurada');
  });
}

startServer();