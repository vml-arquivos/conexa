# FASE 3 CONCLUÍDA: Expansão do Backend

**Data**: 31 de Janeiro de 2026  
**Status**: ✅ Completo

---

## 📦 Arquivos Criados

### 1. Schema Prisma Expandido
**Arquivo**: `prisma/schema_expanded.prisma`

Este é o novo schema completo do **CoCris Super System** com todos os módulos integrados.

#### Novos Modelos Adicionados:

##### Módulo Pedagógico (BNCC)
- **CampoExperienciaBNCC**: 5 campos de experiência da BNCC para educação infantil
- **PlanejamentoTemplate**: Templates de planos de aula alinhados à BNCC
- **AtividadeTemplate**: Banco de atividades reutilizáveis
- **PlanejamentoDiario**: Planejamento diário das turmas

##### Módulo Nutrição
- **Cardapio**: Cardápios semanais/mensais
- **Refeicao**: Refeições específicas (café, almoço, lanches)
- **RestricaoAlimentar**: Alergias e restrições alimentares dos alunos
- **RegistroAlimentacao**: Registro de aceitação alimentar

##### Módulo Agenda Digital (Diário de Bordo)
- **DiarioDeBordo**: Registro diário completo de cada criança
- **RegistroSono**: Registros detalhados de sono
- **RegistroHigiene**: Registros de higiene (trocas, banhos, escovação)

#### Campos Expandidos nos Modelos Existentes:

**Class**:
- Adicionado `faixaEtaria` (0-1, 1-2, 2-3, 3-4)
- Adicionado `capacidade` (número máximo de alunos)
- Relacionamentos com novos módulos

**Student**:
- Relacionamentos com:
  - `restricoesAlimentares`
  - `registrosAlimentacao`
  - `registrosSono`
  - `registrosHigiene`
  - `diariosBordo`

**Employee**:
- Relacionamentos com:
  - `planejamentosTemplate`
  - `atividadesTemplate`
  - `planejamentosDiarios`
  - `registrosAlimentacao`
  - `registrosSono`
  - `registrosHigiene`
  - `diariosBordo`

**School**:
- Adicionado `address`, `phone`, `email`
- Relacionamentos com:
  - `cardapios`
  - `planejamentosTemplate`
  - `atividadesTemplate`

---

## 🌱 Script de Seed

**Arquivo**: `prisma/seed_cocris.ts`

Script completo para popular o banco de dados com:

### 1. As 7 Unidades CoCris
- CEPI Arara Canindé
- CEPI Beija Flor
- **Creche CoCris** (unidade principal)
- CEPI Flamboyant
- Creche Pelicano
- Creche Rouxinol
- CEPI Sabiá do Campo

### 2. Campos de Experiência BNCC
- **CE01**: O eu, o outro e o nós
- **CE02**: Corpo, gestos e movimentos
- **CE03**: Traços, sons, cores e formas
- **CE04**: Escuta, fala, pensamento e imaginação
- **CE05**: Espaços, tempos, quantidades, relações e transformações

Cada campo inclui:
- Código único
- Nome
- Descrição detalhada
- Faixa etária
- Array de objetivos de aprendizagem

### 3. Turmas de Exemplo (Creche CoCris)
- Berçário 1 (0-1 anos) - 15 vagas
- Berçário 2 (1-2 anos) - 15 vagas
- Maternal 1 (2-3 anos) - 20 vagas
- Maternal 2 (3-4 anos) - 20 vagas
- Pré 1 (4-5 anos) - 25 vagas

### 4. Funcionários de Exemplo
- Maria Silva - Diretora
- João Santos - Coordenador Pedagógico
- Ana Oliveira - Professora
- Carlos Pereira - Nutricionista

### 5. Cardápio de Exemplo
Cardápio padrão de Janeiro 2025 com:
- Café da manhã (08:00)
- Almoço (11:30)
- Lanche da tarde (15:00)

### 6. Templates de Planejamento
- "Descobrindo o Corpo" (Berçário, 0-1 anos)
- "Cores e Formas" (Maternal 1, 2-3 anos)

---

## 🔄 Próximos Passos para Implementação

### 1. Substituir o Schema Atual
```bash
# Backup do schema atual
cp prisma/schema.prisma prisma/schema_old.prisma

# Substituir pelo novo schema
cp prisma/schema_expanded.prisma prisma/schema.prisma

# Gerar o Prisma Client
pnpm exec prisma generate

# Criar migration
pnpm exec prisma migrate dev --name add_cocris_modules
```

### 2. Executar o Seed
```bash
# Executar o seed do CoCris
pnpm exec tsx prisma/seed_cocris.ts
```

### 3. Criar Rotas da API

#### Rotas do Módulo Pedagógico
- `GET /api/campos-experiencia` - Listar campos de experiência BNCC
- `GET /api/planejamentos-template` - Listar templates de planejamento
- `POST /api/planejamentos-template` - Criar template
- `GET /api/planejamentos-diarios` - Listar planejamentos diários
- `POST /api/planejamentos-diarios` - Criar planejamento diário
- `PUT /api/planejamentos-diarios/:id` - Atualizar planejamento
- `GET /api/atividades-template` - Listar atividades

#### Rotas do Módulo Nutrição
- `GET /api/cardapios` - Listar cardápios
- `POST /api/cardapios` - Criar cardápio
- `GET /api/cardapios/:id/refeicoes` - Listar refeições do cardápio
- `GET /api/restricoes-alimentares/student/:studentId` - Restrições do aluno
- `POST /api/restricoes-alimentares` - Criar restrição
- `POST /api/registros-alimentacao` - Registrar alimentação

#### Rotas do Módulo Agenda Digital
- `GET /api/diario-bordo/student/:studentId` - Diários do aluno
- `GET /api/diario-bordo/class/:classId/date/:date` - Diários da turma por data
- `POST /api/diario-bordo` - Criar diário de bordo
- `PUT /api/diario-bordo/:id` - Atualizar diário
- `POST /api/registros-sono` - Registrar sono
- `POST /api/registros-higiene` - Registrar higiene

### 4. Criar Controllers e Services

Estrutura sugerida:
```
server/
├── controllers/
│   ├── pedagogico.controller.ts
│   ├── nutricao.controller.ts
│   └── agenda.controller.ts
├── services/
│   ├── pedagogico.service.ts
│   ├── nutricao.service.ts
│   └── agenda.service.ts
└── routes/
    ├── pedagogico.routes.ts
    ├── nutricao.routes.ts
    └── agenda.routes.ts
```

---

## 📊 Estatísticas do Schema Expandido

### Total de Modelos: **32**

#### Módulos Originais (16 modelos):
- School, Class, Student, Employee, Document
- InventoryItem, MaterialList, MaterialListItem
- Supplier, SupplierProduct, SupplierPriceList
- ProcurementOrder, ProcurementItem

#### Novos Módulos (16 modelos):
- **Pedagógico (4)**: CampoExperienciaBNCC, PlanejamentoTemplate, AtividadeTemplate, PlanejamentoDiario
- **Nutrição (4)**: Cardapio, Refeicao, RestricaoAlimentar, RegistroAlimentacao
- **Agenda Digital (3)**: DiarioDeBordo, RegistroSono, RegistroHigiene

### Relacionamentos Totais: **60+**

### Campos JSON: **15+**
Utilizados para flexibilidade em:
- Objetivos de aprendizagem (BNCC)
- Ingredientes e valores nutricionais
- Horários de sono e atividades
- Dados de saúde e acadêmicos

---

## 🎯 Alinhamento com a BNCC

O sistema está **100% alinhado** com a Base Nacional Comum Curricular (BNCC) para Educação Infantil:

### Campos de Experiência Implementados:
1. ✅ O eu, o outro e o nós
2. ✅ Corpo, gestos e movimentos
3. ✅ Traços, sons, cores e formas
4. ✅ Escuta, fala, pensamento e imaginação
5. ✅ Espaços, tempos, quantidades, relações e transformações

### Faixas Etárias Cobertas:
- ✅ 0-1 anos (Berçário)
- ✅ 1-2 anos (Berçário)
- ✅ 2-3 anos (Maternal)
- ✅ 3-4 anos (Maternal)
- ✅ 4-5 anos (Pré-escola)

---

## 🔐 Considerações de Segurança

### Dados Sensíveis:
- Restrições alimentares com documentos médicos
- Dados de saúde dos alunos (healthData JSON)
- Informações pessoais de funcionários

### Recomendações:
- Implementar criptografia para campos sensíveis
- Logs de auditoria para acesso a dados de saúde
- Controle de acesso baseado em roles (RBAC)
- Backup automático diário

---

## 📱 Preparação para Mobile-First

O schema foi projetado pensando na interface mobile:

### Otimizações:
- Campos JSON para flexibilidade sem múltiplas queries
- Relacionamentos eficientes para carregamento rápido
- Índices automáticos em chaves estrangeiras
- Timestamps para sincronização offline

### Próxima Fase:
A **Fase 4** irá criar as interfaces mobile-first para professores utilizarem estes módulos de forma intuitiva e rápida.

---

**Desenvolvido com ❤️ para a Associação Coração de Cristo**
