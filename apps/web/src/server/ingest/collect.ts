import { Prisma, EventType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CollectInput } from "@/lib/validation/collect";
import { parseUserAgent } from "./ua";
import { computeVisitorHash } from "./visitor";

/** A visit ends after 30 minutes of inactivity. */
const SESSION_WINDOW_MS = 30 * 60 * 1000;

export type IngestContext = {
  ip: string;
  userAgent: string;
  country: string | null;
};

export type IngestResult =
  | { ok: true }
  | { ok: false; reason: "unknown_project" };

/**
 * Resolves the project from its public key, attaches the event to the current
 * session (creating one when needed), and records the event. All writes go
 * through Prisma.
 */
export async function ingest(
  input: CollectInput,
  ctx: IngestContext,
): Promise<IngestResult> {
  const project = await prisma.project.findUnique({
    where: { publicKey: input.publicKey },
    select: { id: true },
  });
  if (!project) return { ok: false, reason: "unknown_project" };

  const now = new Date();
  const isPageview = input.type === "pageview";
  const path = input.path ?? input.name;
  const visitorHash = computeVisitorHash({
    ip: ctx.ip,
    userAgent: ctx.userAgent,
    projectId: project.id,
  });

  const existing = await prisma.session.findFirst({
    where: {
      projectId: project.id,
      visitorHash,
      lastEventAt: { gte: new Date(now.getTime() - SESSION_WINDOW_MS) },
    },
    orderBy: { lastEventAt: "desc" },
    select: { id: true },
  });

  let sessionId: string;
  if (existing) {
    sessionId = existing.id;
    await prisma.session.update({
      where: { id: existing.id },
      data: {
        lastEventAt: now,
        ...(isPageview
          ? { pageviewCount: { increment: 1 }, exitPath: path }
          : {}),
      },
    });
  } else {
    const { device, browser, os } = parseUserAgent(ctx.userAgent);
    const created = await prisma.session.create({
      data: {
        projectId: project.id,
        visitorHash,
        startedAt: now,
        lastEventAt: now,
        pageviewCount: isPageview ? 1 : 0,
        entryPath: path,
        exitPath: path,
        referrer: input.referrer ?? null,
        referrerDomain: safeHostname(input.referrer),
        utmSource: input.utmSource ?? null,
        utmMedium: input.utmMedium ?? null,
        utmCampaign: input.utmCampaign ?? null,
        country: ctx.country,
        device,
        browser,
        os,
      },
      select: { id: true },
    });
    sessionId = created.id;
  }

  await prisma.event.create({
    data: {
      projectId: project.id,
      sessionId,
      type: isPageview ? EventType.PAGEVIEW : EventType.CUSTOM,
      name: input.name,
      path,
      referrer: input.referrer ?? null,
      metadata: input.metadata
        ? (input.metadata as Prisma.InputJsonValue)
        : undefined,
    },
  });

  return { ok: true };
}

function safeHostname(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname || null;
  } catch {
    return null;
  }
}
