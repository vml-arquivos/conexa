// ========================================
// SISTEMA CONEXA v1.0
// Serviço: IA Mentora (Sugestões BNCC)
// "Conectando Vidas"
// ========================================

import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ========================================
// TIPOS E INTERFACES
// ========================================

interface ClassContext {
  classId: string;
  className: string;
  ageRange: string;
  studentCount: number;
  mood: 'CALMO' | 'AGITADO' | 'MISTO';
  recentActivities: string[];
  observations: string;
}

interface ActivitySuggestion {
  title: string;
  bnccField: string;
  bnccFieldCode: string;
  description: string;
  duration: number; // minutos
  materials: string[];
  objectives: string[];
  ageRange: string;
  aiGenerated: boolean;
}

interface DevelopmentAlert {
  studentId: string;
  studentName: string;
  alertType: 'ALIMENTACAO' | 'SONO' | 'COMPORTAMENTO' | 'HUMOR';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
  recommendation: string;
  notifyPsychologist: boolean;
}

// ========================================
// SUGESTÕES DE ATIVIDADES BNCC
// ========================================

/**
 * Sugere atividades BNCC baseadas no contexto da turma
 * 
 * @param context - Contexto da turma
 * @returns Lista de sugestões
 */
export async function suggestActivities(context: ClassContext): Promise<ActivitySuggestion[]> {
  // 1. Buscar atividades do banco BNCC
  const bnccActivities = await prisma.bNCCPlanning.findMany({
    where: {
      ageRange: context.ageRange,
    },
    include: {
      bnccField: true,
    },
    take: 3,
  });
  
  // 2. Gerar sugestões com IA (OpenAI)
  const aiSuggestions = await generateAISuggestions(context);
  
  // 3. Combinar sugestões
  const suggestions: ActivitySuggestion[] = [
    ...bnccActivities.map(activity => ({
      title: activity.title,
      bnccField: activity.bnccField.name,
      bnccFieldCode: activity.bnccField.code,
      description: activity.description,
      duration: activity.duration,
      materials: activity.materials as string[] || [],
      objectives: ['Desenvolver habilidades socioemocionais', 'Estimular criatividade'],
      ageRange: activity.ageRange,
      aiGenerated: activity.aiGenerated,
    })),
    ...aiSuggestions,
  ];
  
  return suggestions.slice(0, 5); // Retornar top 5
}

/**
 * Gera sugestões de atividades usando OpenAI
 */
async function generateAISuggestions(context: ClassContext): Promise<ActivitySuggestion[]> {
  const prompt = `
Você é uma especialista em educação infantil e BNCC (Base Nacional Comum Curricular).

Contexto da turma:
- Nome: ${context.className}
- Faixa etária: ${context.ageRange}
- Número de crianças: ${context.studentCount}
- Humor atual: ${context.mood}
- Atividades recentes: ${context.recentActivities.join(', ')}
- Observações: ${context.observations}

Sugira 2 atividades pedagógicas adequadas para esta turma, considerando:
1. O humor atual das crianças
2. A faixa etária
3. Os 5 Campos de Experiência da BNCC:
   - CE01: O eu, o outro e o nós
   - CE02: Corpo, gestos e movimentos
   - CE03: Traços, sons, cores e formas
   - CE04: Escuta, fala, pensamento e imaginação
   - CE05: Espaços, tempos, quantidades, relações e transformações

Formato da resposta (JSON):
[
  {
    "title": "Título da atividade",
    "bnccField": "Nome do campo de experiência",
    "bnccFieldCode": "CE01, CE02, etc",
    "description": "Descrição detalhada da atividade",
    "duration": 30,
    "materials": ["Material 1", "Material 2"],
    "objectives": ["Objetivo 1", "Objetivo 2"]
  }
]
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Você é uma especialista em educação infantil e BNCC. Responda sempre em JSON válido.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    const content = response.choices[0].message.content || '[]';
    const suggestions = JSON.parse(content);
    
    return suggestions.map((s: any) => ({
      ...s,
      ageRange: context.ageRange,
      aiGenerated: true,
    }));
  } catch (error) {
    console.error('[IA MENTORA] Erro ao gerar sugestões:', error);
    return [];
  }
}

/**
 * Salva sugestão de atividade no banco
 */
export async function saveActivitySuggestion(
  suggestion: ActivitySuggestion,
  classId: string,
  schoolId: string
): Promise<void> {
  // Buscar ou criar campo BNCC
  let bnccField = await prisma.bNCCField.findUnique({
    where: { code: suggestion.bnccFieldCode },
  });
  
  if (!bnccField) {
    bnccField = await prisma.bNCCField.create({
      data: {
        code: suggestion.bnccFieldCode,
        name: suggestion.bnccField,
        description: suggestion.description,
        objectives: {},
      },
    });
  }
  
  // Salvar planejamento
  await prisma.bNCCPlanning.create({
    data: {
      title: suggestion.title,
      description: suggestion.description,
      ageRange: suggestion.ageRange,
      duration: suggestion.duration,
      materials: suggestion.materials,
      bnccFieldId: bnccField.id,
      schoolId,
      classId,
      aiGenerated: suggestion.aiGenerated,
      aiContext: JSON.stringify({
        mood: 'context',
        observations: 'Generated by AI Mentor',
      }),
    },
  });
}

// ========================================
// ANÁLISE DE DESENVOLVIMENTO
// ========================================

/**
 * Analisa DailyLogs e gera alertas de desenvolvimento
 * 
 * @param studentId - ID do aluno
 * @param days - Número de dias para análise (padrão: 7)
 * @returns Lista de alertas
 */
export async function analyzeDevelopment(studentId: string, days: number = 7): Promise<DevelopmentAlert[]> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      dailyLogs: {
        where: {
          date: {
            gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { date: 'desc' },
      },
    },
  });
  
  if (!student) {
    throw new Error(`Aluno ${studentId} não encontrado`);
  }
  
  const alerts: DevelopmentAlert[] = [];
  
  // 1. Análise de Alimentação
  const refusedMeals = student.dailyLogs.filter(
    log => log.lunch === 'RECUSOU' || log.breakfast === 'RECUSOU'
  ).length;
  
  if (refusedMeals >= 3) {
    alerts.push({
      studentId: student.id,
      studentName: student.name,
      alertType: 'ALIMENTACAO',
      severity: refusedMeals >= 5 ? 'HIGH' : 'MEDIUM',
      message: `${student.name} recusou ${refusedMeals} refeições nos últimos ${days} dias`,
      recommendation: 'Investigar possíveis causas (saúde, preferências, ambiente)',
      notifyPsychologist: refusedMeals >= 5,
    });
  }
  
  // 2. Análise de Sono
  const badSleep = student.dailyLogs.filter(
    log => log.sleepQuality === 'AGITADO' || log.sleepQuality === 'NAO_DORMIU'
  ).length;
  
  if (badSleep >= 4) {
    alerts.push({
      studentId: student.id,
      studentName: student.name,
      alertType: 'SONO',
      severity: badSleep >= 6 ? 'HIGH' : 'MEDIUM',
      message: `${student.name} teve sono irregular em ${badSleep} dias nos últimos ${days} dias`,
      recommendation: 'Conversar com responsáveis sobre rotina de sono em casa',
      notifyPsychologist: badSleep >= 6,
    });
  }
  
  // 3. Análise de Humor
  const sadMood = student.dailyLogs.filter(log => log.mood === 'TRISTE').length;
  
  if (sadMood >= 3) {
    alerts.push({
      studentId: student.id,
      studentName: student.name,
      alertType: 'HUMOR',
      severity: sadMood >= 5 ? 'HIGH' : 'MEDIUM',
      message: `${student.name} apresentou humor triste em ${sadMood} dias nos últimos ${days} dias`,
      recommendation: 'Acompanhamento psicológico recomendado',
      notifyPsychologist: true,
    });
  }
  
  // 4. Análise de Comportamento
  const agitatedMood = student.dailyLogs.filter(log => log.mood === 'AGITADO').length;
  
  if (agitatedMood >= 5) {
    alerts.push({
      studentId: student.id,
      studentName: student.name,
      alertType: 'COMPORTAMENTO',
      severity: 'MEDIUM',
      message: `${student.name} apresentou comportamento agitado em ${agitatedMood} dias nos últimos ${days} dias`,
      recommendation: 'Atividades de relaxamento e conversa com responsáveis',
      notifyPsychologist: agitatedMood >= 7,
    });
  }
  
  return alerts;
}

/**
 * Notifica MATRIZ_PSYCHO sobre alertas críticos
 */
export async function notifyPsychologist(alerts: DevelopmentAlert[]): Promise<void> {
  const criticalAlerts = alerts.filter(a => a.notifyPsychologist);
  
  if (criticalAlerts.length === 0) return;
  
  // TODO: Implementar envio de e-mail
  
  console.log(`
🧠 ALERTA PARA PSICÓLOGA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${criticalAlerts.length} criança(s) requerem acompanhamento psicológico:

${criticalAlerts.map(alert => `
📌 ${alert.studentName}
   Tipo: ${alert.alertType}
   Gravidade: ${alert.severity}
   Mensagem: ${alert.message}
   Recomendação: ${alert.recommendation}
`).join('\n')}

Data: ${new Date().toLocaleString('pt-BR')}
  `);
}

// ========================================
// CRON JOB (Análise Semanal)
// ========================================

/**
 * Cron job semanal: Analisa desenvolvimento de todas as crianças
 * 
 * Executar toda segunda-feira às 3h:
 * 0 3 * * 1 node -e "require('./services/ai-mentor.service').weeklyDevelopmentAnalysis()"
 */
export async function weeklyDevelopmentAnalysis(): Promise<void> {
  console.log(`[IA MENTORA] Iniciando análise semanal - ${new Date().toISOString()}`);
  
  try {
    const students = await prisma.student.findMany({
      where: { status: 'ACTIVE' },
    });
    
    const allAlerts: DevelopmentAlert[] = [];
    
    for (const student of students) {
      const alerts = await analyzeDevelopment(student.id, 7);
      allAlerts.push(...alerts);
    }
    
    console.log(`[IA MENTORA] ${allAlerts.length} alertas gerados`);
    
    // Notificar psicóloga
    await notifyPsychologist(allAlerts);
    
    console.log('[IA MENTORA] ✅ Análise semanal concluída');
  } catch (error) {
    console.error('[IA MENTORA] ❌ Erro na análise semanal:', error);
    throw error;
  }
}

// ========================================
// EXPORTAÇÕES
// ========================================

export default {
  suggestActivities,
  saveActivitySuggestion,
  analyzeDevelopment,
  notifyPsychologist,
  weeklyDevelopmentAnalysis,
};
