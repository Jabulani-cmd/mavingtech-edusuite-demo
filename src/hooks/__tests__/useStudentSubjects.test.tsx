import { describe, it, expect, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

const state = vi.hoisted(() => ({ selection: "Physics, Chemistry, Biology, Pure Mathematics", refresh: () => {} }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: { id: "learner-account" } }) }));
vi.mock("@/integrations/supabase/client", () => {
  const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ data: { subject_combination: state.selection } }) };
  const channel = { on: (_event: string, _config: unknown, refresh: () => void) => { state.refresh = refresh; return channel; }, subscribe: () => channel };
  return { supabase: { from: () => query, channel: () => channel, removeChannel: vi.fn() } };
});
import { useStudentSubjects } from "../useStudentSubjects";

describe("synchronized learner curriculum", () => {
  it("shows only four selected A-Level subjects and updates when registration changes", async () => {
    const { result } = renderHook(() => useStudentSubjects("learner-record"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.includes("Physics")).toBe(true);
    expect(result.current.includes("Accounting")).toBe(false);
    expect(result.current.includes("Study Hall")).toBe(false);
    expect(result.current.includes("Study Hall", true)).toBe(true);
    await act(async () => { state.selection = "Accounting, Business Studies, Economics, Geography"; state.refresh(); });
    await waitFor(() => expect(result.current.includes("Accounting")).toBe(true));
    expect(result.current.includes("Physics")).toBe(false);
  });
});