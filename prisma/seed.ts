import { PrismaClient, Priority, ProjectStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.task.deleteMany();
  await prisma.category.deleteMany();
  await prisma.project.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Dados existentes removidos');

  // Criar Tags
  const tags = await Promise.all([
    prisma.tag.create({
      data: {
        name: 'urgente',
        color: '#DC2626',
      },
    }),
    prisma.tag.create({
      data: {
        name: 'importante',
        color: '#F59E0B',
      },
    }),
    prisma.tag.create({
      data: {
        name: 'trabalho',
        color: '#3B82F6',
      },
    }),
    prisma.tag.create({
      data: {
        name: 'pessoal',
        color: '#8B5CF6',
      },
    }),
    prisma.tag.create({
      data: {
        name: 'estudo',
        color: '#10B981',
      },
    }),
  ]);

  console.log(`✅ ${tags.length} tags criadas`);

  // Criar Usuários
  const hashedPassword = await bcrypt.hash('senha123', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'joao@example.com',
      name: 'João Silva',
      password: hashedPassword,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'maria@example.com',
      name: 'Maria Santos',
      password: hashedPassword,
    },
  });

  console.log('✅ 2 usuários criados');

  // Criar Categorias para o usuário 1
  const categoriesUser1 = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Trabalho',
        color: '#3B82F6',
        userId: user1.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Pessoal',
        color: '#8B5CF6',
        userId: user1.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Estudos',
        color: '#10B981',
        userId: user1.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Casa',
        color: '#F59E0B',
        userId: user1.id,
      },
    }),
  ]);

  // Criar Categorias para o usuário 2
  const categoriesUser2 = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Freelance',
        color: '#06B6D4',
        userId: user2.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Fitness',
        color: '#EC4899',
        userId: user2.id,
      },
    }),
  ]);

  console.log(`✅ ${categoriesUser1.length + categoriesUser2.length} categorias criadas`);

  // Criar Projetos para o usuário 1
  const project1 = await prisma.project.create({
    data: {
      name: 'Desenvolvimento App Mobile',
      description: 'Criar aplicativo mobile para gerenciamento de tarefas',
      status: ProjectStatus.ACTIVE,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-06-30'),
      userId: user1.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Reforma da Casa',
      description: 'Projeto de reforma do apartamento',
      status: ProjectStatus.PLANNING,
      startDate: new Date('2024-03-01'),
      userId: user1.id,
    },
  });

  // Criar Projetos para o usuário 2
  const project3 = await prisma.project.create({
    data: {
      name: 'Website Cliente XYZ',
      description: 'Desenvolvimento de website institucional',
      status: ProjectStatus.ACTIVE,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-04-30'),
      userId: user2.id,
    },
  });

  console.log('✅ 3 projetos criados');

  // Criar Tarefas para o usuário 1
  const tasksUser1 = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Configurar ambiente de desenvolvimento',
        description: 'Instalar Node.js, Docker e configurar VS Code',
        priority: Priority.HIGH,
        completed: true,
        userId: user1.id,
        categoryId: categoriesUser1[0].id, // Trabalho
        projectId: project1.id,
        tags: {
          connect: [{ id: tags[2].id }], // trabalho
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Criar mockups das telas principais',
        description: 'Desenhar as telas de login, dashboard e lista de tarefas',
        priority: Priority.HIGH,
        dueDate: new Date('2024-02-15'),
        userId: user1.id,
        categoryId: categoriesUser1[0].id, // Trabalho
        projectId: project1.id,
        tags: {
          connect: [{ id: tags[2].id }, { id: tags[1].id }], // trabalho, importante
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implementar autenticação JWT',
        description: 'Adicionar sistema de login com tokens JWT',
        priority: Priority.URGENT,
        dueDate: new Date('2024-02-10'),
        userId: user1.id,
        categoryId: categoriesUser1[0].id, // Trabalho
        projectId: project1.id,
        tags: {
          connect: [{ id: tags[0].id }, { id: tags[2].id }], // urgente, trabalho
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Estudar React Native',
        description: 'Completar curso de React Native na Udemy',
        priority: Priority.MEDIUM,
        userId: user1.id,
        categoryId: categoriesUser1[2].id, // Estudos
        tags: {
          connect: [{ id: tags[4].id }], // estudo
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Comprar materiais de construção',
        description: 'Lista: tintas, pincéis, massa corrida, lixa',
        priority: Priority.MEDIUM,
        dueDate: new Date('2024-03-05'),
        userId: user1.id,
        categoryId: categoriesUser1[3].id, // Casa
        projectId: project2.id,
        tags: {
          connect: [{ id: tags[3].id }], // pessoal
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Contratar pedreiro',
        description: 'Pesquisar e contratar profissional para reforma',
        priority: Priority.HIGH,
        dueDate: new Date('2024-03-01'),
        userId: user1.id,
        categoryId: categoriesUser1[3].id, // Casa
        projectId: project2.id,
        tags: {
          connect: [{ id: tags[1].id }, { id: tags[3].id }], // importante, pessoal
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Fazer backup dos projetos',
        description: 'Backup completo no GitHub e Google Drive',
        priority: Priority.LOW,
        completed: true,
        userId: user1.id,
        categoryId: categoriesUser1[0].id, // Trabalho
      },
    }),
    prisma.task.create({
      data: {
        title: 'Renovar certificados SSL',
        description: 'Renovar certificados dos sites antes do vencimento',
        priority: Priority.MEDIUM,
        dueDate: new Date('2024-03-20'),
        userId: user1.id,
        categoryId: categoriesUser1[0].id, // Trabalho
        tags: {
          connect: [{ id: tags[2].id }], // trabalho
        },
      },
    }),
  ]);

  // Criar Tarefas para o usuário 2
  const tasksUser2 = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Reunião com cliente XYZ',
        description: 'Apresentar proposta de design do website',
        priority: Priority.HIGH,
        dueDate: new Date('2024-02-08'),
        userId: user2.id,
        categoryId: categoriesUser2[0].id, // Freelance
        projectId: project3.id,
        tags: {
          connect: [{ id: tags[1].id }, { id: tags[2].id }], // importante, trabalho
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Criar página inicial',
        description: 'Desenvolver a homepage com hero section e features',
        priority: Priority.URGENT,
        dueDate: new Date('2024-02-12'),
        userId: user2.id,
        categoryId: categoriesUser2[0].id, // Freelance
        projectId: project3.id,
        tags: {
          connect: [{ id: tags[0].id }, { id: tags[2].id }], // urgente, trabalho
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Treino de pernas',
        description: 'Agachamento, leg press, panturrilha',
        priority: Priority.MEDIUM,
        completed: true,
        userId: user2.id,
        categoryId: categoriesUser2[1].id, // Fitness
        tags: {
          connect: [{ id: tags[3].id }], // pessoal
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Preparar refeições da semana',
        description: 'Meal prep para segunda a sexta',
        priority: Priority.LOW,
        dueDate: new Date('2024-02-11'),
        userId: user2.id,
        categoryId: categoriesUser2[1].id, // Fitness
        tags: {
          connect: [{ id: tags[3].id }], // pessoal
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Configurar SEO do site',
        description: 'Otimizar meta tags, sitemap e robots.txt',
        priority: Priority.MEDIUM,
        dueDate: new Date('2024-02-25'),
        userId: user2.id,
        categoryId: categoriesUser2[0].id, // Freelance
        projectId: project3.id,
        tags: {
          connect: [{ id: tags[2].id }], // trabalho
        },
      },
    }),
  ]);

  console.log(`✅ ${tasksUser1.length + tasksUser2.length} tarefas criadas`);

  // Estatísticas finais
  const totalUsers = await prisma.user.count();
  const totalTasks = await prisma.task.count();
  const totalCategories = await prisma.category.count();
  const totalProjects = await prisma.project.count();
  const totalTags = await prisma.tag.count();

  console.log('\n📊 Resumo do seed:');
  console.log(`   - Usuários: ${totalUsers}`);
  console.log(`   - Tarefas: ${totalTasks}`);
  console.log(`   - Categorias: ${totalCategories}`);
  console.log(`   - Projetos: ${totalProjects}`);
  console.log(`   - Tags: ${totalTags}`);
  
  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📝 Credenciais dos usuários:');
  console.log('   Email: joao@example.com | Senha: senha123');
  console.log('   Email: maria@example.com | Senha: senha123');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
