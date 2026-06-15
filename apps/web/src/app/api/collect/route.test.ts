import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Drive the ingest layer via a plain (non-spy) mock so that an error thrown
// inside it is handled purely by the route's try/catch. Using vi.fn here would
// let Vitest's spy result-tracking re-surface the thrown error and fail the test
// even though the route catches it correctly.
const state = vi.hoisted(() => ({
  calls: 0,
  mode: "ok" as "ok" | "fail",
}));
vi.mock("@/server/ingest/collect", () => ({
  ingest: async () => {
    state.calls++;
    if (state.mode === "fail") throw new Error("db pool timeout");
    return { ok: true };
  },
}));

import { POST } from "./route";

function makeReq(body: unknown) {
  return new NextRequest("https://app.example/api/collect", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const validBody = { publicKey: "om_x", type: "pageview", name: "/" };

describe("POST /api/collect", () => {
  beforeEach(() => {
    state.calls = 0;
    state.mode = "ok";
  });

  it("returns 204 on a valid payload", async () => {
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(204);
    expect(state.calls).toBe(1);
  });

  it("still returns 204 when ingest fails (DB error must not 500)", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    state.mode = "fail";
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(204);
    expect(state.calls).toBe(1);
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it("returns 400 on malformed JSON without touching ingest", async () => {
    const res = await POST(makeReq("not json"));
    expect(res.status).toBe(400);
    expect(state.calls).toBe(0);
  });

  it("returns 400 on an invalid payload without touching ingest", async () => {
    const res = await POST(makeReq({ type: "pageview" }));
    expect(res.status).toBe(400);
    expect(state.calls).toBe(0);
  });
});
