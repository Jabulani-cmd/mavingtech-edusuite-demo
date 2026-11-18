import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const finding = {
  id: "f1", kind: "at_risk", severity: "high", status: "open", title: "Attendance has dropped",
  explanation: "Tariro attended 5 of 12 lessons this month.", suggested_actions: ["Speak to the learner.", "Call the parent."],
  students: { full_name: "Tariro Moyo", admission_number: "A101" }, classes: { name: "Form 1A" }, updated_at: "2026-09-28T10:00:00Z",
};

vi.mock("@/integrations/supabase/client", () => {
  const chain: Record<string, unknown> = {};
  for (const m of ["select", "in", "order"]) chain[m] = vi.fn(() => chain);
  chain.limit = vi.fn(() => Promise.resolve({ data: [finding], error: null }));
  return { supabase: { from: vi.fn(() => chain) } };
});

import NotificationDetail, { type Notification } from "@/components/NotificationDetail";

const base: Notification = {
  id: "n1", title: "School agent: new items to review", type: "info", is_read: true, link: "/portal/teacher",
  message: "1 new item needs your review (learners needing support, registers or marks).", created_at: "2026-09-28T10:00:00Z",
};

const open = (n: Notification | null, onClose = vi.fn()) =>
  render(<MemoryRouter><NotificationDetail notification={n} onClose={onClose} /></MemoryRouter>);

describe("NotificationDetail", () => {
  it("renders nothing when no notification is selected", () => {
    open(null);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("explains a school agent alert and lists the open items behind it", async () => {
    open(base);
    expect(screen.getByText("School agent: new items to review")).toBeTruthy();
    expect(screen.getByText(/needs your review/)).toBeTruthy();
    expect(screen.getByText("What is this?")).toBeTruthy();
    expect(screen.getByText("What do I need to do?")).toBeTruthy();
    await waitFor(() => expect(screen.getByText(/Tariro Moyo · Attendance has dropped/)).toBeTruthy());
    expect(screen.getByText("Tariro attended 5 of 12 lessons this month.")).toBeTruthy();
    expect(screen.getByText("Call the parent.")).toBeTruthy();
    expect(screen.getByText("High priority")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Go to my dashboard" })).toBeTruthy();
  });

  it("shows the full message of an ordinary notification without agent extras", () => {
    const long = "Your timetable for next week changed. ".repeat(10).trim();
    open({ ...base, title: "Timetable updated", message: long, link: null });
    expect(screen.getByText(long)).toBeTruthy();
    expect(screen.queryByText("What is this?")).toBeNull();
    expect(screen.queryByRole("button", { name: "Open" })).toBeNull();
  });

  it("closes from the Close button", () => {
    const onClose = vi.fn();
    open({ ...base, title: "Timetable updated", link: null }, onClose);
    // The dialog has its own X button as well as the footer Close button; either one closes it.
    const closers = screen.getAllByRole("button", { name: "Close" });
    expect(closers.length).toBe(2);
    fireEvent.click(closers[closers.length - 1]);
    expect(onClose).toHaveBeenCalled();
  });
});
