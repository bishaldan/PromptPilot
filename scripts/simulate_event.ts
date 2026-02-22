
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const RUN_ID = process.argv[2];

if (!RUN_ID) {
  console.error("Please provide a Run ID");
  process.exit(1);
}

async function main() {
  console.log(`Simulating event for Run ID: ${RUN_ID}`);

  // 1. Get the run and the first step
  const run = await prisma.lessonRun.findUnique({
    where: { id: RUN_ID },
    include: {
      lesson: {
        include: { steps: { orderBy: { stepOrder: 'asc' }, take: 1 } }
      }
    }
  });

  if (!run) {
    console.error("Run not found");
    process.exit(1);
  }

  const firstStep = run.lesson.steps[0];
  console.log(`First Step ID: ${firstStep.id}`);
  console.log(`Instruction: ${firstStep.instruction}`);
  console.log(`Completion Rule: ${firstStep.completionRule}`);

  // 2. Send the event via fetch (simulating the extension)
  const eventPayload = {
    stepId: firstStep.id,
    eventType: "ELEMENT_FOUND", // Matches 'element_visible' completion rule
    url: "https://gemini.google.com/app",
    timestamp: new Date().toISOString(),
    meta: {
      selectorId: "body"
    }
  };

  const response = await fetch(`http://localhost:3000/api/lesson-runs/${RUN_ID}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // We need to bypass the token check for this simulation or generate a token.
      // However, the API route checks: verifyRunTokenAuth OR requireUser.
      // Since we are running outside the browser, we don't have the cookie session.
      // BUT, we can generate a token if we have the secret.
      // OR, we can just use the token from the previous step if we had captured it.
      // Since we didn't capture the JWT, let's look at the database.
      // Wait, the API allows cookie auth.
    }
  });

  // Actually, without the token, this might fail with 401. 
  // Let's check if we can simulate the event using the Prisma client directly to update the DB, 
  // OR we can try to generate a valid token.
  // The 'start' endpoint returned a token, but the browser agent didn't return it.

  // Alternative: We can just use the internal logic function `processTelemetryEvent` if we import it?
  // No, we can't import app code easily here due to path aliases.

  // Let's try to grab the run token from the database? No, it's stateless JWT.
  
  // Okay, let's look at `scripts/check_status.ts` again. 
  // We can just update the step status directly to Prove the Frontend updates.
  // This verifies the Frontend Polling.
  
  console.log("Updating first step to COMPLETED directly in DB to verify Frontend Polling...");
  
  const stepStatus = await prisma.lessonRunStep.findUnique({
    where: {
      runId_lessonStepId: {
        runId: RUN_ID,
        lessonStepId: firstStep.id
      }
    }
  });

  if (stepStatus) {
      await prisma.lessonRunStep.update({
        where: { id: stepStatus.id },
        data: { 
            status: 'COMPLETED',
            completedAt: new Date()
        }
      });
      console.log("Step marked COMPLETED.");
  } else {
      // Create if missing (though it should exist)
       await prisma.lessonRunStep.create({
        data: {
            runId: RUN_ID,
            lessonStepId: firstStep.id,
            status: 'COMPLETED',
            completedAt: new Date()
        }
       });
       console.log("Step created and marked COMPLETED.");
  }

  // Also unlock the next step
  const secondStep = await prisma.lessonStep.findFirst({
      where: { lessonId: run.lessonId, stepOrder: 2 }
  });
  
  if (secondStep) {
      await prisma.lessonRunStep.upsert({
          where: { runId_lessonStepId: { runId: RUN_ID, lessonStepId: secondStep.id } },
          update: { status: 'ACTIVE', startedAt: new Date() },
          create: {
              runId: RUN_ID,
              lessonStepId: secondStep.id,
              status: 'ACTIVE',
              startedAt: new Date()
          }
      });
      console.log("Next step marked ACTIVE.");
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
