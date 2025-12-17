import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rota de Saúde
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', system: 'CONEXA v1.0', timestamp: new Date() });
});

// Rota de Alunos (Exemplo)
app.get('/api/students', async (req, res) => {
  try {
    const students = await prisma.student.findMany();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar alunos' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 CONEXA Server rodando na porta ${PORT}`);
});
