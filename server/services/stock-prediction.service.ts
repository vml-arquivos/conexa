// ========================================
// SISTEMA CONEXA v1.0
// Serviço: Previsão de Estoque (Módulo ZELO)
// "Conectando Vidas"
// ========================================

import { PrismaClient, InventoryItem, StockAlertLevel, InventoryCategory } from '@prisma/client';

const prisma = new PrismaClient();

// ========================================
// TIPOS E INTERFACES
// ========================================

interface StockPrediction {
  itemId: string;
  itemName: string;
  category: InventoryCategory;
  currentQuantity: number;
  avgDailyConsumption: number;
  daysRemaining: number;
  alertLevel: StockAlertLevel;
  recommendedOrder: number;
  urgency: 'OK' | 'LOW' | 'CRITICAL' | 'EMERGENCY';
}

interface StockAlert {
  schoolId: string;
  schoolName: string;
  criticalItems: StockPrediction[];
  lowItems: StockPrediction[];
  timestamp: Date;
}

// ========================================
// CÁLCULO DE CONSUMO MÉDIO
// ========================================

/**
 * Calcula o consumo médio diário de um item nos últimos 30 dias
 * 
 * Lógica:
 * 1. Buscar histórico de movimentações (últimos 30 dias)
 * 2. Somar todas as saídas (consumo)
 * 3. Dividir pelo número de dias
 * 
 * @param itemId - ID do item
 * @returns Consumo médio diário
 */
async function calculateAvgDailyConsumption(itemId: string): Promise<number> {
  // TODO: Implementar tabela de movimentações de estoque
  // Por enquanto, vamos usar uma estimativa baseada na categoria
  
  const item = await prisma.inventoryItem.findUnique({
    where: { id: itemId },
  });
  
  if (!item) return 0;
  
  // Estimativas por categoria (consumo diário médio por criança)
  const consumptionByCategory: Record<InventoryCategory, number> = {
    DIGNITY_CRITICAL: 5,  // 5 fraldas/dia por criança
    HYGIENE: 2,           // 2 lenços/dia
    FOOD: 0.5,            // 0.5kg alimento/dia
    PEDAGOGICAL: 0.1,     // 0.1 material/dia
    CLEANING: 0.05,       // 0.05 produto/dia
    MEDICINE: 0.01,       // 0.01 medicamento/dia
  };
  
  // Assumir 20 crianças por unidade (média)
  const avgChildrenPerSchool = 20;
  const dailyConsumption = consumptionByCategory[item.category] * avgChildrenPerSchool;
  
  return dailyConsumption;
}

/**
 * Calcula os dias restantes de estoque
 * 
 * @param currentQuantity - Quantidade atual
 * @param avgDailyConsumption - Consumo médio diário
 * @returns Dias restantes
 */
function calculateDaysRemaining(currentQuantity: number, avgDailyConsumption: number): number {
  if (avgDailyConsumption === 0) return 999; // Sem consumo = estoque infinito
  return Math.floor(currentQuantity / avgDailyConsumption);
}

/**
 * Determina o nível de alerta baseado nos dias restantes
 * 
 * @param daysRemaining - Dias restantes
 * @param category - Categoria do item
 * @returns Nível de alerta
 */
function determineAlertLevel(daysRemaining: number, category: InventoryCategory): StockAlertLevel {
  // Itens críticos (DIGNITY_CRITICAL) têm limites mais rigorosos
  if (category === 'DIGNITY_CRITICAL') {
    if (daysRemaining < 1) return 'EMERGENCY';
    if (daysRemaining < 3) return 'CRITICAL';
    if (daysRemaining < 7) return 'LOW';
    return 'OK';
  }
  
  // Outros itens
  if (daysRemaining < 2) return 'EMERGENCY';
  if (daysRemaining < 5) return 'CRITICAL';
  if (daysRemaining < 10) return 'LOW';
  return 'OK';
}

/**
 * Calcula a quantidade recomendada para pedido
 * 
 * Lógica:
 * - Pedido deve cobrir 30 dias de consumo
 * - Subtrair quantidade atual
 * - Adicionar margem de segurança (20%)
 * 
 * @param avgDailyConsumption - Consumo médio diário
 * @param currentQuantity - Quantidade atual
 * @returns Quantidade recomendada
 */
function calculateRecommendedOrder(avgDailyConsumption: number, currentQuantity: number): number {
  const daysToStock = 30; // Estocar para 30 dias
  const safetyMargin = 1.2; // Margem de 20%
  
  const targetQuantity = avgDailyConsumption * daysToStock * safetyMargin;
  const orderQuantity = Math.max(0, targetQuantity - currentQuantity);
  
  return Math.ceil(orderQuantity);
}

// ========================================
// ATUALIZAÇÃO DE PREVISÕES
// ========================================

/**
 * Atualiza a previsão de estoque de um item específico
 * 
 * @param itemId - ID do item
 * @returns Previsão atualizada
 */
export async function updateItemPrediction(itemId: string): Promise<StockPrediction> {
  const item = await prisma.inventoryItem.findUnique({
    where: { id: itemId },
  });
  
  if (!item) {
    throw new Error(`Item ${itemId} não encontrado`);
  }
  
  // Calcular métricas
  const avgDailyConsumption = await calculateAvgDailyConsumption(itemId);
  const daysRemaining = calculateDaysRemaining(item.quantity, avgDailyConsumption);
  const alertLevel = determineAlertLevel(daysRemaining, item.category);
  const recommendedOrder = calculateRecommendedOrder(avgDailyConsumption, item.quantity);
  
  // Atualizar no banco
  const updatedItem = await prisma.inventoryItem.update({
    where: { id: itemId },
    data: {
      avgDailyConsumption,
      daysRemaining,
      alertLevel,
      lastUpdated: new Date(),
    },
  });
  
  return {
    itemId: updatedItem.id,
    itemName: updatedItem.name,
    category: updatedItem.category,
    currentQuantity: updatedItem.quantity,
    avgDailyConsumption,
    daysRemaining,
    alertLevel,
    recommendedOrder,
    urgency: alertLevel,
  };
}

/**
 * Atualiza as previsões de todos os itens de uma unidade
 * 
 * @param schoolId - ID da unidade
 * @returns Lista de previsões
 */
export async function updateSchoolPredictions(schoolId: string): Promise<StockPrediction[]> {
  const items = await prisma.inventoryItem.findMany({
    where: { schoolId },
  });
  
  const predictions: StockPrediction[] = [];
  
  for (const item of items) {
    const prediction = await updateItemPrediction(item.id);
    predictions.push(prediction);
  }
  
  return predictions;
}

/**
 * Atualiza as previsões de TODAS as unidades da rede
 * 
 * @returns Mapa de previsões por unidade
 */
export async function updateAllPredictions(): Promise<Map<string, StockPrediction[]>> {
  const schools = await prisma.school.findMany();
  const predictionsBySchool = new Map<string, StockPrediction[]>();
  
  for (const school of schools) {
    const predictions = await updateSchoolPredictions(school.id);
    predictionsBySchool.set(school.id, predictions);
  }
  
  return predictionsBySchool;
}

// ========================================
// ALERTAS E NOTIFICAÇÕES
// ========================================

/**
 * Busca itens com alerta crítico ou emergência
 * 
 * @param schoolId - ID da unidade (opcional, se não informado busca todas)
 * @returns Lista de alertas
 */
export async function getCriticalAlerts(schoolId?: string): Promise<StockAlert[]> {
  const schools = schoolId
    ? await prisma.school.findMany({ where: { id: schoolId } })
    : await prisma.school.findMany();
  
  const alerts: StockAlert[] = [];
  
  for (const school of schools) {
    const criticalItems = await prisma.inventoryItem.findMany({
      where: {
        schoolId: school.id,
        alertLevel: { in: ['CRITICAL', 'EMERGENCY'] },
      },
    });
    
    const lowItems = await prisma.inventoryItem.findMany({
      where: {
        schoolId: school.id,
        alertLevel: 'LOW',
      },
    });
    
    if (criticalItems.length > 0 || lowItems.length > 0) {
      alerts.push({
        schoolId: school.id,
        schoolName: school.name,
        criticalItems: criticalItems.map(item => ({
          itemId: item.id,
          itemName: item.name,
          category: item.category,
          currentQuantity: item.quantity,
          avgDailyConsumption: Number(item.avgDailyConsumption || 0),
          daysRemaining: item.daysRemaining || 0,
          alertLevel: item.alertLevel,
          recommendedOrder: 0, // Calcular depois
          urgency: item.alertLevel,
        })),
        lowItems: lowItems.map(item => ({
          itemId: item.id,
          itemName: item.name,
          category: item.category,
          currentQuantity: item.quantity,
          avgDailyConsumption: Number(item.avgDailyConsumption || 0),
          daysRemaining: item.daysRemaining || 0,
          alertLevel: item.alertLevel,
          recommendedOrder: 0,
          urgency: item.alertLevel,
        })),
        timestamp: new Date(),
      });
    }
  }
  
  return alerts;
}

/**
 * Envia notificações para MATRIZ_ADMIN e UNIT_DIRECTOR
 * 
 * @param alerts - Lista de alertas
 */
export async function sendStockAlerts(alerts: StockAlert[]): Promise<void> {
  // TODO: Implementar envio de e-mail/SMS
  
  for (const alert of alerts) {
    console.log(`
🚨 ALERTA DE ESTOQUE - ${alert.schoolName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ ITENS CRÍTICOS (${alert.criticalItems.length}):
${alert.criticalItems.map(item => 
  `  • ${item.itemName}: ${item.currentQuantity} ${item.category} (${item.daysRemaining} dias restantes)`
).join('\n')}

⚡ ITENS BAIXOS (${alert.lowItems.length}):
${alert.lowItems.map(item => 
  `  • ${item.itemName}: ${item.currentQuantity} ${item.category} (${item.daysRemaining} dias restantes)`
).join('\n')}

Data: ${alert.timestamp.toLocaleString('pt-BR')}
    `);
    
    // Marcar alerta como enviado
    for (const item of [...alert.criticalItems, ...alert.lowItems]) {
      await prisma.inventoryItem.update({
        where: { id: item.itemId },
        data: { lastAlertSent: new Date() },
      });
    }
  }
}

// ========================================
// DASHBOARD E RELATÓRIOS
// ========================================

/**
 * Gera dashboard de estoque para uma unidade
 * 
 * @param schoolId - ID da unidade
 * @returns Dashboard completo
 */
export async function getStockDashboard(schoolId: string) {
  const items = await prisma.inventoryItem.findMany({
    where: { schoolId },
    orderBy: { alertLevel: 'desc' },
  });
  
  const summary = {
    total: items.length,
    ok: items.filter(i => i.alertLevel === 'OK').length,
    low: items.filter(i => i.alertLevel === 'LOW').length,
    critical: items.filter(i => i.alertLevel === 'CRITICAL').length,
    emergency: items.filter(i => i.alertLevel === 'EMERGENCY').length,
  };
  
  const byCategory = {
    DIGNITY_CRITICAL: items.filter(i => i.category === 'DIGNITY_CRITICAL'),
    HYGIENE: items.filter(i => i.category === 'HYGIENE'),
    FOOD: items.filter(i => i.category === 'FOOD'),
    PEDAGOGICAL: items.filter(i => i.category === 'PEDAGOGICAL'),
    CLEANING: items.filter(i => i.category === 'CLEANING'),
    MEDICINE: items.filter(i => i.category === 'MEDICINE'),
  };
  
  return {
    schoolId,
    summary,
    byCategory,
    items,
    lastUpdate: new Date(),
  };
}

// ========================================
// CRON JOB (Atualização Diária)
// ========================================

/**
 * Cron job diário: Atualiza previsões e envia alertas
 * 
 * Executar todos os dias às 2h da manhã:
 * 0 2 * * * node -e "require('./services/stock-prediction.service').dailyStockUpdate()"
 */
export async function dailyStockUpdate(): Promise<void> {
  console.log(`[ZELO] Iniciando atualização diária de estoque - ${new Date().toISOString()}`);
  
  try {
    // 1. Atualizar previsões de todas as unidades
    await updateAllPredictions();
    console.log('[ZELO] ✅ Previsões atualizadas');
    
    // 2. Buscar alertas críticos
    const alerts = await getCriticalAlerts();
    console.log(`[ZELO] ⚠️ ${alerts.length} unidades com alertas`);
    
    // 3. Enviar notificações
    if (alerts.length > 0) {
      await sendStockAlerts(alerts);
      console.log('[ZELO] 📧 Notificações enviadas');
    }
    
    console.log('[ZELO] ✅ Atualização diária concluída');
  } catch (error) {
    console.error('[ZELO] ❌ Erro na atualização diária:', error);
    throw error;
  }
}

// ========================================
// EXPORTAÇÕES
// ========================================

export default {
  updateItemPrediction,
  updateSchoolPredictions,
  updateAllPredictions,
  getCriticalAlerts,
  sendStockAlerts,
  getStockDashboard,
  dailyStockUpdate,
};
