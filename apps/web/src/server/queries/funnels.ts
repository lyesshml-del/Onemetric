import { EventType, FunnelMatchType, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Funnels for a project, with step counts. */
export function listFunnels(projectId: string) {
  return prisma.funnel.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      createdAt: true,
      _count: { select: { steps: true } },
    },
  });
}

/** A funnel with its ordered steps + project, only if owned by the user. */
export function getOwnedFunnel(ownerId: string, funnelId: string) {
  return prisma.funnel.findFirst({
    where: { id: funnelId, project: { ownerId } },
    include: {
      steps: { orderBy: { order: "asc" } },
      project: { select: { id: true, name: true, domain: true } },
    },
  });
}

type StepMatch = {
  order: number;
  matchType: FunnelMatchType;
  matchValue: string;
};

export type FunnelStepResult = {
  order: number;
  matchType: FunnelMatchType;
  matchValue: string;
  count: number;
  conversion: number; // relative to the first step (0..1)
  dropFromPrev: number; // sessions lost vs previous step
};

export type FunnelResults = {
  steps: FunnelStepResult[];
  entered: number;
  overallConversion: number; // last step / first step (0..1)
};

/**
 * Sequential funnel: for each session, walk its events in time order and advance
 * through the funnel steps. A session "reaches" step k only after matching steps
 * 1..k in order. Counts how many sessions reached each step.
 */
export type FunnelEvent = {
  sessionId: string;
  type: EventType;
  name: string;
  path: string | null;
};

export async function getFunnelResults(
  projectId: string,
  steps: StepMatch[],
  from: Date,
  to: Date,
): Promise<FunnelResults> {
  const ordered = [...steps].sort((a, b) => a.order - b.order);

  const pageviewPaths = ordered
    .filter((s) => s.matchType === FunnelMatchType.PAGEVIEW_PATH)
    .map((s) => s.matchValue);
  const customNames = ordered
    .filter((s) => s.matchType === FunnelMatchType.CUSTOM_EVENT)
    .map((s) => s.matchValue);

  const or: Prisma.EventWhereInput[] = [];
  if (pageviewPaths.length) {
    or.push({ type: EventType.PAGEVIEW, path: { in: pageviewPaths } });
  }
  if (customNames.length) {
    or.push({ type: EventType.CUSTOM, name: { in: customNames } });
  }

  const events =
    or.length > 0
      ? await prisma.event.findMany({
          where: { projectId, createdAt: { gte: from, lte: to }, OR: or },
          orderBy: [{ sessionId: "asc" }, { createdAt: "asc" }],
          select: { sessionId: true, type: true, name: true, path: true },
        })
      : [];

  return computeFunnel(events, ordered);
}

/**
 * Pure sequential-funnel computation. `events` MUST be ordered by session, then
 * time. For each session, walk its events advancing a step pointer; a session
 * "reaches" step k only after matching steps 1..k in order. Counts how many
 * sessions reached each step.
 */
export function computeFunnel(
  events: FunnelEvent[],
  steps: StepMatch[],
): FunnelResults {
  const ordered = [...steps].sort((a, b) => a.order - b.order);
  const counts = new Array(ordered.length).fill(0);

  let i = 0;
  while (i < events.length) {
    const sessionId = events[i].sessionId;
    let pointer = 0;
    while (i < events.length && events[i].sessionId === sessionId) {
      if (pointer < ordered.length && matchesStep(events[i], ordered[pointer])) {
        pointer++;
      }
      i++;
    }
    for (let k = 0; k < pointer; k++) counts[k]++;
  }

  const entered = counts[0] ?? 0;
  const stepResults: FunnelStepResult[] = ordered.map((s, idx) => ({
    order: s.order,
    matchType: s.matchType,
    matchValue: s.matchValue,
    count: counts[idx],
    conversion: entered > 0 ? counts[idx] / entered : 0,
    dropFromPrev: idx === 0 ? 0 : counts[idx - 1] - counts[idx],
  }));

  return {
    steps: stepResults,
    entered,
    overallConversion:
      entered > 0 ? (counts[ordered.length - 1] ?? 0) / entered : 0,
  };
}

function matchesStep(ev: FunnelEvent, step: StepMatch): boolean {
  if (step.matchType === FunnelMatchType.PAGEVIEW_PATH) {
    return ev.type === EventType.PAGEVIEW && ev.path === step.matchValue;
  }
  return ev.type === EventType.CUSTOM && ev.name === step.matchValue;
}
