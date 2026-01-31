#!/bin/sh
# ========================================
# SISTEMA CONEXA v1.0
# Script de Inicialização Automática
# ========================================

set -e

echo "🚀 CONEXA - Iniciando Backend..."

# ========================================
# 1. INSTALAR DEPENDÊNCIAS
# ========================================
echo "📦 Instalando dependências..."
npm install --production

# ========================================
# 2. GERAR PRISMA CLIENT
# ========================================
echo "🔧 Gerando Prisma Client..."
npx prisma generate

# ========================================
# 3. AGUARDAR POSTGRES ESTAR PRONTO
# ========================================
echo "⏳ Aguardando PostgreSQL estar pronto..."

# Extrair host, porta e usuário da DATABASE_URL
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')

# Aguardar até 60 segundos
TIMEOUT=60
ELAPSED=0

until pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER > /dev/null 2>&1 || [ $ELAPSED -eq $TIMEOUT ]; do
  echo "⏳ Aguardando PostgreSQL... ($ELAPSED/$TIMEOUT segundos)"
  sleep 2
  ELAPSED=$((ELAPSED + 2))
done

if [ $ELAPSED -eq $TIMEOUT ]; then
  echo "❌ ERRO: PostgreSQL não respondeu em $TIMEOUT segundos"
  exit 1
fi

echo "✅ PostgreSQL está pronto!"

# ========================================
# 4. EXECUTAR MIGRATIONS
# ========================================
echo "🗄️ Executando migrations..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
  echo "❌ ERRO: Falha ao executar migrations"
  exit 1
fi

echo "✅ Migrations executadas com sucesso!"

# ========================================
# 5. POPULAR DADOS INICIAIS (SEED)
# ========================================
if [ "$PRISMA_SEED_ENABLED" = "true" ]; then
  echo "🌱 Verificando se precisa popular dados iniciais..."
  
  # Verificar se já existem usuários no banco
  USER_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM \"User\"" 2>/dev/null || echo "0")
  
  if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
    echo "🌱 Banco vazio. Populando dados iniciais..."
    npx prisma db seed
    
    if [ $? -ne 0 ]; then
      echo "⚠️ AVISO: Falha ao popular dados iniciais (seed)"
      echo "⚠️ O sistema continuará, mas você precisará criar usuários manualmente"
    else
      echo "✅ Dados iniciais populados com sucesso!"
    fi
  else
    echo "✅ Banco já possui dados ($USER_COUNT usuários). Pulando seed."
  fi
else
  echo "⏭️ Seed desabilitado (PRISMA_SEED_ENABLED=false). Pulando..."
fi

# ========================================
# 6. INICIAR SERVIDOR
# ========================================
echo "🚀 Iniciando servidor API..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  SISTEMA CONEXA v1.0"
echo "  \"Conectando Vidas\""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

exec npm start
