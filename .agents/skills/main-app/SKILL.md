---
name: main-app
description: Work on the UpDrafted public/main web app in apps/web, a Next.js 16 app for athletes, coaches, and recruiters. Use when editing web UI/UX, app routes, API route handlers, auth/onboarding, dashboard, discover/search, profiles, connections, messages, notifications, subscriptions/pricing, Stripe, verification uploads, R2/profile images, public marketing/company pages, PWA assets, web lint/build config, or shared packages/db and packages/storage changes made for the web app. Do not use for apps/admin-only work except shared package changes; use the admin skill for the internal moderator dashboard.
---

# UpDrafted Main App Skill

Use this skill whenever the task touches the public UpDrafted app, especially `apps/web`. Treat it as the context map for the main product, not the internal admin console.

## First Moves

- Inspect `git status --short` before editing. There may be user changes in the worktree; do not revert unrelated files.
- Identify the feature area first: route group, API handler, shared component, hook, DB operation, or shared package.
- Prefer existing local patterns over new abstractions. Search with `rg` and read the nearby route/component/hook before editing.
- Use `@/*` imports inside `apps/web`; the alias points to the app root.
- Keep API security on the server. `AuthWrapper` and client hooks are UX gates only.
- If a change also affects `apps/admin`, use the `admin` skill too and check both apps.

## Project Shape

- Workspace root: `C:\Users\potir\Documents\UpDrafted` using npm workspaces.
- Main app: `apps/web`, served on port 3000 with `npm run dev:web` or `npm run dev`.
- Internal admin dashboard: `apps/admin`, served on port 3100. It is separate UI, auth client, and styling.
- Shared database package: `packages/db`. `apps/web/database/db.ts` and `apps/web/database/schema.ts` re-export it.
- Shared storage package: `packages/storage`. `apps/web/database/r2/*` wraps R2 upload flows for app use.
- Cloudflare worker: `worker`, used for public image serving and related infrastructure.

## Commands

Run from the repo root unless a task has a narrower command:

- `npm run dev:web` - start the main app on port 3000.
- `npm run lint:web` - lint `apps/web`.
- `npm run build:web` - production build for `apps/web`.
- `npm run db:generate` - generate Drizzle migrations after schema changes.
- `npm run db:studio` - inspect the database locally when configured.

There is no dedicated web test script in `apps/web/package.json` right now. Use lint/build plus targeted browser/API verification.

## App Shell

- Root layout: `apps/web/app/layout.tsx`.
- Global CSS and Tailwind tokens: `apps/web/app/globals.css`.
- Providers wrap the whole app in this order: `QueryProvider`, `ThemeProvider`, `AuthProvider`, `SubscriptionProvider`.
- Shared chrome: `Header`, `Footer`, `MobileBottomNav`, `ToastContainer`.
- The root `<main>` uses a constrained container with mobile bottom padding. Account for `MobileBottomNav` on mobile screens.
- SEO metadata should go through `apps/web/lib/seo.ts` and `generateMetadata`.

## Route Map

- Public landing and company pages:
  - `/` from `app/(landing-page)/page.tsx`
  - `/about`, `/contact`, `/for-athletes`, `/for-coaches`, `/for-recruiters`, `/privacy-policy`, `/terms-of-service` under `app/(company)`.
- Auth pages:
  - `/sign-in`, `/sign-up`, `/verify-email`, `/reset-password` under `app/(auth)`.
- Onboarding:
  - `/onboarding` under `app/(onboarding)`.
  - Form types, conversion, and validation live in `app/(onboarding)/lib/*`.
- Authenticated product routes:
  - `/dashboard`, `/account`, `/discover`, `/search`, `/connections`, `/messages`, `/notifications`, `/activity`, `/pricing`, `/pricing/success`.
- Profiles:
  - User-facing page: `app/(profiles)/profile/[slug]/[id]/page.tsx`.
  - Main profile API: `app/(profiles)/api/profile/[slug]/[id]/route.ts`.
  - Profile role wrappers/components live under `app/(profiles)/components`.
- API handlers:
  - Better Auth: `app/api/auth/[...all]/route.ts`.
  - Stripe webhook: `app/api/webhooks/stripe/route.ts`.
  - Search/discover/connections/messages/notifications/profile/onboarding/subscription/verification handlers live near their route groups.

## Auth And Access

- Better Auth server config lives in `apps/web/lib/auth.ts`; client hooks are in `apps/web/lib/auth-client.ts` and `apps/web/hooks/use-auth.tsx`.
- `apps/web/proxy.ts` is intentionally small. It checks session-cookie presence, mutation body sizes, request origin, auth query sanitization, and API unauthenticated blocking. It does not replace route-level authorization.
- Use server guards from `apps/web/utils/roles.ts`:
  - `requireSession()` for authenticated users who may still have `role: null`.
  - `requireAnyRole()` for users with a valid app role.
  - `requireRole([...])` for role-limited API handlers.
  - `requireOwnershipOrAdmin(resourceUserId)` for owner/admin access.
  - `requireRolePage([...])` for server component page redirects.
- Roles are centralized in `apps/web/lib/auth-routing.ts` and must stay aligned with `userRoleEnum` in `packages/db/src/schema.ts`.
- A null role means the user is mid-onboarding. Do not treat it as an error unless the route requires a completed role.
- Admin role must not be self-assigned through public APIs or onboarding. Existing admin demo/profile controls are for admin users only.
- Banned users are filtered by auth helpers and rendered as blocked/unavailable in client surfaces. Preserve this behavior.
- Email verification is required before normal access. Respect `getAccessPathForUser()` and `getPostAuthPath()`.

## Database And Data Access

- Schema source of truth: `packages/db/src/schema.ts`.
- DB connection: `packages/db/src/db.ts`; it loads `.env.local` in development and exports `db` and `pool`.
- App-local DB helpers: `apps/web/database/db-utils.ts`.
  - Important groups: `userOperations`, `athleteOperations`, `coachOperations`, `recruitingOperations`, `connectionOperations`, `activityOperations`, `onboardingOperations`, `reportOperations`, `messageOperations`, `profileOperations`, `notificationOperations`, `adminOperations`, `schoolOperations`.
- RLS-protected tables include connections, messages, notifications, reports, user subscriptions, verification requests, and moderator comments.
- When new code relies on RLS policy context, use `executeWithUser()` from `apps/web/lib/db-access.ts` so `app.current_user_id` and `app.current_user_role` are set in the DB transaction.
- Use `executeAsSystem()` only for trusted backend work already authenticated another way, such as signed Stripe webhooks or internal cron. Do not expose it to user-controlled paths.
- For schema changes, edit `packages/db/src/schema.ts`, run `npm run db:generate`, inspect generated SQL, and be careful because migrations affect both web and admin.

## Core Product Domains

### Onboarding

- Frontend form components live under `app/(onboarding)/components`.
- Shared types/conversion live in `app/(onboarding)/lib/onboarding.ts`.
- Server validation lives in `app/(onboarding)/lib/form-validation.ts` and is used by `app/(onboarding)/api/onboarding/route.ts`.
- Onboarding writes the Better Auth user role and creates one of athlete, coach, or recruiter profiles.
- School records go through `schoolOperations.getOrCreateSchool()` to reduce duplicates.
- Profile picture and organization logo uploads go through `uploadProfilePicture()` and `uploadOrganizationLogo()`.
- Admin users can create demo profiles through the onboarding route. Keep that path admin-only.

### Profiles

- The dynamic profile API transforms DB rows for athlete, coach, and recruiter UI components. Check `transformProfileData()` before changing profile shape.
- Profile page cache duration is currently `0` so moderation/suspension changes re-check before showing a profile.
- Own profile/admin views can see more data than public profile views. Preserve `sanitizeForViewing()` intent.
- Profile URLs should be generated with `generateProfileUrl()` from `apps/web/lib/utils.ts`.
- Profile images should be rendered via `getProfileImageUrl()` or constructed with the R2 helpers, not hard-coded to old hosts.
- Athlete camp/club experience dates use helpers from `apps/web/lib/date-utils.ts`; preserve the special "Present" date handling.

### Discover And Search

- `/discover` is the role-aware discovery surface with filters, pagination, premium-gated filters, and saved client search state.
- `/search` is the keyword search page with simpler role/sport filters.
- Discover API: `app/(discover)/api/discover/route.ts`.
- Search API: `app/api/search/route.ts`.
- Premium-only filters are generally returned as locked or ignored for free users instead of hard-blocking the whole request.
- Keep input limits, query/body size limits, parameter caps, sanitization, and Drizzle parameterized queries.
- Height and weight filtering are intentionally done in application code via `filterByHeight()` and `filterByWeight()` to avoid raw SQL injection risk.

### Connections, Messages, Notifications

- Connections API: `app/(connections)/api/connections/route.ts`.
- Messages API: `app/(messages)/api/messages/route.ts`.
- Notifications API: `app/(notifications)/api/notifications/route.ts`.
- Athletes cannot connect to other athletes. Suspended users cannot be connected or messaged.
- Accepting a connection creates a conversation when one does not already exist.
- Sending messages requires an active connected relationship at send time, not only a stored conversation.
- Messages are encrypted/sanitized via `apps/web/utils/encryption.ts` and message validation in `apps/web/utils/validation.ts`.
- Notification counts are cached/polled client-side in `apps/web/hooks/use-notifications.ts`; avoid adding noisy fetch loops.
- Profile-view notification details are premium-gated. Do not leak actor identity to free users.

### Subscriptions, Pricing, Stripe

- Server subscription logic: `apps/web/lib/subscription.ts`.
- Client subscription hook/context: `apps/web/hooks/use-subscription.ts` and `components/providers/subscription-provider.tsx`.
- Pricing UI/config lives under `app/(pricing)/components`.
- Server subscription cache is 24 hours and must be invalidated after Stripe updates or forced refreshes.
- Client subscription cache is 5 minutes and dedupes in-flight requests.
- Stripe webhook route validates the signature, rejects stale timestamps, dedupes event IDs, rate-limits storms, and falls back from metadata to Stripe customer lookup when needed.
- Do not trust client pricing tier or feature flags for enforcement. Check subscription server-side for sensitive behavior.

### Files, R2, Verification

- Shared R2 config is in `packages/storage/src/config.ts`; app wrappers are under `apps/web/database/r2`.
- Profile images/logos use the profile bucket and are served through `images.updrafted.us` by default.
- Verification files use the private bucket and presigned URLs.
- Use `validateFileSecure()` and `scanContent()` for upload paths.
- Profile picture and organization logo uploads replace the previous object in that user's stable folder.
- Store R2 keys in profile columns (`profileImageR3Key`, `organizationLogoR3Key`) and construct URLs at render/API boundaries.
- High-school athlete verification requires at least one Hudl or MaxPreps link.

## UI And Design

- Use existing `components/ui/*` primitives and extend them when adding variants.
- Use `lucide-react` icons for buttons and controls.
- The app supports light/dark/system themes. Do not copy admin's dark-only rule into `apps/web`.
- Brand green is `#01ae79`; use it intentionally for actions, verification, and UpDrafted accent states.
- Tailwind v4 tokens live in `app/globals.css`. Prefer semantic colors where practical, but many existing surfaces use explicit brand-green classes.
- Build mobile-first. Check authenticated mobile layouts because the bottom nav is fixed and `safe-area-bottom` is used.
- When adding top-level navigation, update both `Header` desktop navigation and `MobileBottomNav` if it belongs in the main mobile nav.
- Avoid app text that explains implementation details. Build the usable UI, not a tutorial.
- For public landing/company pages, use real assets where possible and preserve SEO metadata through `generateMetadata()`.

## Security And Reliability Rules

- Add server-side guards to every protected API route. Do not rely on proxy or client components alone.
- Use helpers from `apps/web/utils/security.ts` for rate limiting, cache, file checks, response helpers, and security logging.
- Use `apps/web/utils/sanitization.ts` and Zod schemas from `apps/web/utils/validation.ts` for user input.
- Avoid raw SQL for user-controlled values. Prefer Drizzle query builders and parameterized conditions.
- Keep DB/R2-heavy route handlers on Node runtime with `export const runtime = 'nodejs'`.
- Return sanitized client errors. For profile update style handlers, prefer `createClientErrorResponse()` and `logErrorWithContext()` from `apps/web/utils/error-sanitization.ts`.
- Invalidate relevant cache keys after mutations:
  - `profile:${userId}` after profile changes.
  - `connections:${userId}*` for connection changes.
  - subscription cache after Stripe or billing changes.
  - verification cache after verification submission/reapplication.
- Do not leak PII, raw exception messages, Stripe internals, R2 presigned URLs, or banned-user details to unauthorized clients.

## Shared Package Caution

- `packages/db` changes can affect both `apps/web` and `apps/admin`. If a migration/schema change touches moderation, reports, verification, users, or admin preferences, check admin code too.
- `packages/storage` changes affect profile images, verification files, and admin file previews. Keep private/public bucket behavior explicit.
- Do not import UI components across `apps/web` and `apps/admin`; share DB/storage/packages, not app UI.

## Verification Workflow

After non-trivial web changes:

1. Run `npm run lint:web`.
2. Run `npm run build:web` when the change touches routes, auth, APIs, data fetching, config, or shared packages.
3. For visible UI changes, start `npm run dev:web`, open `http://localhost:3000`, and inspect desktop and mobile viewports. Check both public and authenticated shell behavior when possible.
4. For API/auth/data changes, exercise the target route or read through the caller to confirm guards, role behavior, cache invalidation, and error handling.
5. For DB schema changes, run `npm run db:generate` and inspect the migration. Do not apply destructive DB changes without explicit user direction.

## Avoid

- Do not edit `apps/admin` for public web tasks unless the user asks or a shared package change requires it.
- Do not add self-serve admin promotion or public admin access.
- Do not bypass Better Auth session helpers with ad hoc cookie parsing inside route handlers.
- Do not add duplicate data-fetching loops around notifications/subscriptions; use the existing dedupe/caches.
- Do not hard-code legacy R2 hosts or raw image URLs in new UI.
- Do not weaken upload validation to support videos or arbitrary documents without discussing it first.
- Do not manually edit generated Drizzle snapshots unless the task explicitly requires migration surgery.
