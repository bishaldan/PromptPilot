import { NextResponse } from "next/server";
import { optionalEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/http";

export async function POST() {
  const { user, error } = await requireUser();
  if (!user) {
    return error;
  }

  const policyVersion = optionalEnv("POLICY_VERSION", "v1");
  const consent = await prisma.consent.upsert({
    where: {
      userId_policyVersion: {
        userId: user.id,
        policyVersion
      }
    },
    update: {
      acceptedAt: new Date()
    },
    create: {
      userId: user.id,
      policyVersion
    }
  });

  return NextResponse.json({
    userId: consent.userId,
    policyVersion: consent.policyVersion,
    acceptedAt: consent.acceptedAt
  });
}
