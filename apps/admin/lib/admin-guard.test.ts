import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetSession = vi.fn();

vi.mock("next/headers", () => ({
  headers: async () => new Map(),
}));

vi.mock("./auth", () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
  },
}));

describe("getAdminSession", () => {
  beforeEach(() => {
    mockGetSession.mockReset();
  });

  it("returns null when there is no session", async () => {
    mockGetSession.mockResolvedValue(null);
    const { getAdminSession } = await import("./admin-guard");
    expect(await getAdminSession()).toBeNull();
  });

  it("returns null for a non-admin user", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "u", email: "a@b.c", name: "A", role: "athlete", banned: false },
    });
    const { getAdminSession } = await import("./admin-guard");
    expect(await getAdminSession()).toBeNull();
  });

  it("returns null for a banned admin (defensive)", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "u", email: "a@b.c", name: "A", role: "admin", banned: true },
    });
    const { getAdminSession } = await import("./admin-guard");
    expect(await getAdminSession()).toBeNull();
  });

  it("returns a session for a real admin", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "u", email: "a@b.c", name: "A", role: "admin", banned: false },
    });
    const { getAdminSession } = await import("./admin-guard");
    expect(await getAdminSession()).toEqual({
      userId: "u",
      role: "admin",
      email: "a@b.c",
      name: "A",
    });
  });
});
