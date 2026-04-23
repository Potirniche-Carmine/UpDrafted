import { describe, it, expect, vi, beforeEach } from "vitest";

const mockExecuteAsAdmin = vi.fn();
const mockSendApproved = vi.fn(async () => {});
const mockSendNeedsInfo = vi.fn(async () => {});
const mockSendDenied = vi.fn(async () => {});

vi.mock("./db-access", () => ({
  executeAsAdmin: (admin: unknown, cb: (tx: unknown) => Promise<unknown>) =>
    mockExecuteAsAdmin(admin, cb),
}));

vi.mock("./email", () => ({
  sendVerificationApprovedEmail: (...args: unknown[]) => mockSendApproved(...args),
  sendVerificationNeedsInfoEmail: (...args: unknown[]) => mockSendNeedsInfo(...args),
  sendVerificationDeniedEmail: (...args: unknown[]) => mockSendDenied(...args),
}));

vi.mock("@updrafted/db", () => ({
  verificationRequests: {},
  verificationFiles: {},
  verificationModeratorComments: {},
  users: {},
  athleteProfiles: {},
  coachProfiles: {},
  recruitingProfiles: {},
}));

vi.mock("drizzle-orm", () => ({
  and: (...args: unknown[]) => ({ type: "and", args }),
  desc: (x: unknown) => ({ type: "desc", x }),
  eq: (a: unknown, b: unknown) => ({ type: "eq", a, b }),
}));

const admin = { userId: "mod-1", role: "admin" as const };

describe("applyVerificationAction validation", () => {
  beforeEach(() => {
    mockExecuteAsAdmin.mockReset();
    mockSendApproved.mockClear();
    mockSendNeedsInfo.mockClear();
    mockSendDenied.mockClear();
  });

  it("rejects deny without a reason", async () => {
    const { applyVerificationAction } = await import("./verifications");
    await expect(
      applyVerificationAction(admin, { requestId: 1, action: "deny" }),
    ).rejects.toThrow(/reason is required/i);
    expect(mockExecuteAsAdmin).not.toHaveBeenCalled();
  });

  it("rejects needs_info without a reason", async () => {
    const { applyVerificationAction } = await import("./verifications");
    await expect(
      applyVerificationAction(admin, { requestId: 1, action: "needs_info", reason: "   " }),
    ).rejects.toThrow(/reason is required/i);
  });

  it("allows approve without a reason and sends approval email", async () => {
    const txUser = { id: "u1", name: "Jane", email: "jane@example.com" };
    mockExecuteAsAdmin.mockImplementation(async (_admin, cb) => {
      const tx = {
        query: {
          verificationRequests: {
            findFirst: vi.fn().mockResolvedValue({
              id: 1,
              userId: "u1",
              role: "athlete",
              moderatorNotes: null,
              user: txUser,
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

    const { applyVerificationAction } = await import("./verifications");
    await applyVerificationAction(admin, { requestId: 1, action: "approve" });
    expect(mockSendApproved).toHaveBeenCalledWith({ to: txUser.email, name: txUser.name });
    expect(mockSendNeedsInfo).not.toHaveBeenCalled();
    expect(mockSendDenied).not.toHaveBeenCalled();
  });
});

describe("addVerificationComment validation", () => {
  beforeEach(() => {
    mockExecuteAsAdmin.mockReset();
  });

  it("rejects an empty comment", async () => {
    const { addVerificationComment } = await import("./verifications");
    await expect(addVerificationComment(admin, 1, "   ")).rejects.toThrow(/required/i);
    expect(mockExecuteAsAdmin).not.toHaveBeenCalled();
  });

  it("rejects a comment longer than 4000 chars", async () => {
    const { addVerificationComment } = await import("./verifications");
    await expect(addVerificationComment(admin, 1, "x".repeat(4001))).rejects.toThrow(/too long/i);
    expect(mockExecuteAsAdmin).not.toHaveBeenCalled();
  });
});
