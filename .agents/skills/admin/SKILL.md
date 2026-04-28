---
name: admin
description: Work on the UpDrafted Admin dashboard (apps/admin) — Next.js 16 moderator console for verifications, reports, and community stats. Use when editing anything under apps/admin, tweaking admin UI/UX, adding admin-only endpoints, changing the admin sign-in/auth guard, or running admin-specific lint/build/test commands. The admin app is separate from the public web app (apps/web) and is served only on an internal VPS — it's not public-facing and intentionally has no feature for self-granting admin access.
---

# UpDrafted Admin skill

Use this skill any time you're touching the admin dashboard — UI, API routes, auth, moderation flows, or build/lint/test configuration for `apps/admin`.

## Project layout

- Workspace root: `C:\Users\potir\Documents\UpDrafted` (npm workspaces).
- Admin app lives at `apps/admin` and is its own Next.js 16 app that runs on port **3100** (`npm run dev:admin`).
- Public web app lives at `apps/web` (port 3000). The two apps share the Drizzle DB package at `packages/` but keep their own UI, auth client, and styling.
- Docker image: `dockerfile.admin`. Deployment target is a VPS reachable only over the team VPN — treat the admin surface as internal-only, not public-facing.

### Inside `apps/admin`

- `app/layout.tsx` — root layout (Roboto font, dark-only theme, mobile viewport meta).
- `app/globals.css` — design tokens (dark-first palette keyed on UpDrafted brand green `#01ae79`), safe-area utilities, radial background glow.
- `app/sign-in/page.tsx` — public-visible sign-in page; rejects non-admin accounts after login.
- `app/(admin)/` — authenticated routes (`/`, `/verifications`, `/reports`). Entry layout runs `getAdminSession()` and redirects to `/sign-in` if the caller isn't an admin.
- `components/admin-shell.tsx` — app chrome: top bar (all sizes), fixed sidebar (md+), slide-out menu + bottom tab bar (mobile).
- `components/ui/` — local shadcn-style primitives (`button`, `card`, `input`, `textarea`, `badge`, `tabs`, `dialog`, `label`). Keep these in sync when adding variants.
- `components/providers.tsx` — React Query provider.
- `lib/admin-guard.ts` — `getAdminSession()` / `requireAdminApi()`. Admin role is granted **only by direct SQL** — never add a UI for self-promotion.
- `lib/auth.ts`, `lib/auth-client.ts` — Better Auth server + client.
- `lib/stats.ts`, `lib/verifications.ts`, `lib/reports.ts`, `lib/email.ts`, `lib/db-access.ts` — data access layer and moderator actions.
- `app/api/` — admin-only REST endpoints (`auth`, `me`, `stats`, `verifications`, `reports`). Every handler must call `requireAdminApi()` first.
- Tests (`vitest`): `lib/*.test.ts`.

## Design system (keep pages consistent)

- **Dark-only** UI. Do not introduce light-mode variants — the `<html>` tag is hard-coded `class="dark"`.
- Use CSS variable colors via `text-[color:var(--…)]` / `bg-[color:var(--…)]`. Available tokens: `background`, `foreground`, `card`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `success`, `warning`, `border`, `input`, `ring` (+ `*-foreground` counterparts).
- Brand accent is `--primary` (`#01ae79`). Use tinted fills (`var(--primary)/15` etc.) for status/accent chips rather than solid primary for decorative surfaces.
- Component primitives live in `components/ui/` — prefer extending them over ad-hoc styles so Dashboard / Verifications / Reports stay visually consistent.
- Radius scale defaults to `rounded-lg` / `rounded-xl`; cards use `rounded-xl` with a subtle shadow + backdrop blur.
- Typography: Roboto via `next/font/google` exposed as `--font-roboto`; Tailwind's `font-sans` resolves to it.

## Mobile-first rules

The admin app **must work well on mobile** — moderators will use it on phones. When adding UI:

- Use tap targets ≥ 40–44px. Prefer `size-10` icon buttons or `h-11`/`h-12` buttons on mobile.
- Wrap headers / action rows in flex containers that **stack under `sm`** and flow horizontally from `sm:` up.
- For grids of stats, start with `grid-cols-2` on mobile and expand to `lg:grid-cols-4`. Never force 4+ columns on narrow viewports.
- Use `Dialog` from `components/ui/dialog.tsx` — it auto-renders as a bottom sheet with a grab handle on mobile and a centered modal on `sm+`. Don't reimplement modals.
- Honor safe areas: use `safe-area-top` / `safe-area-bottom` utilities or `env(safe-area-inset-*)` on sticky / fixed bars. The mobile bottom nav and sign-in page already do this — new fixed elements must too.
- Use `min-h-[100dvh]` (not `100vh`) for full-height screens so the iOS URL bar doesn't cut content.
- Long text inside lists should `truncate`; badges should be allowed to wrap with `flex-wrap`.

## Navigation

- Desktop (`md+`): fixed left sidebar (64 w) + sticky top bar. Main content is wrapped in `md:pl-64`.
- Mobile: top bar with menu + account, slide-out drawer for nav, **bottom tab bar** for the three main sections. Keep the bottom nav items in sync with `NAV` in `admin-shell.tsx`.
- When adding a new top-level route, update `NAV` in `components/admin-shell.tsx` so it appears in both the sidebar and the mobile bottom bar. Keep it to 3–5 items on mobile.

## Auth & security

- Every admin page / API route goes through `getAdminSession()` or `requireAdminApi()`. Don't trust client state.
- There is **no** self-serve admin promotion — role is set manually via SQL. Never add endpoints or UI that elevate a user to admin.
- `metadata.robots = { index: false, follow: false }` — keep the admin app non-indexable. Don't add sitemap entries or public links.
- The admin app is assumed to sit behind a VPN / VPS allowlist; still treat inputs as untrusted at the API layer.

## Common commands

From the repo root (Windows `bash` shell):

- `npm run dev:admin` — start the admin dev server on port 3100.
- `npm run build:admin` — production build. Run this after non-trivial changes.
- `npm run lint:admin` — ESLint for `apps/admin`.
- `npm --workspace @updrafted/admin run test` — vitest run for admin-only tests.

For previewing UI changes, use the `preview_*` tools rather than spawning bash dev servers directly — start with `preview_start` pointing at port 3100 or use the admin's dev URL.

## Verification workflow for admin UI work

After any observable UI change, before ending the turn:

1. `preview_start` (if no server) and navigate to `/sign-in` or an authenticated route.
2. `preview_resize` to both a **mobile** viewport (e.g., 390×844) and a **desktop** viewport (e.g., 1440×900) and snapshot each.
3. Verify key interactions: sign-in form, tab switching, opening a detail dialog on mobile (bottom sheet) and desktop (centered modal), mobile bottom nav + slide-out menu.
4. Check `preview_console_logs` / `preview_logs` for errors.
5. Then run `npm run lint:admin` and `npm run build:admin` — fix any errors before handing off.

## Things to avoid

- Don't add light-mode styling or a theme toggle. The admin is dark-only by design.
- Don't reference or import from `apps/web` components — the two apps share the DB layer, not the UI layer.
- Don't add analytics, third-party trackers, or public marketing content — this app is internal.
- Don't add a "forgot password" or self-signup flow. Password / account lifecycle is manual for moderators.
- Don't weaken `requireAdminApi()` to support service tokens or public access without discussing with the user first.
