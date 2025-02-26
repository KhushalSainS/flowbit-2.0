import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create a demo user
  const hashedPassword = await hash('password123', 10);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@flowbit.com' },
    update: {},
    create: {
      email: 'demo@flowbit.com',
      name: 'Demo User',
      password: hashedPassword,
    },
  });

  console.log(`Created demo user: ${demoUser.name}`);

  // Create a sample document for the demo user
  const demoDocument = await prisma.document.create({
    data: {
      title: 'Sample Document',
      description: 'This is a sample document for demonstration purposes.',
      fileName: 'sample.pdf',
      filePath: '/assets/uploads/sample.pdf',
      fileType: 'application/pdf',
      fileSize: 1024, // 1KB
      userId: demoUser.id,
    },
  });

  console.log(`Created demo document: ${demoDocument.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
