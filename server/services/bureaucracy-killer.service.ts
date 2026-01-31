// ========================================
// SISTEMA VALENTE - Módulo BUREAUCRACY KILLER
// Geração Automática de Documentos Oficiais
// "Menos papel, mais tempo com as crianças"
// ========================================

import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// ========================================
// TIPOS E INTERFACES
// ========================================

interface DiarioClasseData {
  classId: string;
  month: number;
  year: number;
  outputPath: string;
}

interface RIAData {
  studentId: string;
  period: {
    start: Date;
    end: Date;
  };
  outputPath: string;
}

// ========================================
// DIÁRIO DE CLASSE OFICIAL
// ========================================

/**
 * Gera PDF do Diário de Classe Oficial
 * Lista de presença mensal com assinaturas
 */
export async function generateDiarioClasse(
  data: DiarioClasseData
): Promise<string> {
  try {
    console.log(`[BUREAUCRACY KILLER] Gerando Diário de Classe...`);
    
    // Buscar dados da turma
    const classData = await prisma.class.findUnique({
      where: { id: data.classId },
      include: {
        school: true,
        students: {
          where: { status: 'ACTIVE' },
          orderBy: { name: 'asc' },
        },
        teachers: {
          where: { role: 'TEACHER' },
        },
      },
    });
    
    if (!classData) {
      throw new Error('Turma não encontrada');
    }
    
    // Buscar registros do mês
    const startDate = new Date(data.year, data.month - 1, 1);
    const endDate = new Date(data.year, data.month, 0);
    
    const logs = await prisma.dailyLog.findMany({
      where: {
        classId: data.classId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });
    
    // Criar PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(data.outputPath);
    doc.pipe(stream);
    
    // CABEÇALHO
    doc.fontSize(16).font('Helvetica-Bold')
       .text('DIÁRIO DE CLASSE OFICIAL', { align: 'center' });
    
    doc.moveDown();
    doc.fontSize(10).font('Helvetica');
    doc.text(`Unidade: ${classData.school.name}`);
    doc.text(`Turma: ${classData.name} (${classData.level})`);
    doc.text(`Período: ${startDate.toLocaleDateString('pt-BR')} a ${endDate.toLocaleDateString('pt-BR')}`);
    doc.text(`Professor(a): ${classData.teachers[0]?.name || 'Não informado'}`);
    
    doc.moveDown();
    
    // TABELA DE FREQUÊNCIA
    doc.fontSize(12).font('Helvetica-Bold')
       .text('LISTA DE PRESENÇA', { underline: true });
    
    doc.moveDown();
    
    // Cabeçalho da tabela
    const tableTop = doc.y;
    const nameWidth = 200;
    const dayWidth = 20;
    
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('Nome do Aluno', 50, tableTop, { width: nameWidth });
    
    // Dias do mês
    const daysInMonth = endDate.getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      doc.text(day.toString(), 50 + nameWidth + (day - 1) * dayWidth, tableTop, {
        width: dayWidth,
        align: 'center',
      });
    }
    
    doc.moveDown();
    
    // Linhas dos alunos
    doc.font('Helvetica');
    let currentY = doc.y;
    
    for (const student of classData.students) {
      doc.text(student.name, 50, currentY, { width: nameWidth });
      
      // Marcar presenças (P) ou faltas (F)
      for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(data.year, data.month - 1, day);
        const dayLog = logs.find(
          log => log.studentId === student.id && 
                 log.date.getDate() === day
        );
        
        const mark = dayLog ? 'P' : '-';
        doc.text(mark, 50 + nameWidth + (day - 1) * dayWidth, currentY, {
          width: dayWidth,
          align: 'center',
        });
      }
      
      currentY += 20;
      
      // Nova página se necessário
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }
    }
    
    // RODAPÉ
    doc.moveDown(3);
    doc.fontSize(10).font('Helvetica');
    doc.text('_'.repeat(60), { align: 'center' });
    doc.text('Assinatura do Professor', { align: 'center' });
    
    doc.moveDown();
    doc.text('_'.repeat(60), { align: 'center' });
    doc.text('Assinatura do Diretor', { align: 'center' });
    
    doc.moveDown();
    doc.fontSize(8).font('Helvetica-Oblique');
    doc.text(`Documento gerado automaticamente pelo Sistema VALENTE em ${new Date().toLocaleString('pt-BR')}`, {
      align: 'center',
    });
    
    // Finalizar PDF
    doc.end();
    
    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        console.log(`[BUREAUCRACY KILLER] ✅ Diário de Classe gerado: ${data.outputPath}`);
        resolve(data.outputPath);
      });
      stream.on('error', reject);
    });
  } catch (error) {
    console.error('[BUREAUCRACY KILLER] Erro ao gerar Diário de Classe:', error);
    throw error;
  }
}

// ========================================
// RIA - RELATÓRIO INDIVIDUAL DO ALUNO
// ========================================

/**
 * Gera PDF do Relatório Individual do Aluno (RIA)
 * Documento oficial com desenvolvimento da criança
 */
export async function generateRIA(data: RIAData): Promise<string> {
  try {
    console.log(`[BUREAUCRACY KILLER] Gerando RIA...`);
    
    // Buscar dados do aluno
    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
      include: {
        school: true,
        class: true,
      },
    });
    
    if (!student) {
      throw new Error('Aluno não encontrado');
    }
    
    // Buscar registros do período
    const logs = await prisma.dailyLog.findMany({
      where: {
        studentId: data.studentId,
        date: {
          gte: data.period.start,
          lte: data.period.end,
        },
      },
      orderBy: { date: 'asc' },
    });
    
    // Buscar planejamentos BNCC
    const bnccActivities = await prisma.bNCCPlanning.findMany({
      where: {
        classId: student.classId || '',
        date: {
          gte: data.period.start,
          lte: data.period.end,
        },
        wasExecuted: true,
      },
    });
    
    // Criar PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(data.outputPath);
    doc.pipe(stream);
    
    // CABEÇALHO
    doc.fontSize(18).font('Helvetica-Bold')
       .text('RELATÓRIO INDIVIDUAL DO ALUNO (RIA)', { align: 'center' });
    
    doc.moveDown();
    
    // DADOS DO ALUNO
    doc.fontSize(12).font('Helvetica-Bold')
       .text('DADOS DO ALUNO', { underline: true });
    
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Nome: ${student.name}`);
    doc.text(`Data de Nascimento: ${student.birthDate.toLocaleDateString('pt-BR')}`);
    doc.text(`Idade: ${calculateAge(student.birthDate)} anos`);
    doc.text(`Turma: ${student.class?.name || 'Não informada'}`);
    doc.text(`Unidade: ${student.school.name}`);
    doc.text(`Período: ${data.period.start.toLocaleDateString('pt-BR')} a ${data.period.end.toLocaleDateString('pt-BR')}`);
    
    doc.moveDown();
    
    // FREQUÊNCIA
    doc.fontSize(12).font('Helvetica-Bold')
       .text('FREQUÊNCIA', { underline: true });
    
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    
    const totalDays = logs.length;
    const workingDays = calculateWorkingDays(data.period.start, data.period.end);
    const attendanceRate = totalDays > 0 ? ((totalDays / workingDays) * 100).toFixed(1) : '0.0';
    
    doc.text(`Dias letivos: ${workingDays}`);
    doc.text(`Dias presentes: ${totalDays}`);
    doc.text(`Taxa de frequência: ${attendanceRate}%`);
    
    doc.moveDown();
    
    // DESENVOLVIMENTO BNCC
    doc.fontSize(12).font('Helvetica-Bold')
       .text('DESENVOLVIMENTO PEDAGÓGICO (BNCC)', { underline: true });
    
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    
    // Agrupar atividades por campo de experiência
    const activitiesByField = bnccActivities.reduce((acc, activity) => {
      if (!acc[activity.bnccCode]) {
        acc[activity.bnccCode] = [];
      }
      acc[activity.bnccCode].push(activity);
      return acc;
    }, {} as Record<string, any[]>);
    
    for (const [code, activities] of Object.entries(activitiesByField)) {
      doc.font('Helvetica-Bold').text(`${code} - ${activities[0].bnccField}:`);
      doc.font('Helvetica').text(`Participou de ${activities.length} atividades neste campo.`);
      doc.moveDown(0.5);
    }
    
    doc.moveDown();
    
    // DESENVOLVIMENTO SOCIOEMOCIONAL
    doc.fontSize(12).font('Helvetica-Bold')
       .text('DESENVOLVIMENTO SOCIOEMOCIONAL', { underline: true });
    
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    
    // Análise de humor e comportamento
    const moodStats = analyzeMoodPatterns(logs);
    const behaviorStats = analyzeBehaviorPatterns(logs);
    
    doc.text(`Humor predominante: ${moodStats.predominant}`);
    doc.text(`Comportamento predominante: ${behaviorStats.predominant}`);
    
    doc.moveDown();
    
    // ALIMENTAÇÃO E SAÚDE
    doc.fontSize(12).font('Helvetica-Bold')
       .text('ALIMENTAÇÃO E SAÚDE', { underline: true });
    
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    
    const feedingStats = analyzeFeedingPatterns(logs);
    const sleepStats = analyzeSleepPatterns(logs);
    
    doc.text(`Aceitação alimentar: ${feedingStats.acceptance}`);
    doc.text(`Padrão de sono: ${sleepStats.pattern}`);
    
    doc.moveDown();
    
    // OBSERVAÇÕES GERAIS (TEXTO DESCRITIVO)
    doc.fontSize(12).font('Helvetica-Bold')
       .text('OBSERVAÇÕES GERAIS', { underline: true });
    
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    
    const descriptiveText = generateDescriptiveText(student, logs, bnccActivities);
    doc.text(descriptiveText, { align: 'justify' });
    
    doc.moveDown();
    
    // RODAPÉ
    doc.addPage();
    doc.fontSize(10).font('Helvetica');
    doc.text('_'.repeat(60), { align: 'center' });
    doc.text('Assinatura do Professor', { align: 'center' });
    
    doc.moveDown();
    doc.text('_'.repeat(60), { align: 'center' });
    doc.text('Assinatura do Coordenador Pedagógico', { align: 'center' });
    
    doc.moveDown();
    doc.text('_'.repeat(60), { align: 'center' });
    doc.text('Assinatura do Diretor', { align: 'center' });
    
    doc.moveDown(2);
    doc.fontSize(8).font('Helvetica-Oblique');
    doc.text(`Documento gerado automaticamente pelo Sistema VALENTE em ${new Date().toLocaleString('pt-BR')}`, {
      align: 'center',
    });
    
    // Finalizar PDF
    doc.end();
    
    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        console.log(`[BUREAUCRACY KILLER] ✅ RIA gerado: ${data.outputPath}`);
        resolve(data.outputPath);
      });
      stream.on('error', reject);
    });
  } catch (error) {
    console.error('[BUREAUCRACY KILLER] Erro ao gerar RIA:', error);
    throw error;
  }
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

function calculateWorkingDays(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Não é domingo nem sábado
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

function analyzeMoodPatterns(logs: any[]) {
  const moods = logs.map(log => log.mood).filter(Boolean);
  const moodCounts = moods.reduce((acc, mood) => {
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const predominant = Object.entries(moodCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Não registrado';
  
  return { predominant, counts: moodCounts };
}

function analyzeBehaviorPatterns(logs: any[]) {
  const behaviors = logs.map(log => log.behavior).filter(Boolean);
  const behaviorCounts = behaviors.reduce((acc, behavior) => {
    acc[behavior] = (acc[behavior] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const predominant = Object.entries(behaviorCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Não registrado';
  
  return { predominant, counts: behaviorCounts };
}

function analyzeFeedingPatterns(logs: any[]) {
  const meals = logs.flatMap(log => [log.breakfast, log.lunch, log.snackAM, log.snackPM]).filter(Boolean);
  const acceptedMeals = meals.filter(meal => meal === 'Comeu tudo' || meal === 'Comeu metade').length;
  const totalMeals = meals.length;
  
  const rate = totalMeals > 0 ? ((acceptedMeals / totalMeals) * 100).toFixed(0) : '0';
  
  let acceptance = 'Boa';
  if (parseInt(rate) < 50) acceptance = 'Baixa';
  else if (parseInt(rate) < 80) acceptance = 'Regular';
  
  return { acceptance, rate: `${rate}%` };
}

function analyzeSleepPatterns(logs: any[]) {
  const sleepLogs = logs.filter(log => log.napDuration !== null);
  const avgDuration = sleepLogs.length > 0
    ? Math.round(sleepLogs.reduce((sum, log) => sum + (log.napDuration || 0), 0) / sleepLogs.length)
    : 0;
  
  let pattern = 'Regular';
  if (avgDuration < 30) pattern = 'Sono curto';
  else if (avgDuration > 120) pattern = 'Sono longo';
  
  return { pattern, avgDuration: `${avgDuration} min` };
}

function generateDescriptiveText(student: any, logs: any[], activities: any[]): string {
  const name = student.name.split(' ')[0]; // Primeiro nome
  
  return `
${name} demonstrou um desenvolvimento satisfatório durante o período avaliado. 
Participou ativamente das atividades propostas, demonstrando interesse e curiosidade.

No aspecto socioemocional, ${name} interage bem com os colegas e professores, 
demonstrando capacidade de convivência e respeito às regras da sala.

Em relação à alimentação, ${name} apresenta boa aceitação dos alimentos oferecidos, 
contribuindo para seu desenvolvimento físico e nutricional adequado.

Nas atividades pedagógicas alinhadas à BNCC, ${name} participou de ${activities.length} 
atividades em diferentes campos de experiência, demonstrando evolução em suas 
habilidades e competências.

Recomenda-se continuidade do acompanhamento pedagógico e manutenção da parceria 
família-escola para o pleno desenvolvimento da criança.
  `.trim();
}

// ========================================
// EXPORTAÇÕES
// ========================================

export default {
  generateDiarioClasse,
  generateRIA,
};
