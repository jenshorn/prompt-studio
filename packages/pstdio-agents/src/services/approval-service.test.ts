import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { ApprovalRequest } from "../types";
import { createApprovalService } from "./approval-service";

describe("createApprovalService", () => {
  let originalSetTimeout: typeof globalThis.setTimeout;
  let originalClearTimeout: typeof globalThis.clearTimeout;
  let timers: { callback: () => void; delay: number; id: number }[];
  let nextTimerId: number;

  beforeEach(() => {
    timers = [];
    nextTimerId = 1;
    originalSetTimeout = globalThis.setTimeout;
    originalClearTimeout = globalThis.clearTimeout;

    globalThis.setTimeout = ((callback: () => void, delay: number) => {
      const id = nextTimerId++;
      timers.push({ callback, delay, id });
      return id;
    }) as unknown as typeof globalThis.setTimeout;

    globalThis.clearTimeout = ((id: number) => {
      timers = timers.filter((t) => t.id !== id);
    }) as unknown as typeof globalThis.clearTimeout;
  });

  afterEach(() => {
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
  });

  const fireTimers = () => {
    const pending = [...timers];
    timers = [];
    for (const t of pending) t.callback();
  };

  test("requestApproval calls send with the request", async () => {
    const sent: ApprovalRequest[] = [];
    const service = createApprovalService((req) => sent.push(req));

    const request: ApprovalRequest = {
      id: "req-1",
      toolName: "Bash",
      toolInput: { command: "npm install" },
      toolUseId: "toolu_01",
    };

    const promise = service.requestApproval(request);

    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({ id: "req-1", toolName: "Bash" });

    service.handleResponse({ id: "req-1", decision: "approve" });
    const result = await promise;
    expect(result.decision).toBe("approve");
  });

  test("handleResponse resolves the pending promise", async () => {
    const service = createApprovalService(() => {});

    const promise = service.requestApproval({
      id: "req-2",
      toolName: "Write",
      toolInput: { path: "/foo.txt" },
      toolUseId: "toolu_02",
    });

    service.handleResponse({ id: "req-2", decision: "deny" });

    const result = await promise;
    expect(result).toMatchObject({ id: "req-2", decision: "deny" });
  });

  test("timeout resolves with timeout decision", async () => {
    const service = createApprovalService(() => {});

    const promise = service.requestApproval({
      id: "req-3",
      toolName: "Bash",
      toolInput: {},
      toolUseId: "toolu_03",
    });

    expect(timers).toHaveLength(1);
    expect(timers[0].delay).toBe(5 * 60 * 1000);

    fireTimers();

    const result = await promise;
    expect(result).toMatchObject({ id: "req-3", decision: "timeout" });
  });

  test("handleResponse clears the timeout timer", async () => {
    const service = createApprovalService(() => {});

    const promise = service.requestApproval({
      id: "req-4",
      toolName: "Bash",
      toolInput: {},
      toolUseId: "toolu_04",
    });

    expect(timers).toHaveLength(1);

    service.handleResponse({ id: "req-4", decision: "approve" });

    expect(timers).toHaveLength(0);

    await promise;
  });

  test("unknown response ID is ignored", () => {
    const service = createApprovalService(() => {});

    service.handleResponse({ id: "unknown-id", decision: "approve" });

    // No error thrown — unknown IDs are silently ignored
  });

  test("multiple concurrent requests are tracked independently", async () => {
    const service = createApprovalService(() => {});

    const p1 = service.requestApproval({ id: "a", toolName: "Read", toolInput: {}, toolUseId: "t1" });
    const p2 = service.requestApproval({ id: "b", toolName: "Write", toolInput: {}, toolUseId: "t2" });

    service.handleResponse({ id: "b", decision: "deny" });
    service.handleResponse({ id: "a", decision: "approve" });

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1.decision).toBe("approve");
    expect(r2.decision).toBe("deny");
  });

  test("responding to same ID twice is a no-op", async () => {
    const service = createApprovalService(() => {});

    const promise = service.requestApproval({ id: "dup", toolName: "Bash", toolInput: {}, toolUseId: "t" });

    service.handleResponse({ id: "dup", decision: "approve" });
    service.handleResponse({ id: "dup", decision: "deny" });

    const result = await promise;
    expect(result.decision).toBe("approve");
  });

  test("dispose clears all pending requests with timeout", async () => {
    const service = createApprovalService(() => {});

    const p1 = service.requestApproval({ id: "x", toolName: "Bash", toolInput: {}, toolUseId: "t1" });
    const p2 = service.requestApproval({ id: "y", toolName: "Read", toolInput: {}, toolUseId: "t2" });

    service.dispose();

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1.decision).toBe("timeout");
    expect(r2.decision).toBe("timeout");
  });
});
