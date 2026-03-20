import { readdirSync, readFileSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { LessonSeed, ToolSeed } from "../src/types/lesson";

const prisma = new PrismaClient();

function readOptionalEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

async function seedAdminUser() {
  const adminEmail = readOptionalEnv("SEED_ADMIN_EMAIL");
  const adminPass = readOptionalEnv("SEED_ADMIN_PASSWORD");
  const policyVersion = readOptionalEnv("POLICY_VERSION") ?? "v1";

  if (!adminEmail || !adminPass) {
    console.log("Skipped admin bootstrap. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to create an admin user.");
    return;
  }

  if (adminPass.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 12 characters long.");
  }

  const crypto = await import("crypto");
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(adminPass, salt, 120_000, 64, "sha512").toString("hex");
  const passwordHash = `${salt}:${hash}`;

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "admin", displayName: "Admin", passwordHash },
    create: {
      email: adminEmail,
      passwordHash,
      displayName: "Admin",
      role: "admin",
    },
  });

  await prisma.consent.upsert({
    where: {
      userId_policyVersion: {
        userId: adminUser.id,
        policyVersion,
      },
    },
    update: { acceptedAt: new Date() },
    create: {
      userId: adminUser.id,
      policyVersion,
      acceptedAt: new Date(),
    },
  });

  console.log(`Seeded admin user for ${adminEmail}.`);
}

async function main() {
  // ── 1. Seed tools from data/tools.json ──
  const toolsPath = path.join(process.cwd(), "data", "tools.json");
  const tools = JSON.parse(readFileSync(toolsPath, "utf8")) as ToolSeed[];

  for (const tool of tools) {
    await prisma.tool.upsert({
      where: { id: tool.id },
      update: {
        slug: tool.slug,
        name: tool.name,
        icon: tool.icon ?? null,
        color: tool.color ?? null,
        description: tool.description ?? null,
        isActive: true,
      },
      create: {
        id: tool.id,
        slug: tool.slug,
        name: tool.name,
        icon: tool.icon ?? null,
        color: tool.color ?? null,
        description: tool.description ?? null,
        isActive: true,
      },
    });
  }
  console.log(`Seeded ${tools.length} tool(s).`);

  // ── 2. Auto-discover lesson JSON files ──
  const lessonsDir = path.join(process.cwd(), "data", "lessons");
  const files = readdirSync(lessonsDir).filter((f) => f.endsWith(".json"));

  let totalLessons = 0;

  for (const file of files) {
    const filePath = path.join(lessonsDir, file);
    const lessons = JSON.parse(readFileSync(filePath, "utf8")) as LessonSeed[];

    // Build a set of valid tool IDs for validation
    const toolIds = new Set(tools.map((t) => t.id));

    for (const lesson of lessons) {
      if (!toolIds.has(lesson.tool)) {
        console.warn(`⚠ Skipping lesson "${lesson.id}" — unknown tool "${lesson.tool}"`);
        continue;
      }

      await prisma.lesson.upsert({
        where: { id: lesson.id },
        update: {
          toolId: lesson.tool,
          title: lesson.title,
          description: lesson.description,
          difficulty: lesson.difficulty ?? "BEGINNER",
          category: lesson.category ?? null,
          estimatedMinutes: lesson.estimatedMinutes ?? null,
          isActive: true,
        },
        create: {
          id: lesson.id,
          toolId: lesson.tool,
          title: lesson.title,
          description: lesson.description,
          difficulty: lesson.difficulty ?? "BEGINNER",
          category: lesson.category ?? null,
          estimatedMinutes: lesson.estimatedMinutes ?? null,
          isActive: true,
        },
      });

      for (const step of lesson.steps) {
        await prisma.lessonStep.upsert({
          where: { id: step.id },
          update: {
            lessonId: lesson.id,
            stepOrder: step.order,
            instruction: step.instruction,
            urlPattern: step.urlPattern,
            actionType: step.actionType,
            completionRule: step.completionRule,
            allowManualConfirm: step.allowManualConfirm,
            targetSelectors: step.targetSelectors,
            configJson: {
              actionType: step.actionType,
              completionRule: step.completionRule,
              targetSelectors: step.targetSelectors,
              urlPattern: step.urlPattern,
              allowManualConfirm: step.allowManualConfirm,
              coachText: step.coachText ?? null,
            },
          },
          create: {
            id: step.id,
            lessonId: lesson.id,
            stepOrder: step.order,
            instruction: step.instruction,
            urlPattern: step.urlPattern,
            actionType: step.actionType,
            completionRule: step.completionRule,
            allowManualConfirm: step.allowManualConfirm,
            targetSelectors: step.targetSelectors,
            configJson: {
              actionType: step.actionType,
              completionRule: step.completionRule,
              targetSelectors: step.targetSelectors,
              urlPattern: step.urlPattern,
              allowManualConfirm: step.allowManualConfirm,
              coachText: step.coachText ?? null,
            },
          },
        });
      }

      totalLessons++;
    }
  }

  console.log(`Seeded ${totalLessons} lesson(s) across ${files.length} file(s).`);
  await seedAdminUser();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
