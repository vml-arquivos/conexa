import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do CoCris Super System...\n');

  // ========== 1. CRIAR AS 7 UNIDADES COCRIS ==========
  console.log('📍 Criando as 7 unidades escolares...');
  
  const unidades = [
    {
      name: 'CEPI Arara Canindé',
      address: 'Endereço a ser definido',
      phone: '(61) 3575-4125',
      email: 'arara.caninde@cocris.org',
    },
    {
      name: 'CEPI Beija Flor',
      address: 'Endereço a ser definido',
      phone: '(61) 3575-4125',
      email: 'beija.flor@cocris.org',
    },
    {
      name: 'Creche CoCris',
      address: 'Avenida Recanto das Emas, Quadra 301, Lote 26, Brasília-DF',
      phone: '(61) 3575-4125 / 3575-4119',
      email: 'contato@cocris.org',
    },
    {
      name: 'CEPI Flamboyant',
      address: 'Endereço a ser definido',
      phone: '(61) 3575-4125',
      email: 'flamboyant@cocris.org',
    },
    {
      name: 'Creche Pelicano',
      address: 'Endereço a ser definido',
      phone: '(61) 3575-4125',
      email: 'pelicano@cocris.org',
    },
    {
      name: 'Creche Rouxinol',
      address: 'Endereço a ser definido',
      phone: '(61) 3575-4125',
      email: 'rouxinol@cocris.org',
    },
    {
      name: 'CEPI Sabiá do Campo',
      address: 'Endereço a ser definido',
      phone: '(61) 3575-4125',
      email: 'sabia.campo@cocris.org',
    },
  ];

  const createdSchools = [];
  for (const unidade of unidades) {
    const school = await prisma.school.create({
      data: {
        ...unidade,
        planType: 'ENTERPRISE',
      },
    });
    createdSchools.push(school);
    console.log(`  ✅ ${school.name}`);
  }

  console.log(`\n✅ ${createdSchools.length} unidades criadas!\n`);

  // ========== 2. CRIAR CAMPOS DE EXPERIÊNCIA BNCC ==========
  console.log('📚 Criando Campos de Experiência da BNCC...');

  const camposBNCC = [
    {
      codigo: 'CE01',
      nome: 'O eu, o outro e o nós',
      descricao: 'É na interação com os pares e com adultos que as crianças vão constituindo um modo próprio de agir, sentir e pensar e vão descobrindo que existem outros modos de vida, pessoas diferentes, com outros pontos de vista.',
      faixaEtaria: '0-4',
      objetivos: [
        'Perceber que suas ações têm efeitos nas outras crianças e nos adultos',
        'Perceber as possibilidades e os limites de seu corpo nas brincadeiras e interações',
        'Interagir com crianças da mesma faixa etária e adultos',
        'Comunicar necessidades, desejos e emoções',
        'Reconhecer seu corpo e expressar suas sensações em momentos de alimentação, higiene, brincadeira e descanso',
      ],
    },
    {
      codigo: 'CE02',
      nome: 'Corpo, gestos e movimentos',
      descricao: 'Com o corpo (por meio dos sentidos, gestos, movimentos impulsivos ou intencionais, coordenados ou espontâneos), as crianças, desde cedo, exploram o mundo, o espaço e os objetos do seu entorno.',
      faixaEtaria: '0-4',
      objetivos: [
        'Movimentar as partes do corpo para exprimir corporalmente emoções, necessidades e desejos',
        'Experimentar as possibilidades corporais nas brincadeiras e interações',
        'Imitar gestos e movimentos de outras crianças, adultos e animais',
        'Participar do cuidado do seu corpo e da promoção do seu bem-estar',
        'Utilizar os movimentos de preensão, encaixe, lançamento, entre outros',
      ],
    },
    {
      codigo: 'CE03',
      nome: 'Traços, sons, cores e formas',
      descricao: 'Conviver com diferentes manifestações artísticas, culturais e científicas, locais e universais, no cotidiano da instituição escolar, possibilita às crianças, por meio de experiências diversificadas, vivenciar diversas formas de expressão e linguagens.',
      faixaEtaria: '0-4',
      objetivos: [
        'Explorar sons produzidos com o próprio corpo e com objetos do ambiente',
        'Traçar marcas gráficas, em diferentes suportes, usando instrumentos riscantes e tintas',
        'Explorar diferentes fontes sonoras e materiais para acompanhar brincadeiras cantadas, canções, músicas e melodias',
        'Utilizar diferentes fontes sonoras disponíveis no ambiente em brincadeiras cantadas, canções, músicas e melodias',
        'Manipular materiais diversos e variados para comparar as diferenças e semelhanças entre eles',
      ],
    },
    {
      codigo: 'CE04',
      nome: 'Escuta, fala, pensamento e imaginação',
      descricao: 'Desde o nascimento, as crianças participam de situações comunicativas cotidianas com as pessoas com as quais interagem. As primeiras formas de interação do bebê são os movimentos do seu corpo, o olhar, a postura corporal, o sorriso, o choro e outros recursos vocais.',
      faixaEtaria: '0-4',
      objetivos: [
        'Reconhecer quando é chamado por seu nome e reconhecer os nomes de pessoas com quem convive',
        'Demonstrar interesse ao ouvir a leitura de poemas e a apresentação de músicas',
        'Demonstrar interesse ao ouvir histórias lidas ou contadas',
        'Reconhecer elementos das ilustrações de histórias, apontando-os, a pedido do adulto-leitor',
        'Imitar as variações de entonação e gestos realizados pelos adultos, ao ler histórias e ao cantar',
      ],
    },
    {
      codigo: 'CE05',
      nome: 'Espaços, tempos, quantidades, relações e transformações',
      descricao: 'As crianças vivem inseridas em espaços e tempos de diferentes dimensões, em um mundo constituído de fenômenos naturais e socioculturais. Desde muito pequenas, elas procuram se situar em diversos espaços (rua, bairro, cidade etc.) e tempos (dia e noite; hoje, ontem e amanhã etc.).',
      faixaEtaria: '0-4',
      objetivos: [
        'Explorar e descobrir as propriedades de objetos e materiais (odor, cor, sabor, temperatura)',
        'Explorar relações de causa e efeito (transbordar, tingir, misturar, mover e remover etc.)',
        'Explorar o ambiente pela ação e observação, manipulando, experimentando e fazendo descobertas',
        'Identificar relações espaciais (dentro e fora, em cima, embaixo, acima, abaixo, entre e do lado) e temporais (antes, durante e depois)',
        'Classificar objetos, considerando determinado atributo (tamanho, peso, cor, forma etc.)',
      ],
    },
  ];

  for (const campo of camposBNCC) {
    await prisma.campoExperienciaBNCC.create({
      data: campo,
    });
    console.log(`  ✅ ${campo.codigo} - ${campo.nome}`);
  }

  console.log(`\n✅ ${camposBNCC.length} Campos de Experiência criados!\n`);

  // ========== 3. CRIAR TURMAS DE EXEMPLO ==========
  console.log('🏫 Criando turmas de exemplo na Creche CoCris...');

  const crecheCocriss = createdSchools.find(s => s.name === 'Creche CoCris');
  
  if (crecheCocriss) {
    const turmas = [
      { name: 'Berçário 1', level: 'BERCARIO', faixaEtaria: '0-1', year: 2025, capacidade: 15 },
      { name: 'Berçário 2', level: 'BERCARIO', faixaEtaria: '1-2', year: 2025, capacidade: 15 },
      { name: 'Maternal 1', level: 'MATERNAL_1', faixaEtaria: '2-3', year: 2025, capacidade: 20 },
      { name: 'Maternal 2', level: 'MATERNAL_2', faixaEtaria: '3-4', year: 2025, capacidade: 20 },
      { name: 'Pré 1', level: 'PRE_1', faixaEtaria: '4-5', year: 2025, capacidade: 25 },
    ];

    for (const turma of turmas) {
      await prisma.class.create({
        data: {
          ...turma,
          schoolId: crecheCocriss.id,
        },
      });
      console.log(`  ✅ ${turma.name} (${turma.faixaEtaria} anos)`);
    }

    console.log(`\n✅ ${turmas.length} turmas criadas!\n`);
  }

  // ========== 4. CRIAR FUNCIONÁRIOS DE EXEMPLO ==========
  console.log('👥 Criando funcionários de exemplo...');

  if (crecheCocriss) {
    const funcionarios = [
      {
        name: 'Maria Silva',
        category: 'DIRETOR',
        email: 'maria.silva@cocris.org',
        phone: '(61) 99999-0001',
        department: 'ADMINISTRATIVO',
      },
      {
        name: 'João Santos',
        category: 'COORDENADOR',
        email: 'joao.santos@cocris.org',
        phone: '(61) 99999-0002',
        department: 'PEDAGOGICO',
      },
      {
        name: 'Ana Oliveira',
        category: 'PROFESSOR',
        email: 'ana.oliveira@cocris.org',
        phone: '(61) 99999-0003',
        department: 'PEDAGOGICO',
      },
      {
        name: 'Carlos Pereira',
        category: 'NUTRICIONISTA',
        email: 'carlos.pereira@cocris.org',
        phone: '(61) 99999-0004',
        department: 'OPERACIONAL',
      },
    ];

    for (const func of funcionarios) {
      await prisma.employee.create({
        data: {
          ...func,
          schoolId: crecheCocriss.id,
        },
      });
      console.log(`  ✅ ${func.name} - ${func.category}`);
    }

    console.log(`\n✅ ${funcionarios.length} funcionários criados!\n`);
  }

  // ========== 5. CRIAR CARDÁPIO DE EXEMPLO ==========
  console.log('🍽️  Criando cardápio de exemplo...');

  if (crecheCocriss) {
    const cardapio = await prisma.cardapio.create({
      data: {
        nome: 'Cardápio Padrão - Janeiro 2025',
        descricao: 'Cardápio semanal padrão para todas as turmas',
        dataInicio: new Date('2025-01-01'),
        dataFim: new Date('2025-01-31'),
        ativo: true,
        schoolId: crecheCocriss.id,
      },
    });

    const refeicoes = [
      {
        tipo: 'CAFE',
        diaSemana: 1,
        horario: '08:00',
        descricao: 'Mingau de aveia com banana',
        ingredientes: ['Aveia', 'Leite', 'Banana', 'Açúcar'],
        cardapioId: cardapio.id,
      },
      {
        tipo: 'ALMOCO',
        diaSemana: 1,
        horario: '11:30',
        descricao: 'Arroz, feijão, frango desfiado e purê de batata',
        ingredientes: ['Arroz', 'Feijão', 'Frango', 'Batata', 'Cenoura'],
        cardapioId: cardapio.id,
      },
      {
        tipo: 'LANCHE_TARDE',
        diaSemana: 1,
        horario: '15:00',
        descricao: 'Suco natural e biscoito integral',
        ingredientes: ['Laranja', 'Biscoito integral'],
        cardapioId: cardapio.id,
      },
    ];

    for (const refeicao of refeicoes) {
      await prisma.refeicao.create({
        data: refeicao,
      });
    }

    console.log(`  ✅ Cardápio criado com ${refeicoes.length} refeições\n`);
  }

  // ========== 6. CRIAR TEMPLATES DE PLANEJAMENTO ==========
  console.log('📝 Criando templates de planejamento...');

  if (crecheCocriss) {
    const professor = await prisma.employee.findFirst({
      where: {
        category: 'PROFESSOR',
        schoolId: crecheCocriss.id,
      },
    });

    if (professor) {
      const templates = [
        {
          titulo: 'Descobrindo o Corpo',
          nivelEnsino: 'BERCARIO',
          faixaEtaria: '0-1',
          camposExperiencia: ['CE01', 'CE02'],
          habilidadesBNCC: [],
          objetivosAprendizagem: 'Explorar movimentos corporais e reconhecer partes do corpo',
          desenvolvimento: 'Atividades de exploração sensorial com músicas e movimentos',
          avaliacao: 'Observação da participação e engajamento nas atividades',
          duracao: 45,
          schoolId: crecheCocriss.id,
          autorId: professor.id,
        },
        {
          titulo: 'Cores e Formas',
          nivelEnsino: 'MATERNAL_1',
          faixaEtaria: '2-3',
          camposExperiencia: ['CE03', 'CE05'],
          habilidadesBNCC: [],
          objetivosAprendizagem: 'Identificar cores primárias e formas geométricas básicas',
          desenvolvimento: 'Atividades com tintas, massinha e blocos de montar',
          avaliacao: 'Registro fotográfico e observação',
          duracao: 60,
          schoolId: crecheCocriss.id,
          autorId: professor.id,
        },
      ];

      for (const template of templates) {
        await prisma.planejamentoTemplate.create({
          data: template,
        });
        console.log(`  ✅ ${template.titulo} (${template.faixaEtaria} anos)`);
      }

      console.log(`\n✅ ${templates.length} templates de planejamento criados!\n`);
    }
  }

  console.log('✅ Seed do CoCris concluído com sucesso! 🎉\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
