# Placement Cell Management System

This repo is **CareerSync**, a placement cell management system style portal. 
Students browse jobs, check whether they are eligible, apply before deadlines, and watch their application move through rounds. 
Admins manage companies, jobs, who gets shortlisted, interview rounds, and results. None of that lives only in the UI... a lot of the rules live in **MySQL** (triggers, procedures, views, audits) so the data stays honest even if someone talks to the API directly (like using postman not the frontend)

it is a **MySQL** database, a **Node.js + Express** API with Passport (local login, JWT, optional Google OAuth), and a **React (Vite)** frontend with Tailwind. If you are opening the project for first time, start the database, run the SQL scripts once, then bring up the server and client and you will have a working demo with seeded users.

## Repository layout

| `client/` | The React app: student and admin screens, shared layout, calls to the API via Axios. Run it with Vite (`npm run dev`). |
| `server/` | The API: route files wire URLs to **controllers**, auth middleware checks JWT and role, and `mysql2` runs the SQL you defined in class. |
| `server/sql/schema.sql` | Creates tables, keys, and enums — the structural “shape” of the data. |
| `server/sql/procedures.sql` | Functions, stored procedures, triggers, and views — where much of the course’s DBMS logic actually lives. |
| `server/sql/seed.sql` | Wipes and refills demo data so you are not staring at an empty portal. |

## How the code is laid out

**Backend (`server/`).** Requests hit `app.js`, which mounts routers under `/api`. Each area of the app has a small **controller** (for example `application.controller.js`, `job.controller.js`, `round.controller.js`) that runs SQL — often plain queries, sometimes `CALL` to a procedure. **`ai.controller.js`** builds role-scoped read-only snapshots and calls Gemini. `middleware/auth.js` and `middleware/rbac.js` make sure only the right role touches student vs admin routes. Database config is in `config/db.js`. 

**Frontend (`client/src/`).** `App.jsx` registers routes and wraps private pages in `ProtectedRoute` so students and admins do not step on each other’s URLs. Student pages live under `pages/student/`, admin under `pages/admin/`. Shared chrome (sidebar, top bar, go back, **Gemini chat**) comes from `components/layout/` (`PageWrapper` mounts **`AiAssistant.jsx`**). `context/AuthContext.jsx` holds who is logged in after the token is stored; `services/api.js` is the Axios instance that attaches the JWT. Styling is Tailwind utility classes on those components.

# How to Run (Step-by-Step Guide)
If you are running this project from a ZIP file or cloning it to a new machine, follow these precise steps:

## Prerequisites
You will need **Node.js** and **MySQL 8.x** on your machine. Optional extras: a **Cloudinary** account if you want uploads to work out of the box, **Google OAuth** credentials if you want “Sign in with Google” for students, and a **Google AI Studio / Gemini API key** if you want the in-app placement assistant.

## Database setup
The API assumes a database named `placement_cell_db` by default. see `server/config/db.js`. The checked-in SQL does **not** create the database for you, so create it once in MySQL:

```sql
CREATE DATABASE IF NOT EXISTS placement_cell_db;
USE placement_cell_db;
```

Then, from a MySQL client (fix the paths to match where you cloned the repo):

```sql
USE placement_cell_db;
SOURCE path/to/server/sql/schema.sql;
SOURCE path/to/server/sql/procedures.sql;
SOURCE path/to/server/sql/seed.sql;
```

Or from a shell, after the empty database exists:

```bash
mysql -u root -p --database=placement_cell_db < server/sql/schema.sql
mysql -u root -p --database=placement_cell_db < server/sql/procedures.sql
mysql -u root -p --database=placement_cell_db < server/sql/seed.sql
```

## Backend

```bash
cd server
npm install
npm run dev
```

Add a `server/.env` file with your MySQL password and secrets (use your own values in below(copy paste it in .env)):

PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=placement_cell_db

# Auth
JWT_SECRET=anysecretkeyisfine
JWT_EXPIRES_IN=7d

# File uploads (Leave empty for now if prefer to fill manually)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Google Gemini (optional — AI chat on student & admin pages)
GEMINI_API_KEY=

## Frontend

```bash
cd client
npm install
npm run dev
```

Vite serves the app at **http://localhost:5173** by default.

### AI placement assistant (Google Gemini)

When you are logged in as **either** a student or an admin, a **floating chat** (bottom-right) opens the placement assistant. It is not a generic web chat: each time you send a message, the **server** runs read-only SQL, builds a **JSON snapshot** of the portal, and sends that snapshot plus your question to **Gemini** so answers stay tied to your data.

- **Admins** get a campus-wide snapshot: overview counts, applications (capped list), jobs, rounds, companies, and round-result summaries — good for questions like how many people are shortlisted or which companies have the most applications.
- **Students** get **only their own** applications, per-round results for those applications, their profile row, and a list of **still-open jobs** (by deadline). That is how the model can answer things like *“Which round is my Google software engineer application in?”* without seeing other students’ private rows.

Set **`GEMINI_API_KEY`** in `server/.env`. If it is empty, the chat button still appears but the API returns a **503** and the panel shows a configuration error. **`GEMINI_MODEL`** is optional (defaults to `gemini-1.5-flash`; try `gemini-2.0-flash` if your API project supports it). The API key never ships to the browser — only the backend calls Google.

Requests use **`POST /api/ai/chat`** with your JWT and are **rate-limited** to keep costs and abuse in check. Install server dependencies with `npm install` (if npm complains about Cloudinary peers, use `npm install --legacy-peer-deps` in `server/`).

### Application tracking and what students see

- **`application.status`** moves **Applied → Shortlisted** (queued for the first OA-style round; `current_round_id` points at that round) **→ In_Round** as they sit specific rounds **Selected** or **Rejected**.
- **Round grading:** admins set **`round_result.status`** (`Cleared` / `Failed` / `Pending`). The backend keeps the application row in sync so lists, dashboards, and the student job page do not drift apart.
- **Student job detail:** `GET /api/applications/job/:jobId/my-progress` returns that student’s application plus each round with its result — the UI draws the **Placement Rounds** timeline (green cleared, amber current stage, red failed).
- **Older databases:** if you started from an earlier schema, run **`server/sql/migrate_application_pipeline.sql`** once, then **`procedures.sql`** and **`seed.sql`**, or rebuild from **`schema.sql`** from scratch.

**Default Login Credentials:**
- Admin: `admin@snu.edu.in` / `admin123`
- Student: `pa001@snu.edu.in` / `admin123`

## References
* MySQL 8.0 Reference Manual — [https://dev.mysql.com/doc/refman/8.0/en/](https://dev.mysql.com/doc/refman/8.0/en/)
* MySQL Stored Programs — [https://dev.mysql.com/doc/refman/8.0/en/stored-programs-defining.html](https://dev.mysql.com/doc/refman/8.0/en/stored-programs-defining.html)
* MySQL Triggers — [https://dev.mysql.com/doc/refman/8.0/en/triggers.html](https://dev.mysql.com/doc/refman/8.0/en/triggers.html)
* MySQL Cursors — [https://dev.mysql.com/doc/refman/8.0/en/cursors.html](https://dev.mysql.com/doc/refman/8.0/en/cursors.html)
* MySQL Window Functions — [https://dev.mysql.com/doc/refman/8.0/en/window-functions.html](https://dev.mysql.com/doc/refman/8.0/en/window-functions.html)
* MySQL CTEs (WITH clause) — [https://dev.mysql.com/doc/refman/8.0/en/with.html](https://dev.mysql.com/doc/refman/8.0/en/with.html)
* MySQL ROW_NUMBER() — [https://dev.mysql.com/doc/refman/8.0/en/window-function-descriptions.html#function_row-number](https://dev.mysql.com/doc/refman/8.0/en/window-function-descriptions.html#function_row-number)
* Node.js Documentation — [https://nodejs.org/docs/latest/api/](https://nodejs.org/docs/latest/api/)
* Express.js — [https://expressjs.com/](https://expressjs.com/)
* mysql2 Node Driver — [https://sidorares.github.io/node-mysql2/docs](https://sidorares.github.io/node-mysql2/docs)
* React Documentation — [https://react.dev/](https://react.dev/)
* Vite Build Tool — [https://vite.dev/guide/](https://vite.dev/guide/)
* React Router — [https://reactrouter.com/](https://reactrouter.com/)
* Tailwind CSS — [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
* Axios — [https://axios-http.com/docs/intro](https://axios-http.com/docs/intro)
* Recharts — [https://recharts.org/en-US/](https://recharts.org/en-US/)
* Passport.js — [https://www.passportjs.org/](https://www.passportjs.org/)
* passport-google-oauth20 — [https://github.com/jaredhanson/passport-google-oauth2](https://github.com/jaredhanson/passport-google-oauth2)
* passport-jwt — [https://github.com/mikenicholson/passport-jwt](https://github.com/mikenicholson/passport-jwt)
* bcryptjs — [https://github.com/dcodeIO/bcrypt.js#readme](https://github.com/dcodeIO/bcrypt.js#readme)
* jsonwebtoken — [https://github.com/auth0/node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
* Cloudinary Node SDK — [https://cloudinary.com/documentation/node_integration](https://cloudinary.com/documentation/node_integration)
* Google OAuth 2.0 — [https://developers.google.com/identity/protocols/oauth2](https://developers.google.com/identity/protocols/oauth2)
* Google Gemini API (AI Studio) — [https://ai.google.dev/](https://ai.google.dev/)
* `@google/generative-ai` (Node SDK) — [https://github.com/google/generative-ai-js](https://github.com/google/generative-ai-js)

