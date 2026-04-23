import { describe, it, expect, vi, beforeEach } from "vitest";

const mockExecuteAsAdmin = vi.fn();
const mockSendBan = vi.fn(async () => {});

vi.mock("./db-access", () => ({
  executeAsAdmin: (admin: unknown, cb: (tx: unknown) => Promise<unknown>) =>
    mockExecuteAsAdmin(admin, cb),
}));

vi.mock("./email", () => ({
  sendReportBanEmail: (...args: unknown[]) => mockSendBan(...args),
}));

vi.mock("@updrafted/db", () => ({
  reports: {},
  reportModeratorComments: {},
  users: {},
}));

vi.mock("drizzle-orm", () => ({
  desc: (x: unknown) => ({ type: "desc", x }),
  eq: (a: unknown, b: unknown) => ({ type: "eq", a, b }),
}));

vi.mock("drizzle-orm/pg-core", () => ({
  alias: (table: unknown, name: string) => ({ __alias: name, table }),
}));

const admin = { userId: "mod-1", role: "admin" as const };

describe("applyReportAction validation", () => {
  beforeEach(() => {
    mockExecuteAsAdmin.mockReset();
    mockSendBan.mockClear();
  });

  it("rejects a ban without a reason", async () => {
    const { applyReportAction } = await import("./reports");
    await expect(
      applyReportAction(admin, { reportId: 1, action: "ban_permanent" }),
    ).rejects.toThrow(/reason is required/i);
    expect(mockExecuteAsAdmin).not.toHaveBeenCalled();
  });

  it("rejects a temporary ban without a duration", async () => {
    const { applyReportAction } = await import("./reports");
    await expect(
      applyReportAction(admin, {
        reportId: 1,
        action: "ban_temporary",
        reason: "Harassment",
      }),
    ).rejects.toThrow(/duration/i);
  });

  it("rejects absurd durations", async () => {
    const { applyReportAction } = await import("./reports");
    await expect(
      applyReportAction(admin, {
        reportId: 1,
        action: "ban_temporary",
        reason: "Harassment",
        durationDays: 99999,
      }),
    ).rejects.toThrow(/duration/i);
    await expect(
      applyReportAction(admin, {
        reportId: 1,
        action: "ban_temporary",
        reason: "Harassment",
        durationDays: 0,
      }),
    ).rejects.toThrow(/duration/i);
  });

  it("refuses to ban the acting moderator", async () => {
    mockExecuteAsAdmin.mockImplementation(async (_admin, cb) => {
      const tx = {
        query: {
          reports: {
            findFirst: vi.fn().mockResolvedValue({
              id: 1,
              reportedUserId: "mod-1",
              moderatorNotes: null,
              reportedUser: {
                id: "mod-1",
                name: "Self",
                email: "self@example.com",
                role: "admin",
              },
            }),
          },
        },
      };
      return cb(tx);
    });
    const { applyReportAction } = await import("./reports");
    await expect(
      applyReportAction(admin, {
        reportId: 1,
        action: "ban_permanent",
        reason: "x",
      }),
    ).rejects.toThrow(/ban yourself/i);
    expect(mockSendBan).not.toHaveBeenCalled();
  });

  it("refuses to ban an admin", async () => {
    mockExecuteAsAdmin.mockImplementation(async (_admin, cb) => {
      const tx = {
        query: {
          reports: {
            findFirst: vi.fn().mockResolvedValue({
              id: 1,
              reportedUserId: "u2",
              moderatorNotes: null,
              reportedUser: {
                id: "u2",
                name: "Other",
                email: "other@example.com",
                role: "admin",
              },
            }),
          },
        },
      };
      return cb(tx);
    });
    const { applyReportAction } = await import("./reports");
    await expect(
      applyReportAction(admin, {
        reportId: 1,
        action: "ban_permanent",
        reason: "x",
      }),
    ).rejects.toThrow(/admin/i);
  });

  it("declines a report without requiring a reason", async () => {
    mockExecuteAsAdmin.mockImplementation(async (_admin, cb) => {
      const tx = {
        query: {
          reports: {
            findFirst: vi.fn().mockResolvedValue({
              id: 1,
              reportedUserId: "u2",
              moderatorNotes: null,
              reportedUser: {
                id: "u2",
                name: "Other",
                email: "other@example.com",
                role: "athlete",
              },
            }),
          },
        },
        update: vi.fn(() => ({
          set: vi.fn(() => ({
            where: vi.fn().mockResolvedValue(undefined),
          })),
        })),
      };
      return cb(tx);
    });
    const { applyReportAction } = await import("./reports");
    await applyReportAction(admin, { reportId: 1, action: "decline" });
    expect(mockSendBan).not.toHaveBeenCalled();
  });
});

describe("addReportComment validation", () => {
  beforeEach(() => {
    mockExecuteAsAdmin.mockReset();
  });

  it("rejects an empty comment", async () => {
    const { addReportComment } = await import("./reports");
    await expect(addReportComment(admin, 1, "")).rejects.toThrow(/required/i);
    expect(mockExecuteAsAdmin).not.toHaveBeenCalled();
  });

  it("rejects a comment longer than 4000 chars", async () => {
    const { addReportComment } = await import("./reports");
    await expect(addReportComment(admin, 1, "x".repeat(4001))).rejects.toThrow(/too long/i);
    expect(mockExecuteAsAdmin).not.toHaveBeenCalled();
  });
});
