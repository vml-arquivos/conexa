// ========================================
// SISTEMA VALENTE - Módulo SUPER PEDAGOGO
// IA Mentora para Educação Infantil (BNCC)
// "Sugestões pedagógicas personalizadas e alertas de desenvolvimento"
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

interface ActivitySuggestion {
  title: string;
  description: string;
  bnccField: string;
  bnccCode: string;
  objectives: string[];
  materials: string[];
  duration: number;
  ageGroup: string;
  aiGenerated: true;
  prompt: string;
}

interface DevelopmentAlert {
  studentId: string;
  studentName: string;
  alertType: 'BEHAVIORAL' | 'FEEDING' | 'SLEEP' | 'SOCIAL' | 'MOTOR';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
  observations: string[];
  recommendation: string;
  shouldNotifyPsychologist: boolean;
}

interface StudentProfile {
  studentId: string;
  name: string;
  age: number;
  recentLogs: any[];
  patterns: {
    feeding: string;
    sleep: string;
    behavior: string;
    mood: string;
  };
}

// ========================================
// CAMPOS DE EXPERIÊNCIA BNCC
// ========================================

const BNCC_FIELDS = {
  CE01: {
    code: 'CE01',
    name: 'O eu, o outro e o nós',
    description: 'Construção da identidade e das relações',
    keywords: ['identidade', 'autonomia', 'relações', 'convivência', 'respeito'],
  },
  CE02: {
    code: 'CE02',
    name: 'Corpo, gestos e movimentos',
    description: 'Exploração do corpo e movimento',
    keywords: ['corpo', 'movimento', 'coordenação', 'expressão', 'psicomotricidade'],
  },
  CE03: {
    code: 'CE03',
    name: 'Traços, sons, cores e formas',
    description: 'Expressão artística e criatividade',
    keywords: ['arte', 'música', 'pintura', 'criatividade', 'expressão'],
  },
  CE04: {
    code: 'CE04',
    name: 'Escuta, fala, pensamento e imaginação',
    description: 'Linguagem oral e escrita',
    keywords: ['linguagem', 'comunicação', 'histórias', 'imaginação', 'oralidade'],
  },
  CE05: {
    code: 'CE05',
    name: 'Espaços, tempos, quantidades, relações e transformações',
    description: 'Exploração do mundo físico e social',
    keywords: ['natureza', 'ciências', 'matemática', 'espaço', 'tempo'],
  },
};

// ========================================
// GERAÇÃO DE ATIVIDADES COM IA
// ========================================

/**
 * Gera sugestão de atividade pedagógica usando IA
 * Alinhada com BNCC e personalizada para a turma
 */
export async function generateActivitySuggestion(
  classId: string,
  bnccFieldCode?: string
): Promise<ActivitySuggestion | null> {
  try {
    // Buscar informações da turma
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        students: {
          take: 5,
          select: {
            name: true,
            birthDate: true,
            specialNeeds: true,
          },
        },
      },
    });
    
    if (!classData) {
      throw new Error('Turma não encontrada');
    }
    
    // Selecionar campo de experiência (aleatório se não especificado)
    const selectedField = bnccFieldCode 
      ? BNCC_FIELDS[bnccFieldCode as keyof typeof BNCC_FIELDS]
      : Object.values(BNCC_FIELDS)[Math.floor(Math.random() * 5)];
    
    // Construir prompt para a IA
    const prompt = `
Você é uma pedagoga especialista em Educação Infantil (0-4 anos) e na BNCC.

CONTEXTO:
- Turma: ${classData.name} (${classData.ageGroup})
- Nível: ${classData.level}
- Número de crianças: ${classData.currentSize}
- Turno: ${classData.shift || 'Integral'}

CAMPO DE EXPERIÊNCIA BNCC:
- Código: ${selectedField.code}
- Nome: ${selectedField.name}
- Descrição: ${selectedField.description}

TAREFA:
Crie uma atividade pedagógica criativa, lúdica e adequada para essa faixa etária.

FORMATO DE RESPOSTA (JSON):
{
  "title": "Título da atividade",
  "description": "Descrição detalhada (2-3 parágrafos)",
  "objectives": ["Objetivo 1", "Objetivo 2", "Objetivo 3"],
  "materials": ["Material 1", "Material 2"],
  "duration": 45,
  "stepByStep": ["Passo 1", "Passo 2", "Passo 3"]
}

IMPORTANTE:
- Use linguagem simples e acessível
- Considere materiais de baixo custo
- Inclua adaptações para crianças com necessidades especiais
- Seja criativa e engajadora
`;

    // Chamar OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Você é uma pedagoga especialista em Educação Infantil e BNCC. Responda sempre em JSON válido.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });
    
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('IA não retornou resposta');
    }
    
    const activityData = JSON.parse(content);
    
    // Montar objeto de retorno
    const suggestion: ActivitySuggestion = {
      title: activityData.title,
      description: activityData.description,
      bnccField: selectedField.name,
      bnccCode: selectedField.code,
      objectives: activityData.objectives || [],
      materials: activityData.materials || [],
      duration: activityData.duration || 45,
      ageGroup: classData.ageGroup,
      aiGenerated: true,
      prompt,
    };
    
    return suggestion;
  } catch (error) {
    console.error('[SUPER PEDAGOGO] Erro ao gerar atividade:', error);
    return null;
  }
}

// ========================================
// ANÁLISE DE DESENVOLVIMENTO
// ========================================

/**
 * Analisa os registros diários de uma criança
 * Identifica padrões preocupantes e gera alertas
 */
export async function analyzeDevelopment(
  studentId: string
): Promise<DevelopmentAlert[]> {
  try {
    // Buscar registros dos últimos 14 dias
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        name: true,
        birthDate: true,
      },
    });
    
    if (!student) {
      throw new Error('Aluno não encontrado');
    }
    
    const logs = await prisma.dailyLog.findMany({
      where: {
        studentId,
        date: {
          gte: fourteenDaysAgo,
        },
      },
      orderBy: { date: 'desc' },
    });
    
    if (logs.length < 3) {
      return []; // Poucos dados para análise
    }
    
    const alerts: DevelopmentAlert[] = [];
    
    // ANÁLISE 1: Alimentação
    const refusedMeals = logs.filter(
      log => log.lunch === 'Recusou' || log.breakfast === 'Recusou'
    );
    
    if (refusedMeals.length >= 3) {
      alerts.push({
        studentId,
        studentName: student.name,
        alertType: 'FEEDING',
        severity: 'MEDIUM',
        message: `${student.name} recusou alimentação em ${refusedMeals.length} dos últimos ${logs.length} dias`,
        observations: refusedMeals.map(log => 
          `${log.date.toLocaleDateString()}: ${log.observations || 'Sem observações'}`
        ),
        recommendation: 'Investigar possíveis causas (doença, preferências, ambiente). Conversar com responsáveis.',
        shouldNotifyPsychologist: refusedMeals.length >= 5,
      });
    }
    
    // ANÁLISE 2: Sono
    const poorSleep = logs.filter(
      log => log.napQuality === 'Agitado' || log.napQuality === 'Não dormiu'
    );
    
    if (poorSleep.length >= 4) {
      alerts.push({
        studentId,
        studentName: student.name,
        alertType: 'SLEEP',
        severity: 'MEDIUM',
        message: `${student.name} apresenta sono irregular em ${poorSleep.length} dos últimos ${logs.length} dias`,
        observations: poorSleep.map(log => 
          `${log.date.toLocaleDateString()}: ${log.napQuality} (${log.napDuration || 0} min)`
        ),
        recommendation: 'Verificar rotina de sono em casa. Avaliar ambiente da sala (barulho, luz).',
        shouldNotifyPsychologist: poorSleep.length >= 7,
      });
    }
    
    // ANÁLISE 3: Comportamento
    const behaviorIssues = logs.filter(
      log => log.behavior === 'Isolado' || log.behavior === 'Agressivo'
    );
    
    if (behaviorIssues.length >= 3) {
      const severity = behaviorIssues.length >= 5 ? 'HIGH' : 'MEDIUM';
      
      alerts.push({
        studentId,
        studentName: student.name,
        alertType: 'BEHAVIORAL',
        severity,
        message: `${student.name} apresenta comportamento atípico em ${behaviorIssues.length} dos últimos ${logs.length} dias`,
        observations: behaviorIssues.map(log => 
          `${log.date.toLocaleDateString()}: ${log.behavior} - ${log.mood}`
        ),
        recommendation: 'Encaminhar para avaliação psicológica. Conversar com família sobre mudanças em casa.',
        shouldNotifyPsychologist: true,
      });
    }
    
    // ANÁLISE 4: Humor
    const negativeM ood = logs.filter(
      log => log.mood === 'Choroso' || log.mood === 'Irritado' || log.mood === 'Apático'
    );
    
    if (negativeM ood.length >= 5) {
      alerts.push({
        studentId,
        studentName: student.name,
        alertType: 'SOCIAL',
        severity: 'MEDIUM',
        message: `${student.name} apresenta humor negativo persistente`,
        observations: negativeM ood.map(log => 
          `${log.date.toLocaleDateString()}: ${log.mood}`
        ),
        recommendation: 'Investigar causas emocionais. Avaliar relação com colegas e professores.',
        shouldNotifyPsychologist: negativeM ood.length >= 7,
      });
    }
    
    return alerts;
  } catch (error) {
    console.error('[SUPER PEDAGOGO] Erro ao analisar desenvolvimento:', error);
    return [];
  }
}

// ========================================
// NOTIFICAÇÃO AUTOMÁTICA PARA PSICÓLOGA
// ========================================

/**
 * Notifica MATRIZ_PSYCHO sobre alertas críticos
 */
export async function notifyPsychologist(
  alerts: DevelopmentAlert[]
): Promise<void> {
  try {
    const criticalAlerts = alerts.filter(a => a.shouldNotifyPsychologist);
    
    if (criticalAlerts.length === 0) {
      return;
    }
    
    // Buscar psicólogas ativas
    const psychologists = await prisma.user.findMany({
      where: {
        role: 'MATRIZ_PSYCHO',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
    
    for (const psychologist of psychologists) {
      console.log(`[SUPER PEDAGOGO] 📧 Notificando ${psychologist.name}:`);
      
      for (const alert of criticalAlerts) {
        console.log(`  - ${alert.message}`);
        
        // TODO: Enviar e-mail ou notificação no sistema
        // await sendEmail({
        //   to: psychologist.email,
        //   subject: `Alerta de Desenvolvimento: ${alert.studentName}`,
        //   body: `...`,
        // });
      }
    }
  } catch (error) {
    console.error('[SUPER PEDAGOGO] Erro ao notificar psicóloga:', error);
  }
}

// ========================================
// ANÁLISE EM MASSA (CRON JOB)
// ========================================

/**
 * Analisa desenvolvimento de todos os alunos ativos
 * Deve ser executado semanalmente
 */
export async function weeklyDevelopmentAnalysis(): Promise<void> {
  try {
    console.log('[SUPER PEDAGOGO] Iniciando análise semanal de desenvolvimento...');
    
    // Buscar todos os alunos ativos
    const students = await prisma.student.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, schoolId: true },
    });
    
    let totalAlerts = 0;
    const allAlerts: DevelopmentAlert[] = [];
    
    for (const student of students) {
      const alerts = await analyzeDevelopment(student.id);
      
      if (alerts.length > 0) {
        totalAlerts += alerts.length;
        allAlerts.push(...alerts);
        
        console.log(`[SUPER PEDAGOGO] ⚠️ ${student.name}: ${alerts.length} alertas`);
      }
    }
    
    // Notificar psicóloga sobre alertas críticos
    await notifyPsychologist(allAlerts);
    
    console.log(`[SUPER PEDAGOGO] Análise concluída: ${totalAlerts} alertas em ${students.length} alunos`);
  } catch (error) {
    console.error('[SUPER PEDAGOGO] Erro na análise semanal:', error);
  }
}

// ========================================
// EXPORTAÇÕES
// ========================================

export default {
  generateActivitySuggestion,
  analyzeDevelopment,
  notifyPsychologist,
  weeklyDevelopmentAnalysis,
};
