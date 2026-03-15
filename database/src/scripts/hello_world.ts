import 'dotenv/config';
import { prisma } from '../index';

async function main(): Promise<void> {
  const createdUser = await prisma.user.create({
    data: {
      firstName: 'Test',
      secondName: 'User',
      email: 'test@example.com',
      groupNumber: 1,
      role: 'student',
    },
  });

  console.log('Created user:', createdUser);

  await prisma.user.delete({ where: { id: createdUser.id } });
  console.log('Success');
}

void main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
