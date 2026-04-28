# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```
npm run dev        # Start Vite dev server
npm run build      # Production build (to dist/)
npm run preview    # Preview production build locally
```

No test framework or linter is configured.

## Architecture

**Public vs. admin routing** — `App.jsx` has two completely separate routing trees switched by path prefix. `/admin` routes render without the public `<Layout>` (Navbar/Footer); the admin has its own `<AdminLayout>` with a collapsible sidebar. A catch-all `*` route redirects to `Home`.

**Content management** — All site content lives in `src/data/content.js` as plain JS objects (keys: `site`, `home`, `about`, `industry`, `innovation`, `products`, `green`, `news`, `partners`, `contact`). `ContentContext` (`src/context/ContentContext.jsx`) loads from `localStorage` (key: `youmin_admin_content`) on init, falling back to deep-cloned defaults. Public pages call `getContent(key)` to retrieve their slice. Admin pages use `EditorShell`, which wraps save/reset logic and renders with `updateContent(key, data)`.

**Provider hierarchy** (from `main.jsx`): `BrowserRouter > ContentProvider > AuthProvider > App`

**Auth** — `AuthContext` is entirely client-side: login checks email/password against `VITE_ADMIN_EMAIL` / `VITE_ADMIN_PASSWORD` env vars (defaults: `admin@youmingroup.com` / `youmin2024`). No backend, no tokens. Auth state is persisted in `localStorage` under `youmin_admin_auth`. `RequireAuth` in `App.jsx` guards all `/admin` routes except `/admin/login`.

**EditorShell pattern** — Each admin page uses `EditorShell` (`src/components/admin/EditorShell.jsx`) providing: a `contentKey` string, a `renderForm(data, onChange)` function, and optionally an `extractFormData(formData)` function. EditorShell handles loading, saving (with deepClone), resetting, and Toast notifications.

**deepClone** — `src/utils/deepClone.js` is `JSON.parse(JSON.stringify(obj))`, used everywhere instead of `structuredClone` for broader browser compatibility.

**Supabase** — `src/lib/supabase.js` creates a lazy client from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, but no code currently calls `getSupabase()`. It's wired but unused.

**Vercel SPA rewrites** — `vercel.json` maps all non-`/assets/` paths to `/index.html` for client-side routing.

## Tailwind theme

Custom `green` (50-950) and `gold` (50-900) color scales. Custom `fontFamily.sans` set to Chinese-friendly system fonts (PingFang SC, Hiragino Sans GB, Microsoft YaHei, Noto Sans SC). No Tailwind plugins.

## Language

All user-facing content is Chinese (zh-CN). Section titles throughout the public pages include both Chinese title and English subtitle.
