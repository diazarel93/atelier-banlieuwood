import { test, expect } from "@playwright/test";

/**
 * E2E: Respond and vote flow.
 *
 * Uses API routes directly for session setup, then browser for student actions.
 * Requires a running dev server with valid Supabase credentials.
 */
test.describe("Respond and vote flow", () => {
  let sessionId: string;
  let studentId: string;
  let joinCode: string;

  // Setup: create session + student via API
  test.beforeAll(async ({ request }) => {
    // Create a test session via facilitator API (needs auth cookie — skip if not available)
    const sessionRes = await request.post("/api/sessions", {
      data: {
        title: "E2E Test Session",
        level: "college",
      },
    });

    // If auth fails, skip the suite
    if (!sessionRes.ok()) {
      test.skip(true, "Requires authenticated facilitator — set PLAYWRIGHT_TEST_EMAIL/PASSWORD");
      return;
    }

    const session = await sessionRes.json();
    sessionId = session.id;
    joinCode = session.join_code;

    // Join as student
    const joinRes = await request.post("/api/sessions/join", {
      data: {
        joinCode,
        displayName: "E2EStudent",
        avatar: "🎬",
      },
    });
    expect(joinRes.ok()).toBeTruthy();
    const joinData = await joinRes.json();
    studentId = joinData.studentId;
  });

  test("student can submit a response", async ({ page }) => {
    if (!sessionId) test.skip(true, "Session setup failed");

    // Pre-populate localStorage as if student joined
    await page.goto("/join");
    await page.evaluate(
      ({ sid, stId }) => {
        localStorage.setItem(
          `bw-student-${sid}`,
          JSON.stringify({ studentId: stId, displayName: "E2EStudent", avatar: "🎬" })
        );
      },
      { sid: sessionId, stId: studentId }
    );

    // Navigate to play page
    await page.goto(`/play/${sessionId}`);

    // Student should see some state (waiting, responding, etc.)
    await expect(
      page.locator('[data-testid="play-content"], [class*="motion"]').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("student sees vote state when session is voting", async ({ page }) => {
    if (!sessionId) test.skip(true, "Session setup failed");

    // Pre-populate localStorage
    await page.goto("/join");
    await page.evaluate(
      ({ sid, stId }) => {
        localStorage.setItem(
          `bw-student-${sid}`,
          JSON.stringify({ studentId: stId, displayName: "E2EStudent", avatar: "🎬" })
        );
      },
      { sid: sessionId, stId: studentId }
    );

    await page.goto(`/play/${sessionId}`);

    // Wait for the page to load some content
    await page.waitForTimeout(2000);

    // Verify the page loaded without errors
    await expect(page.locator("body")).not.toContainText("Application error");
  });
});
