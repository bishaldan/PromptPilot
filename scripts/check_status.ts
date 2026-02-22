
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Checking for recent Lesson Runs...");
  const runs = await prisma.lessonRun.findMany({
    take: 5,
    orderBy: { startedAt: 'desc' },
    include: {
      user: true,
      lesson: true,
      steps: {
        where: { status: 'COMPLETED' }
      },
      telemetry: {
        take: 5,
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (runs.length === 0) {
    console.log("No lesson runs found.");
    return;
  }

  for (const run of runs) {
    console.log(`\nRun ID: ${run.id}`);
    console.log(`User: ${run.user.email}`);
    console.log(`Lesson: ${run.lesson.title}`);
    console.log(`Status: ${run.status}`);
    console.log(`Completed Steps: ${run.steps.length}`);
    console.log(`Recent Telemetry Events: ${run.telemetry.length} (showing last 5)`);
    run.telemetry.forEach(t => {
      console.log(`  - [${t.eventType}] at ${t.createdAt.toISOString()}`);
    });
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
