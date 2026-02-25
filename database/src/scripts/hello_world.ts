import 'dotenv/config';
import { prisma } from '../index';

async function main(): Promise<void> {
  await prisma.user.deleteMany({
    where: {
      email: 'test@example.com',
    },
  });

  const createdUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
    },
  });

  console.log('Created user:', createdUser);

  const users = await prisma.user.findMany();
  console.log('All users:', users);
}

void main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
