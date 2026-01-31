// ========================================
// SISTEMA VALENTE - Módulo ZELO
// Gestão Inteligente de Insumos
// "Não deixar faltar o que é essencial"
// ========================================

import { PrismaClient, InventoryCategory } from '@prisma/client';

const prisma = new PrismaClient();

// ========================================
// TIPOS E INTERFACES
// ========================================

interface ConsumptionData {
  itemId: string;
  itemName: string;
  category: InventoryCategory;
  currentStock: number;
  avgDailyConsumption: number;
  estimatedDaysLeft: number;
  isLowStock: boolean;
  isCritical: boolean;
  recommendedOrder: number;
}

interface StockAlert {
  itemId: string;
  itemName: string;
  category: InventoryCategory;
  severity: 'LOW' | 'CRITICAL' | 'EMERGENCY';
  message: string;
  daysLeft: number;
  recommendedAction: string;
}

// ========================================
// CÁLCULO DE CONSUMO MÉDIO
// ========================================

/**
 * Calcula o consumo médio diário de um item
 * Baseado nos registros de requisições dos últimos 30 dias
 */
export async function calculateAverageDailyConsumption(
  itemId: string,
  schoolId: string
): Promise<number> {
  try {
    // Buscar requisições dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const requests = await prisma.inventoryRequest.findMany({
      where: {
        itemId,
        schoolId,
        status: 'DELIVERED',
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        quantity: true,
        createdAt: true,
      },
    });
    
    if (requests.length === 0) {
      // Se não houver dados, usar consumo padrão por categoria
      return getDefaultConsumptionByCategory(itemId);
    }
    
    // Calcular total consumido
    const totalConsumed = requests.reduce((sum, req) => sum + req.quantity, 0);
    
    // Calcular número de dias com dados
    const oldestRequest = requests[requests.length - 1];
    const daysWithData = Math.max(
      1,
      Math.ceil(
        (Date.now() - oldestRequest.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      )
    );
    
    // Média diária
    const avgDaily = totalConsumed / daysWithData;
    
    return Math.ceil(avgDaily); // Arredondar para cima (segurança)
  } catch (error) {
    console.error('Erro ao calcular consumo médio:', error);
    return 0;
  }
}

/**
 * Retorna consumo padrão baseado na categoria
 * Usado quando não há dados históricos
 */
async function getDefaultConsumptionByCategory(itemId: string): Promise<number> {
  const item = await prisma.inventoryItem.findUnique({
    where: { id: itemId },
    select: { category: true, name: true },
  });
  
  if (!item) return 0;
  
  // Consumo padrão por categoria (por dia)
  const defaults: Record<InventoryCategory, number> = {
    DIGNITY_CRITICAL: 50, // Fraldas, leite (alto consumo)
    HYGIENE: 20,
    FOOD: 30,
    PEDAGOGICAL: 5,
    CLEANING: 10,
    MEDICINE: 2,
  };
  
  return defaults[item.category] || 10;
}

// ========================================
// PREVISÃO DE FIM DE ESTOQUE
// ========================================

/**
 * Calcula quantos dias faltam para o estoque acabar
 */
export async function calculateEstimatedDaysLeft(
  itemId: string,
  schoolId: string
): Promise<number> {
  try {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
      select: { currentStock: true },
    });
    
    if (!item || item.currentStock === 0) {
      return 0;
    }
    
    const avgConsumption = await calculateAverageDailyConsumption(itemId, schoolId);
    
    if (avgConsumption === 0) {
      return 999; // Sem consumo = estoque "infinito"
    }
    
    const daysLeft = Math.floor(item.currentStock / avgConsumption);
    
    return Math.max(0, daysLeft);
  } catch (error) {
    console.error('Erro ao calcular dias restantes:', error);
    return 0;
  }
}

// ========================================
// ATUALIZAÇÃO AUTOMÁTICA DE ESTOQUE
// ========================================

/**
 * Atualiza os dados de consumo e alertas de todos os itens de uma escola
 * Deve ser executado diariamente via cron job
 */
export async function updateInventoryAnalytics(schoolId: string): Promise<void> {
  try {
    console.log(`[ZELO] Atualizando analytics de estoque para escola ${schoolId}...`);
    
    // Buscar todos os itens da escola
    const items = await prisma.inventoryItem.findMany({
      where: { schoolId },
      select: { id: true, category: true, minStock: true },
    });
    
    for (const item of items) {
      // Calcular consumo médio
      const avgConsumption = await calculateAverageDailyConsumption(item.id, schoolId);
      
      // Calcular dias restantes
      const daysLeft = await calculateEstimatedDaysLeft(item.id, schoolId);
      
      // Determinar alertas
      const isLowStock = daysLeft <= 7; // Menos de 1 semana
      const isCritical = daysLeft <= 3; // Menos de 3 dias
      
      // Atualizar item
      await prisma.inventoryItem.update({
        where: { id: item.id },
        data: {
          avgDailyConsumption: avgConsumption,
          estimatedDaysLeft: daysLeft,
          isLowStock,
          isCritical,
        },
      });
    }
    
    console.log(`[ZELO] Analytics atualizados: ${items.length} itens processados`);
  } catch (error) {
    console.error('[ZELO] Erro ao atualizar analytics:', error);
  }
}

// ========================================
// GERAÇÃO DE ALERTAS
// ========================================

/**
 * Gera lista de alertas de estoque crítico
 */
export async function generateStockAlerts(schoolId: string): Promise<StockAlert[]> {
  try {
    const criticalItems = await prisma.inventoryItem.findMany({
      where: {
        schoolId,
        OR: [
          { isCritical: true },
          { isLowStock: true },
        ],
      },
      orderBy: [
        { isCritical: 'desc' },
        { estimatedDaysLeft: 'asc' },
      ],
    });
    
    const alerts: StockAlert[] = criticalItems.map((item) => {
      let severity: 'LOW' | 'CRITICAL' | 'EMERGENCY' = 'LOW';
      let message = '';
      let recommendedAction = '';
      
      const daysLeft = item.estimatedDaysLeft || 0;
      
      if (daysLeft === 0) {
        severity = 'EMERGENCY';
        message = `🚨 EMERGÊNCIA: ${item.name} ESGOTADO!`;
        recommendedAction = 'Solicitar compra URGENTE ou buscar em outra unidade';
      } else if (daysLeft <= 1) {
        severity = 'EMERGENCY';
        message = `🚨 CRÍTICO: ${item.name} acabará HOJE ou AMANHÃ!`;
        recommendedAction = 'Solicitar compra urgente imediatamente';
      } else if (daysLeft <= 3) {
        severity = 'CRITICAL';
        message = `⚠️ ATENÇÃO: ${item.name} acabará em ${daysLeft} dias`;
        recommendedAction = 'Solicitar compra com urgência alta';
      } else if (daysLeft <= 7) {
        severity = 'LOW';
        message = `ℹ️ Estoque baixo: ${item.name} acabará em ${daysLeft} dias`;
        recommendedAction = 'Planejar compra para esta semana';
      }
      
      return {
        itemId: item.id,
        itemName: item.name,
        category: item.category,
        severity,
        message,
        daysLeft,
        recommendedAction,
      };
    });
    
    return alerts;
  } catch (error) {
    console.error('[ZELO] Erro ao gerar alertas:', error);
    return [];
  }
}

// ========================================
// RECOMENDAÇÃO DE PEDIDO
// ========================================

/**
 * Calcula quantidade recomendada para pedido
 * Baseado no consumo médio e tempo de reposição
 */
export async function calculateRecommendedOrder(
  itemId: string,
  schoolId: string,
  daysToRestock: number = 30 // Tempo padrão de reposição
): Promise<number> {
  try {
    const avgConsumption = await calculateAverageDailyConsumption(itemId, schoolId);
    
    // Quantidade para cobrir o período + margem de segurança (20%)
    const baseQuantity = avgConsumption * daysToRestock;
    const safetyMargin = baseQuantity * 0.2;
    
    return Math.ceil(baseQuantity + safetyMargin);
  } catch (error) {
    console.error('[ZELO] Erro ao calcular pedido recomendado:', error);
    return 0;
  }
}

// ========================================
// DASHBOARD DE ZELO
// ========================================

/**
 * Retorna dados consolidados para o dashboard do Módulo Zelo
 */
export async function getZeloDashboard(schoolId: string) {
  try {
    // Alertas críticos
    const alerts = await generateStockAlerts(schoolId);
    
    // Estatísticas gerais
    const totalItems = await prisma.inventoryItem.count({
      where: { schoolId },
    });
    
    const criticalItems = await prisma.inventoryItem.count({
      where: { schoolId, isCritical: true },
    });
    
    const lowStockItems = await prisma.inventoryItem.count({
      where: { schoolId, isLowStock: true },
    });
    
    // Itens por categoria
    const itemsByCategory = await prisma.inventoryItem.groupBy({
      by: ['category'],
      where: { schoolId },
      _count: true,
    });
    
    // Requisições pendentes
    const pendingRequests = await prisma.inventoryRequest.count({
      where: { schoolId, status: 'PENDING' },
    });
    
    // Top 5 itens mais consumidos
    const topConsumed = await prisma.inventoryItem.findMany({
      where: { schoolId },
      orderBy: { avgDailyConsumption: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        category: true,
        currentStock: true,
        avgDailyConsumption: true,
        estimatedDaysLeft: true,
      },
    });
    
    return {
      alerts,
      stats: {
        totalItems,
        criticalItems,
        lowStockItems,
        pendingRequests,
      },
      itemsByCategory,
      topConsumed,
      lastUpdate: new Date(),
    };
  } catch (error) {
    console.error('[ZELO] Erro ao gerar dashboard:', error);
    throw error;
  }
}

// ========================================
// CRON JOB: Atualização Diária
// ========================================

/**
 * Função para ser executada diariamente via cron
 * Atualiza analytics de todas as escolas
 */
export async function dailyZeloUpdate(): Promise<void> {
  try {
    console.log('[ZELO] Iniciando atualização diária...');
    
    // Buscar todas as escolas ativas
    const schools = await prisma.school.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    });
    
    for (const school of schools) {
      console.log(`[ZELO] Processando escola: ${school.name}`);
      await updateInventoryAnalytics(school.id);
      
      // Gerar alertas e logar os críticos
      const alerts = await generateStockAlerts(school.id);
      const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'EMERGENCY');
      
      if (criticalAlerts.length > 0) {
        console.warn(`[ZELO] 🚨 ${school.name}: ${criticalAlerts.length} alertas críticos!`);
        criticalAlerts.forEach(alert => {
          console.warn(`  - ${alert.message}`);
        });
        
        // TODO: Enviar notificações para diretores
        // await sendAlertNotifications(school.id, criticalAlerts);
      }
    }
    
    console.log('[ZELO] Atualização diária concluída!');
  } catch (error) {
    console.error('[ZELO] Erro na atualização diária:', error);
  }
}

// ========================================
// EXPORTAÇÕES
// ========================================

export default {
  calculateAverageDailyConsumption,
  calculateEstimatedDaysLeft,
  updateInventoryAnalytics,
  generateStockAlerts,
  calculateRecommendedOrder,
  getZeloDashboard,
  dailyZeloUpdate,
};
