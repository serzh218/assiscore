import { prisma } from '@/lib/db';
import { Plan, Visibility } from '@/types/domain';

async function main() {
  const email = 'demo@assiscore.app';
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: { email, plan: Plan.FREE, tokens: 500 },
    });
    console.log(`Created user: ${user.id}`);
  } else {
    console.log(`User exists: ${user.id}`);
  }

  const demoProjects = [
    { title: 'Demo Project 1', type: 'site' },
    { title: 'Demo Project 2', type: 'site' },
  ];

  for (const p of demoProjects) {
    const existing = await prisma.project.findFirst({
      where: { ownerId: user.id, title: p.title },
    });
    if (!existing) {
      const project = await prisma.project.create({
        data: {
          ownerId: user.id,
          visibility: Visibility.public,
          title: p.title,
          type: p.type,
          spec: {},
        },
      });
      console.log(`Created project: ${project.id}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
