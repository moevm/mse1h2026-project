import 'dotenv/config';

async function main(): Promise<void> {
  console.log('Hello, World!');
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
