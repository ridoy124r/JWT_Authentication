const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log(users);
}

main()
  .then(() => console.log('Success'))
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
