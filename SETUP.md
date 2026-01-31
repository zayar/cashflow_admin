# Admin (Cashflow Console) – Setup & Deployment

This is the **admin/console** app for Cashflow: React + TypeScript + Vite, Ant Design, Apollo (GraphQL), Firebase hosting. It talks to the same backend API as the main frontend and uses GraphQL login with **Admin** role.

---

## 1. Prerequisites

- **Node.js** 18+ (LTS recommended)
- **Yarn** 4.x (project uses `packageManager: "yarn@4.5.0"`)
- **Firebase CLI**: `npm install -g firebase-tools` then `firebase login`

---

## 2. Local setup

```bash
# From project root (admin/)
yarn install
cp .env.example .env
# Edit .env if needed (e.g. local API: http://localhost:4000/query)
yarn dev
```

- App: **http://localhost:5173**
- Login: use a user that has **Admin** role in your backend.

---

## 3. Environment variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_GRAPHQL_URI` | GraphQL endpoint | `/query` (recommended on Firebase Hosting) or `http://localhost:4000/query` |

See `.env.example`. Vite only exposes variables prefixed with `VITE_`.

---

## 4. Build & deploy (Firebase Hosting, same project as main app)

This repo is configured to use the **same Firebase project** as your main app: **cashflow-483906**.

**One-time: create the Hosting site**

1. Open [Firebase Console](https://console.firebase.google.com) → project **cashflow-483906** → **Hosting**.
2. Click **Add another site** and create a site (e.g. **`admin-cashflow`**; must match the target in `.firebaserc`).
3. Or from CLI: `firebase hosting:sites:create admin-cashflow` (from this repo).

Then deploy:

```bash
yarn build
yarn deploy
# or: firebase deploy --only hosting:admin
```

- **Firebase project**: `cashflow-483906` (see `.firebaserc`)
- **Hosting target**: `admin` → site **admin-cashflow**

Default URLs: `admin-cashflow.web.app`, `admin-cashflow.firebaseapp.com`. Add a custom domain (e.g. **admin.thecashflow.app**) in Hosting → site **admin-cashflow** → **Add custom domain**.

---

## 5. CI (GitHub Actions)

Pushes to **main** or **master** trigger a build and deploy to Firebase Hosting (site **admin-cashflow**).

**One-time: add Firebase token**

1. Locally run: `firebase login:ci` (logs you in and prints a CI token).
2. In GitHub: repo **zayar/cashflow_admin** → **Settings** → **Secrets and variables** → **Actions**.
3. **New repository secret**: name `FIREBASE_TOKEN`, value = the token from step 1.

**Optional:** To use a different API URL in production builds, add a secret `VITE_GRAPHQL_URI` (e.g. `https://api-dev.thecashflow.app/query`). If unset, the workflow uses `/query` (Firebase Hosting rewrite proxy).

Workflow file: [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

---

## 6. Git: separate repo vs combine with frontend

### Recommendation: **use a separate Git repo for admin**

| Approach | Pros | Cons |
|----------|------|------|
| **Separate repo** (recommended) | Clear separation; different deploy pipeline and access (only admins need this repo); simpler CI (build/deploy only admin); you can still use same Firebase project or a dedicated one. | Two repos to maintain. |
| **Monorepo with frontend** | Single repo; shared tooling possible. | Frontend is large and different stack (e.g. npm vs yarn); mixed permissions (everyone sees admin code); deploy config gets more complex (multiple apps in one repo). |

So: **create a new Git repository for the admin project** and push only the admin app there. Keep the main frontend (and PWA if applicable) in the existing frontend repo.

If you later want one repo for “all apps,” a clean approach is a **monorepo** (e.g. `apps/admin`, `apps/frontend`, `apps/pwa-invoice`) with a single tool like Turborepo or Nx, rather than dumping admin into the current frontend repo as-is.

---

## 7. Custom domain (e.g. admin.thecashflow.app)

1. Firebase Console → project **cashflow-483906** → **Hosting** → site **admin-cashflow**.
2. **Add custom domain** → e.g. `admin.thecashflow.app` or `admin.cashflow.com`.
3. Add the DNS records Firebase shows you.
4. Deploy: `yarn build && yarn deploy`.

---

## 8. Admin login & creating an admin account

The admin app does **not** use Firebase Auth. It uses your **backend GraphQL** `login` mutation. Only users whose backend role is **Admin** can use the console.

- **Backend rule**: A user is treated as Admin when `role_id = 0` (and typically `role = 'A'` in the `users` table).
- **How to create an admin account**:
  1. **Option A – New user**: Insert a user in your backend DB with `role_id = 0`, `role = 'A'`, and a bcrypt-hashed password (same as other users). Your backend may have a seed or migration for this; if not, you can add a small script or run a one-off SQL/seed.
  2. **Option B – Promote existing user**: Update an existing user: set `role_id = 0` and `role = 'A'` (e.g. via SQL or an internal admin tool).

Use that user’s **username** and **password** to log in to the admin app. The backend returns `role: "Admin"` only for these users; the admin app allows access only when `role === "Admin"`.

---

## 9. Checklist

- [ ] `yarn install` and `yarn dev` work.
- [ ] `.env` created from `.env.example`, API URL correct for dev/prod.
- [ ] **One-time**: In Firebase Console (cashflow-483906) → Hosting → **Add another site** → create site **admin-cashflow** (or use existing).
- [ ] `yarn build` and `yarn deploy` succeed; app loads at the admin site URL.
- [ ] (Optional) Custom domain (e.g. admin.thecashflow.app) added and DNS configured.
- [ ] Backend has at least one Admin user (`role_id = 0`, `role = 'A'`) for console login.
- [ ] New Git repo created for admin and code pushed (recommended). You can share the repo link for help with CI or further setup.

---

## 10. Current config summary

| Item | Value |
|------|--------|
| App name | Cashflow Console (books_admin) |
| Firebase project | cashflow-483906 (same as main app) |
| Hosting site | admin-cashflow |
| Auth | GraphQL login; backend returns `role: "Admin"` when `role_id = 0` |
| API | GraphQL at `VITE_GRAPHQL_URI` (recommended: `/query` via Firebase Hosting rewrite) |
