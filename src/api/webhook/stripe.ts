import { Request, Response } from 'express';
import Stripe from 'stripe';
import fs from 'fs/promises';
import path from 'path';

// ============================================================
// INICIALIZAÇÃO DO STRIPE
// ============================================================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

// ============================================================
// CAMINHO DO ARQUIVO DE LEADS
// ============================================================
const LEADS_FILE = path.join(process.cwd(), 'data', 'leads.jsonl');

// ============================================================
// FUNÇÃO PARA ATUALIZAR O LEAD NO JSONL
// ============================================================
async function updateLeadPaymentStatus(
  sessionId: string,
  status: 'pending' | 'paid' | 'failed' | 'test'
) {
  try {
    // Verifica se o arquivo existe
    try {
      await fs.access(LEADS_FILE);
    } catch {
      console.log('📁 Arquivo de leads ainda não existe, criando...');
      await fs.writeFile(LEADS_FILE, '');
      return;
    }

    const data = await fs.readFile(LEADS_FILE, 'utf-8');
    const lines = data.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      console.log('📭 Nenhum lead encontrado para atualizar.');
      return;
    }

    let found = false;
    const updatedLines = lines.map(line => {
      try {
        const lead = JSON.parse(line);
        if (lead.stripeSessionId === sessionId) {
          found = true;
          return JSON.stringify({
            ...lead,
            paymentStatus: status,
            paymentConfirmed: status === 'paid' || status === 'test',
            paidAt: status === 'paid' || status === 'test' ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
          });
        }
        return line;
      } catch (e) {
        console.warn('⚠️ Linha inválida no JSONL:', e);
        return line;
      }
    });

    if (!found) {
      console.log(`⚠️ Lead com sessionId ${sessionId} não encontrado.`);
      return;
    }

    await fs.writeFile(LEADS_FILE, updatedLines.join('\n') + '\n');
    console.log(`✅ Lead atualizado: ${sessionId} -> ${status}`);
  } catch (error) {
    console.error('❌ Erro ao atualizar lead:', error);
  }
}

// ============================================================
// FUNÇÃO PARA SALVAR UM NOVO LEAD (CASO NÃO EXISTA)
// ============================================================
async function saveNewLead(session: Stripe.Checkout.Session) {
  try {
    const metadata = session.metadata || {};
    const customerEmail = session.customer_email || metadata.email || '';

    const newLead = {
      id: `lead_${Date.now()}`,
      companyName: metadata.companyName || 'Empresa não informada',
      cnpj: metadata.cnpj || '',
      contactName: metadata.contactName || '',
      contactEmail: customerEmail || metadata.contactEmail || '',
      contactPhone: metadata.contactPhone || '',
      paymentStatus: 'paid' as const,
      paymentConfirmed: true,
      stripeSessionId: session.id,
      stripeCustomerId: session.customer,
      amountTotal: session.amount_total,
      currency: session.currency,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Lê o arquivo existente ou cria novo
    let existingData = '';
    try {
      await fs.access(LEADS_FILE);
      existingData = await fs.readFile(LEADS_FILE, 'utf-8');
    } catch {
      // Arquivo não existe, será criado
    }

    const lines = existingData.split('\n').filter(line => line.trim());
    lines.push(JSON.stringify(newLead));
    await fs.writeFile(LEADS_FILE, lines.join('\n') + '\n');

    console.log(`✅ Novo lead salvo: ${newLead.id} - ${newLead.companyName}`);
  } catch (error) {
    console.error('❌ Erro ao salvar novo lead:', error);
  }
}

// ============================================================
// HANDLER PRINCIPAL DO WEBHOOK
// ============================================================
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;

  if (!sig) {
    console.error('❌ Sem assinatura Stripe');
    return res.status(400).send('Webhook Error: No signature');
  }

  let event: Stripe.Event;

  try {
    // Verificar assinatura do webhook
    event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`❌ Erro na assinatura do webhook: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`📦 Evento recebido: ${event.type} (ID: ${event.id})`);

  // ============================================================
  // PROCESSA APENAS checkout.session.completed
  // ============================================================
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    console.log(`💰 Pagamento confirmado!`);
    console.log(`📧 Cliente: ${session.customer_email}`);
    console.log(`💵 Valor: ${session.amount_total ? session.amount_total / 100 : 0} ${session.currency}`);
    console.log(`🆔 Session ID: ${session.id}`);

    // 1. Tenta atualizar lead existente
    await updateLeadPaymentStatus(session.id, 'paid');

    // 2. Se não encontrou, cria um novo lead
    // (caso o webhook chegue antes do lead ser salvo localmente)
    // Verifica se o lead existe antes de criar
    try {
      const data = await fs.readFile(LEADS_FILE, 'utf-8');
      const lines = data.split('\n').filter(line => line.trim());
      let found = false;
      for (const line of lines) {
        try {
          const lead = JSON.parse(line);
          if (lead.stripeSessionId === session.id) {
            found = true;
            break;
          }
        } catch (e) { /* ignora */ }
      }
      if (!found) {
        await saveNewLead(session);
      }
    } catch (e) {
      // Arquivo não existe, cria
      await saveNewLead(session);
    }

    // TODO: Enviar e-mail de confirmação
    // TODO: Liberar acesso ao relatório completo
    // TODO: Notificar no Zapier/Google Sheets
  }

  // ============================================================
  // EVENTO DE PAGAMENTO FALHOU
  // ============================================================
  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log(`⏰ Sessão expirada: ${session.id}`);
    await updateLeadPaymentStatus(session.id, 'failed');
  }

  // ============================================================
  // EVENTO DE PAGAMENTO CANCELADO
  // ============================================================
  if (event.type === 'checkout.session.async_payment_failed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log(`❌ Pagamento falhou: ${session.id}`);
    await updateLeadPaymentStatus(session.id, 'failed');
  }

  // Retorna sucesso para o Stripe
  res.json({ received: true });
}