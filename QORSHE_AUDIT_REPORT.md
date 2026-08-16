# QORSHE Personal Finance Platform — Modules 1–15 Audit Report

**Audit date:** 16 August 2026  
**Repository:** `Mr-Isse/Qorshe`  
**Audited commit:** `92d80c2` (`fix: harden audit findings across finance modules`)  
**Scope:** Security, ownership, data integrity, financial calculations, strict USD/SOS isolation, AI safety, notifications, mobile/admin contracts, builds, and non-destructive verification. Payment integration was not implemented.

## A. Project health

The repository contains the expected backend, mobile, and admin applications. The backend compiles successfully, the admin production bundle compiles successfully, and the mobile TypeScript project passes a no-emission type check. The Prisma schema contains the Modules 1–15 model set and the migration directory contains the initial migration plus module migrations through investment management.

The audit identified and fixed multiple real defects in authentication, notification ownership, AI error handling, debt calculations, investment mutation authorization, report-period arithmetic, goal currency validation, and investment input validation. No cross-user financial read path was identified in the reviewed user controllers; user-facing financial queries consistently use the authenticated user ID, while admin routes use the admin role middleware.

The platform is **not yet releasable for payment integration** because the available environment did not contain `DATABASE_URL`. Consequently, Prisma schema validation, migration status, live database regression, endpoint ownership tests, and the requested real-data end-to-end flow could not be completed. The code/build gate passed, but the data-backed release gate remains open.

| Area | Result | Evidence and qualification |
|---|---|---|
| Backend | **PASS — code/build** | `npm run build` passed after the final fixes. Live database tests were blocked by missing `DATABASE_URL`. |
| Admin | **PASS — build** | `npm run build` passed; Vite emitted only a bundle-size warning. |
| Mobile | **PASS — TypeScript** | `npx tsc --noEmit` passed. Expo runtime/device testing was not available in this audit environment. |
| Database | **BLOCKED** | `prisma validate` and `prisma migrate status` could not load because `DATABASE_URL` was not configured. No destructive database command was run. |
| Currency isolation | **PASS — static/pure logic review** | Financial summaries and reports group USD and SOS separately; no conversion or cross-currency arithmetic was found in the reviewed paths. Live database proof remains pending. |
| Authentication/authorization | **PASS — corrected code paths** | Current user status and role are now rechecked for every access-token request; refresh also checks status. Live request tests remain pending. |
| AI | **PASS — safety/code review** | User ownership is scoped; the provider error is generic; failed user prompts are removed; chat now has a rate limit. Live provider behavior was not tested. |
| Notifications | **PASS — corrected contract/ownership paths** | Preference fields now round-trip; push-token reassignment across users returns `409`. Live push delivery was not tested. |
| Payment integration | **NOT IMPLEMENTED** | Correctly excluded from this audit scope. |

## B. Issues found and fixes

| File and line | Severity | Problem and root cause | Fix |
|---|---:|---|---|
| `backend/src/middleware/auth.middleware.ts:5–20` | **HIGH** | A still-valid access token could continue to authorize a suspended or deactivated user, and a stale JWT role could continue to grant an old admin role. The middleware trusted token claims without loading current user state. | The middleware now loads the user by token subject, requires `ACTIVE` status, and uses the current database role. |
| `backend/src/controllers/auth.controller.ts:64–68` | **HIGH** | Refresh-token rotation did not reject users whose account status changed after token issuance. | Refresh now rejects non-`ACTIVE` users before rotating tokens. |
| `backend/src/controllers/notification.controller.ts:19–20` | **MEDIUM** | `debtNotifications` and `investmentNotifications` existed in the schema and validator but were omitted from preference response selections, so the mobile preference contract could not round-trip those toggles. | Both fields were added to preference `select` objects for read and update responses. |
| `backend/src/controllers/notification.controller.ts:21` | **HIGH** | Device registration used a unique-token upsert that reassigned an existing Expo token to the latest authenticated user. A user who knew another user’s token could redirect push notifications. | Existing tokens owned by another user now return `409`; same-user re-registration updates only that owner’s device record. |
| `backend/src/modules/ai/ai.controller.ts:7` | **HIGH** | The user prompt was persisted before provider execution. Provider failure left an orphaned user message in conversation history, and the upstream error string was returned to the client. | The failed prompt is removed on provider failure, and the response now uses a generic provider-unavailable message. |
| `backend/src/modules/ai/ai.routes.ts:6–8` | **MEDIUM** | AI chat had no endpoint-specific rate limit despite invoking an external provider. | Added a 30-requests-per-minute chat limiter. |
| `backend/src/services/debt.service.ts:4` | **MEDIUM** | A debt due on the current calendar day was marked overdue as soon as the current timestamp passed midnight because the stored date was compared directly to `now`. | Due-date comparison now uses the end of the stored UTC calendar day, so a same-day debt remains active through that day. |
| `backend/src/services/debt.service.ts:5` | **MEDIUM** | List, upcoming, and admin debt responses selected no repayments, causing `serializeDebt` to report `totalPaid = 0` even when the debt had repayments. | `totalPaid` is now derived from `originalAmount - remainingAmount`, while loaded repayment history remains serialized when present. |
| `backend/src/services/investment.service.ts:7` | **HIGH** | Investment transaction mutation performed an unconditional update by investment ID before checking `userId`. A cross-user ID could mutate `updatedAt`, and an unknown ID could produce an unintended 500 instead of the controller’s not-found path. | Removed the pre-authorization update. Ownership is checked before any mutation, and the final update still records the mutation. |
| `backend/src/validators/investment.validator.ts:6` | **MEDIUM** | Zero-value `DEPOSIT`, `WITHDRAWAL`, and `OTHER` records were accepted. BUY/SELL accepted zero price while deriving the ledger amount from `quantity × price`. | Non-BUY/SELL transaction amounts must be positive; BUY/SELL quantity and price must be positive. |
| `backend/src/services/report.service.ts:14` | **MEDIUM** | Budget reports selected budgets overlapping a requested period but aggregated spending across the entire budget window, causing reports to include transactions outside the selected report period. | Spending aggregation is clipped to the intersection of the budget interval and report interval. |
| `backend/src/controllers/financialGoal.controller.ts:13,21` | **MEDIUM** | Goal update currency validation looked up the first goal owned by the user rather than the specific goal being updated. Mixed USD/SOS accounts could receive a false currency-change rejection. | Validation now compares the requested currency with the current goal’s own currency. |

## C. Fixes made

The focused fixes were committed and pushed to the selected GitHub repository in commit `92d80c2`. No architecture rewrite was performed. The changes preserve Prisma, Express, Expo Router, NativeWind, React, Redux/TanStack Query, and the existing admin structure.

The fixes preserve strict currency separation. No conversion rate, exchange-rate assumption, or combined USD/SOS total was added. The reviewed summaries and report services continue to return separate `USD` and `SOS` buckets, and debt, savings, goals, recurring transactions, and investments retain their currency predicates.

No payment provider, subscription flow, wallet transfer, EVC Plus, Zaad, Sahal, Stripe, or PayPal integration was added.

## D. Tests and verification run

| Test | Result |
|---|---:|
| Backend `npm run build` | **PASS** |
| Admin `npm run build` | **PASS** |
| Mobile `npx tsc --noEmit` | **PASS** |
| Pure debt/investment/validator smoke test | **PASS** — `PURE_LOGIC_SMOKE_PASS` |
| `git diff --check` | **PASS** |
| Secret-like literal scan | **PASS** — no tracked secret-like literals found in the scanned source/config scope |
| Payment-integration scan | **PASS** — no payment integration added |
| Prisma `validate` | **BLOCKED** — missing `DATABASE_URL` |
| Prisma `migrate status` | **BLOCKED** — missing `DATABASE_URL`; the process was stopped after it remained database-dependent |
| Live register → login → financial workflow | **NOT RUN** — no configured database/service endpoint |
| Cross-user endpoint authorization tests | **NOT RUN LIVE** — code paths were statically reviewed; live data was unavailable |
| Expo runtime/device and screen-size testing | **NOT RUN** — only TypeScript verification was available |
| Live AI provider test | **NOT RUN** — no live provider/database test was available |
| Live Expo push delivery test | **NOT RUN** — no push service/device test was available |

## E. Security results

The reviewed user routes consistently derive ownership from `req.user.id` rather than accepting a caller-supplied `userId`. User notification, AI conversation, debt, investment, savings, goal, budget, and transaction paths use ownership predicates. Admin route declarations use `requireAuth` and `requireRole('ADMIN')` in the reviewed route set.

Helmet is enabled, CORS is configured from `CORS_ORIGIN`, JSON parsing uses Express’s default bounded parser behavior, and authentication-sensitive routes have rate limiting. AI chat now has a dedicated rate limit. The global error handler returns a generic 500 response and does not return stack traces, database errors, API keys, or prompts.

One deployment dependency remains: the default CORS origin is permissive when `CORS_ORIGIN` is absent, and the environment examples use localhost defaults. Production deployment must provide an explicit production `CORS_ORIGIN`, `DATABASE_URL`, JWT secrets, and AI configuration as appropriate. This is a deployment configuration requirement, not a reason to add secrets to source control.

## F. Database results

The schema and migration directory were inspected without applying migrations. The repository contains migrations through `20260816120000_investment_management`. No `DROP DATABASE`, `DROP TABLE`, `TRUNCATE`, or `prisma migrate reset` command was run.

Database validation and migration status were not verifiable because the sandbox did not provide `DATABASE_URL`. Before release, the deployment owner must run `npx prisma validate` and `npx prisma migrate status` against the intended database, then apply only the approved forward migrations. A live backup and rollback plan should be confirmed before production migration execution.

## G. Financial calculation results

The pure calculation smoke test verified the corrected same-day debt rule, paid and overdue status transitions, investment metrics for 20 units at an average cost of `110` with current price `120`, and rejection of zero-value/zero-price investment mutations. The expected investment metrics were total cost `2200`, current value `2400`, profit/loss `200`, and profit/loss percentage `9.09%`.

Static review found that transaction summaries, budget snapshots, savings summaries, goal summaries, debt summaries, investment summaries, and report services maintain separate currency buckets and include currency in their relevant predicates. A live data consistency test using USD and SOS records remains required before the release gate can close.

## H. AI results

AI tools receive the authenticated user ID and query only that user’s financial data. The AI service does not expose mutation tools, transaction execution, record deletion, bank access, or real-time market-data claims. The system prompt instructs the provider to keep USD and SOS separate and not invent values. Provider failure no longer leaks provider error text or leaves a user-only prompt in history.

A live provider test is still required to validate actual model responses, prompt-injection behavior under the configured model, provider timeout handling, and the deployed API-key configuration. The application should not be marked payment-ready until that test is completed with a real test account and non-production provider credentials.

## I. Mobile results

The mobile API client uses `EXPO_PUBLIC_API_URL`, stores access and refresh tokens in Expo SecureStore, sends bearer headers, coalesces concurrent refresh requests, rotates tokens, and clears the session when refresh fails. The audited mobile notification type includes the corrected debt and investment preference fields. The mobile project passes TypeScript checking.

The main remaining mobile verification is runtime testing on at least one iOS or Android device/emulator, including authentication expiry, deep links, keyboard/date-picker behavior, safe areas, empty/error states, pagination, mutation invalidation, and the complete financial workflow.

## J. Admin results

The admin API modules use the authenticated `adminRequest` helper, which sends bearer headers and rotates refresh tokens. Server-side admin routes are protected by the admin role middleware; UI role checks are therefore not the only authorization boundary. The admin production build passes.

The build emitted a non-failing Vite warning that the main JavaScript chunk is approximately 688 kB minified before gzip. This is a performance optimization opportunity, not a correctness failure. Runtime verification against a real admin account remains pending.

## K. Performance results

The audit identified bounded pagination in the primary list routes and bounded AI history. The main remaining optimization opportunities are the sequential per-budget snapshot aggregates and other per-row enrichment queries, which can become N+1 behavior at scale. They were not changed because the current task prioritizes correctness and security over speculative optimization.

The admin bundle-size warning should be addressed before high-scale production deployment, preferably with route-level code splitting. It does not block the current code build.

## L. Remaining issues and release blockers

The most important remaining blocker is environmental: no `DATABASE_URL` was available, so Prisma validation, migration status, real database integrity, authorization tests, and the complete regression workflow could not be executed. This prevents a defensible **READY** declaration.

The following work must be completed before payment integration is considered safe:

1. Configure a non-production test database and run `npx prisma validate` plus `npx prisma migrate status`.
2. Execute the complete real-data regression flow from registration through transactions, budgets, savings, goals, recurring transactions, debts, repayments, investments, reports, AI, and notifications.
3. Run two-user authorization tests for every read, update, delete, repayment, investment transaction, AI conversation, device token, and admin endpoint.
4. Run USD/SOS isolation tests with parallel records and verify that no endpoint combines values across currencies.
5. Run concurrency tests for savings/goal withdrawals, debt repayments, recurring generation, and investment BUY/SELL transactions against the real database isolation level.
6. Run the mobile application on an emulator or device and exercise authentication expiry, navigation, forms, loading/error states, and mutation refresh behavior.
7. Run one live AI-provider test and one push-notification test using non-production credentials.
8. Confirm production environment values, especially explicit `CORS_ORIGIN`, database URLs, JWT secrets, and AI provider settings.

## M. Final status

# NOT READY FOR PAYMENT INTEGRATION

The code-level audit produced focused fixes and all available compile/pure-logic checks pass. However, the project cannot honestly be marked ready because the database-backed and live end-to-end verification required by the quality gate was blocked by missing `DATABASE_URL` and unavailable runtime services. No critical cross-user access issue remains in the reviewed corrected paths, but the absence of live verification is itself a release blocker.

> The correct next step is to provide a safe non-production database configuration, rerun the blocked verification suite, complete the two-user/currency/concurrency regression tests, and only then reconsider the payment-integration gate.
