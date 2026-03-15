# Cockpit Audit Report — 2026-03-15

## Critical (5)

| # | File | Issue | Status |
|---|------|-------|--------|
| 1 | `audit-log.ts` + `use-pilot-session.ts` | **All audit logging is a no-op.** `createAdminClient()` (service role key) is imported into client components. `SUPABASE_SERVICE_ROLE_KEY` is `undefined` in browser → every `logAudit()` call silently fails. Move to a `POST /api/audit` server route. | FIXED |
| 2 | `api/sessions/[id]/recap/route.ts` | **No authentication at all.** Any unauthenticated request with a valid session UUID reads all student content including M10 pitches. Add `getUser()` + ownership check. | FIXED |
| 3 | `api/sessions/[id]/bilan/route.ts` | **No ownership check.** Auth is verified but any authenticated user can fetch/generate bilan for any session. Add `requireFacilitator(sessionId)`. | FIXED |
| 4 | `api/sessions/[id]/student-context PATCH` | **Client-supplied XP/stats.** `sessionXp`, `streak`, `totalVotes` are read from body with no validation. A student can send `sessionXp: 999999` to permanently inflate their profile. Compute server-side. | FIXED |
| 5 | `api/sessions/[id]/student-context PATCH` | **Non-atomic read-modify-write on profile stats.** Concurrent completions overwrite each other. Use Postgres `increment` RPC. | TODO — needs DB migration |

## High (8)

| # | File | Issue | Status |
|---|------|-------|--------|
| 6 | `use-pilot-session.ts:211` | **Stale closure.** `session?.status` in `updateSession.onSuccess` reads render-time value, not server response. | FIXED |
| 7 | `use-pilot-session.ts:234-245` | **Race condition.** `validateChoice` reads `situationData` from closure; situation change mid-click posts wrong `situationId`. | FIXED |
| 8 | `use-cockpit-module-flags.ts:39` | **Logic bug.** `isM6Any = mod === 5` — wrong module number, misidentifies M5 as M6. | FIXED |
| 9 | `use-results-data.ts:205-219` | **Memory leak.** 3 `fetch` calls in `useEffect` without `AbortController`. | FIXED |
| 10 | `api/sessions/analytics` | **47 sequential N+1 queries** per call (2 per session × 20 + 7). No rate limit on the most expensive route. Batch with `.in()`. | TODO — needs refactor |
| 11 | `api/sessions/[id]/oie-profile POST` | **N+1 per student.** 3 queries per student × 50 = 150 serial queries. Batch. | TODO — needs refactor |
| 12 | `admin/users/page.tsx` | **Shared mutation freezes all rows.** Single `useMutation` disables every row's buttons when any action fires. Track per user ID. | TODO |
| 13 | `seances/[id]/page.tsx:143,259` | **Unhandled `mutateAsync` rejections.** `.then()` without `.catch()` — silent failures. | FIXED |

## Medium (20)

| # | Area | Issue | Status |
|---|------|-------|--------|
| 14 | `session-queries.ts:169` | `.single()` instead of `.maybeSingle()` on collective choice — false error when none exists | FIXED |
| 15 | `session-queries.ts:130` | `ORDER BY computed_at ASC + LIMIT` returns oldest OIE scores, not newest | FIXED |
| 16 | `use-realtime-invalidation.ts` | `students` table changes don't invalidate `["pilot-session", sid]` — cockpit class map stale | TODO |
| 17 | `statistiques/page.tsx:91` | Podium hidden for exactly 3 students (`<= 3` should be `< 3`) | FIXED |
| 18 | `stuck-alert.tsx` | Exit animation never plays — `AnimatePresence` is inside the early `return null` | FIXED |
| 19 | `response-card.tsx:98` | `setTimeout` not cleaned up on unmount — memory leak | FIXED |
| 20 | `classroom-map.tsx:396` | Invalid CSS `calc(100% * ${fitScale})` — layout broken in some browsers | TODO |
| 21 | `command-palette.tsx` | Student search links use `?q=` but eleves page never reads it | TODO |
| 22 | `admin/invitations/page.tsx:51` | `navigator.clipboard` without guard — TypeError in non-HTTPS | TODO |
| 23 | `notification-bell.tsx` | No focus trap when panel open — WCAG 2.1 violation | TODO |
| 24 | `use-stuck-detection.ts` | Dead import `STUCK_DETECTION_DELAY_MS` removed | FIXED |
| 25 | `use-undo-stack.ts` | Toast "Refaire" creates ghost entry after redo stack cleared; network errors silently discarded | FIXED |
| 26 | `use-confirm-action.ts:86-94` | Action errors silently swallowed; dialog closes even on failure | FIXED |
| 27 | API routes (stats, question-analytics) | Raw Supabase error messages leaked to client — exposes schema details | TODO |
| 28 | `student-profiles/route.ts` | Returns both `profiles` and `data` (duplicate payload); empty case omits pagination fields | TODO |
| 29 | Multiple analytics routes | Missing rate limits on expensive multi-query endpoints | TODO |
| 30 | `api/sessions/[id]/hand-raise POST` | No auth on `studentId` body value — anyone who knows a studentId can raise their hand | TODO |
| 31 | `notable-responses/route.ts` | RLS check then switches to admin client — fragile dual-client pattern | TODO |
| 32 | `api/sessions/[id]/reset-responses` | Serial updates per response instead of single `.in()` UPDATE | TODO |
| 33 | `cockpit-header.tsx:453` | Dead ternary: `isDarkMode ? "🌙" : "🌙"` — both branches identical | FIXED |

## Low (17)

- Missing `type="button"` on ~8 buttons across cockpit-header, bulk-response-toolbar, stuck-alert (PARTIAL — stuck-alert FIXED), question-card
- Hardcoded colors outside `bw-*` tokens (eleves/[profileId], cockpit-header, question-card)
- `useMemo`/`useCallback` gaps on derived data (seances, bibliotheque, admin/users, classroom-map)
- Duplicate skeleton component in dashboard page (local vs PageSkeleton)
- Module-level mutable counter in `session-timeline.ts`
- Unnecessary `"use client"` on static aide page
- Dead code in `student-profiles/[profileId]/route.ts` (empty loop body)
- Inconsistent French accents in UI strings — seances/[id] breadcrumbs FIXED, others TODO
- `BOTTOM_NAV_ITEMS` using fragile positional `slice` in app-shell
- `any` types in module10 handlers
- `seances/page.tsx:154` dead filter condition (`&& s.status !== "waiting"` always true)
- `fiche-cours/page.tsx:75` unsafe type assertion on AI response
- `glass-card.tsx` double cast through `unknown`
- `session-timeline.tsx:173` module-level mutable `eventCounter`
- `aide/page.tsx:170` hardcoded `max-h-40` clips long answers
- `app-shell.tsx` JSX elements in module-level `NAV_ITEMS` array
- `eleves/page.tsx` no "no results" empty state for search; CSV export anchor not appended to DOM
- `generateBible` did not check `res.ok` before parsing JSON — FIXED

## Summary

**Fixed: 20 issues** (4 critical, 5 high, 9 medium, 2 low)
**Remaining: 13 issues** (1 critical, 3 high, 9 medium) — require DB migrations, larger refactors, or UI rework
