import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());

// Mock Data
const mockStudents = [
  { id: '1', name: 'João Silva', email: 'joao@escola.com', phone: '11999999999', status: 'ACTIVE', classId: '1', attendance: { faltasConsecutivas: 5, total: 3 }, documents: [] },
  { id: '2', name: 'Maria Santos', email: 'maria@escola.com', phone: '11988888888', status: 'ACTIVE', classId: '1', attendance: { faltasConsecutivas: 35, total: 15 }, documents: [] },
  { id: '3', name: 'Pedro Costa', email: 'pedro@escola.com', phone: '11977777777', status: 'ACTIVE', classId: '2', attendance: { faltasConsecutivas: 2, total: 1 }, documents: [] },
];

const mockEmployees = [
  { id: '1', name: 'Carlos Diretor', category: 'Diretor', email: 'carlos@escola.com', phone: '11966666666', status: 'ACTIVE', documents: [] },
  { id: '2', name: 'Ana Coordenadora', category: 'Coordenador', email: 'ana@escola.com', phone: '11955555555', status: 'ACTIVE', documents: [] },
  { id: '3', name: 'Lucas Professor', category: 'Professor', email: 'lucas@escola.com', phone: '11944444444', status: 'ACTIVE', documents: [] },
];

const mockInventory = [
  { id: '1', name: 'Papel A4 (resma)', category: 'PEDAGOGICO', quantity: 50, unit: 'resma', price: 25.50 },
  { id: '2', name: 'Sabonete Líquido', category: 'HIGIENE', quantity: 30, unit: 'l', price: 15.00 },
  { id: '3', name: 'Leite Integral', category: 'ALIMENTACAO', quantity: 100, unit: 'l', price: 4.50 },
  { id: '4', name: 'Lápis HB (dúzia)', category: 'PEDAGOGICO', quantity: 20, unit: 'dúzia', price: 8.90 },
  { id: '5', name: 'Papel Toalha', category: 'HIGIENE', quantity: 40, unit: 'rolo', price: 3.50 },
];

const mockClasses = [
  { id: '1', name: '5º Ano A', level: 'Fundamental', year: 2025 },
  { id: '2', name: 'Maternal 1', level: 'Maternal', year: 2025 },
  { id: '3', name: '1º Ano B', level: 'Fundamental', year: 2025 },
];

const mockSuppliers = [
  { id: '1', name: 'Fornecedor ABC', email: 'contato@abc.com', phone: '1133333333', products: [] },
  { id: '2', name: 'Fornecedor XYZ', email: 'contato@xyz.com', phone: '1144444444', products: [] },
];

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', system: 'CONEXA v1.0 (Demo)', timestamp: new Date() });
});

// Students
app.get('/api/students', (req, res) => {
  res.json(mockStudents);
});

app.get('/api/students/:id', (req, res) => {
  const student = mockStudents.find(s => s.id === req.params.id);
  res.json(student || { error: 'Not found' });
});

app.post('/api/students', (req, res) => {
  const newStudent = { id: String(mockStudents.length + 1), ...req.body, documents: [] };
  mockStudents.push(newStudent);
  res.status(201).json(newStudent);
});

app.put('/api/students/:id', (req, res) => {
  const index = mockStudents.findIndex(s => s.id === req.params.id);
  if (index !== -1) {
    mockStudents[index] = { ...mockStudents[index], ...req.body };
    res.json(mockStudents[index]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.delete('/api/students/:id', (req, res) => {
  const index = mockStudents.findIndex(s => s.id === req.params.id);
  if (index !== -1) {
    mockStudents.splice(index, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// Employees
app.get('/api/employees', (req, res) => {
  res.json(mockEmployees);
});

app.get('/api/employees/:id', (req, res) => {
  const employee = mockEmployees.find(e => e.id === req.params.id);
  res.json(employee || { error: 'Not found' });
});

app.post('/api/employees', (req, res) => {
  const newEmployee = { id: String(mockEmployees.length + 1), ...req.body, documents: [] };
  mockEmployees.push(newEmployee);
  res.status(201).json(newEmployee);
});

app.put('/api/employees/:id', (req, res) => {
  const index = mockEmployees.findIndex(e => e.id === req.params.id);
  if (index !== -1) {
    mockEmployees[index] = { ...mockEmployees[index], ...req.body };
    res.json(mockEmployees[index]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.delete('/api/employees/:id', (req, res) => {
  const index = mockEmployees.findIndex(e => e.id === req.params.id);
  if (index !== -1) {
    mockEmployees.splice(index, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// Inventory
app.get('/api/inventory', (req, res) => {
  res.json(mockInventory);
});

app.post('/api/inventory', (req, res) => {
  const newItem = { id: String(mockInventory.length + 1), ...req.body };
  mockInventory.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/inventory/:id', (req, res) => {
  const index = mockInventory.findIndex(i => i.id === req.params.id);
  if (index !== -1) {
    mockInventory[index] = { ...mockInventory[index], ...req.body };
    res.json(mockInventory[index]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// Classes
app.get('/api/material-orders/classes', (req, res) => {
  res.json(mockClasses);
});

app.get('/api/material-orders/classes/:classId/materials', (req, res) => {
  res.json({ classId: req.params.classId, items: [] });
});

// Suppliers
app.get('/api/material-orders/suppliers', (req, res) => {
  res.json(mockSuppliers);
});



// Serve frontend
app.use(express.static(path.join(__dirname, 'dist/public')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 CONEXA Demo Server rodando em http://localhost:${PORT}`);
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
});

// Agent
app.post('/api/agent/command', (req, res) => {
  const { action, payload } = req.body;
  res.json({ success: true, action, message: `Comando ${action} executado com sucesso` });
});

// Dashboard Stats
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    planejamentosAtivos: 12,
    agendadosMes: 45,
    pendentesAnalise: 3,
    servicoNecessario: 1
  });
});

// Agenda
app.get('/api/agenda', (req, res) => {
  res.json([
    { id: '1', title: 'Reunião com Pais', date: '2025-12-20', time: '14:00', type: 'meeting' },
    { id: '2', title: 'Festa de Encerramento', date: '2025-12-22', time: '10:00', type: 'event' }
  ]);
});

// Notificações
app.get('/api/notifications', (req, res) => {
  res.json([
    { id: '1', title: 'Novo Aluno', description: 'João foi adicionado', timestamp: 'há 2 horas' },
    { id: '2', title: 'Estoque Baixo', description: 'Papel A4 está baixo', timestamp: 'há 4 horas' }
  ]);
});

// Suppliers (rota faltante)
app.get('/api/material-orders/suppliers', (req, res) => {
  res.json(mockSuppliers);
});

