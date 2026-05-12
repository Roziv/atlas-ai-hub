const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = './dev.db';
const resolvedDbPath = path.resolve(process.cwd(), dbPath);
const adapter = new PrismaBetterSqlite3({ url: resolvedDbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corp',
      slug: 'acme-corp',
      settings: JSON.stringify({
        ai: {
          providers: {
            ollama: { baseUrl: 'http://localhost:11434' },
            openai: { apiKey: '' },
            anthropic: { apiKey: '' },
            gemini: { apiKey: '' }
          },
          modelLibrary: [
            { id: 'm1', name: 'GPT-4o', provider: 'openai', modelId: 'gpt-4o' },
            { id: 'm2', name: 'Claude 3.5 Sonnet', provider: 'anthropic', modelId: 'claude-3-5-sonnet-20240620' }
          ],
          routingRules: [
            { department: 'Default', modelId: 'm1' }
          ]
        }
      })
    }
  });
  console.log("Organization synced:", org.slug);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
