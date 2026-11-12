# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` — install deps (both `package-lock.json` and `yarn.lock` exist; npm is what the README uses).
- `npm start` — runs `nodemon index.js`. Server listens on fixed port **3030** only after MongoDB connects.
- No test suite, linter, or build step exists (`npm test` is a placeholder that exits 1). The README's `npm run dev` script does not exist.

## Environment

`.env` (gitignored) is required. Keys used in code: `DB_USER`, `DB_PASSWORD`, `DB_NAME` (Mongo Atlas, cluster host is hardcoded in `index.js`), `JWT_SECRET`, `CRON_SECRET`, `ADMIN_ID`, `CURRENT_SITE_URL`, `CURRENT_SITE_URL_NEW` (CORS origins), `CLOUD_NAME`/`CLOUD_KEY`/`CLOUD_SECRET` (Cloudinary), `NEWS_API_URL`/`NEWS_API_KEY` (news microservice).

## Architecture

Express 5 + Mongoose REST API for the "{g}blog" frontend. User-facing messages and comments are in Portuguese.

**Routing pattern — one endpoint per folder.** `index.js` mounts `/person`, `/post`, `/weekly-save`. Each resource's `routes/<resource>/index.js` does `router.use('/', require('./<endpoint>'))` for every subfolder; each subfolder's `index.js` defines a single handler on its own `express.Router()`. To add an endpoint: create the folder and register it in the resource's `index.js`. Registration order matters because param routes (`/:id`) can shadow literal paths.

**Module system is mixed.** Most files are CommonJS, but `middleware/handleImageUpload.js` and `services/news-client.js` are ESM (`export`) and are loaded via `require()`. This relies on Node's `require(esm)` support (Node ≥ 22; dev machine runs v24). `file-type` is ESM-only, which is why the upload middleware is ESM.

**Auth.** `utils/generateToken.js` signs `{ id }` with `JWT_SECRET` (1d). Login sets it as an `httpOnly`, `secure`, `sameSite: "none"` cookie named `token`. `middleware/authMiddleware.js` reads `req.cookies.token` and sets `req.user`. Some public routes (e.g. `GET /post`) decode the cookie optionally to compute per-user flags. Ownership checks are done inline in each handler (e.g. `deletePost` compares `post.user` to `req.user.id`), not by a shared middleware.

**Image upload chain.** Routes use `multer.memoryStorage()` (5 MB limit) → `authMiddleware` → `handleImageUpload`. The middleware validates magic bytes (PNG/JPEG only), uploads the buffer to Cloudinary via `utils/cloudinaryUpload.js` (replacing `req.currentImagePublicId` if set), and passes `{ url, public_id }` on `req.uploadedImage`. Posts store image URLs as strings in `images[]`; Person stores `img: { url, public_id }`. `public/uploads` is served statically at `/uploads` but is legacy.

**Response shape.** Handlers return `{ success, message, ...data }`. `utils/formatPostData.js` shapes post lists for the client: adds `isMyPost`, replaces `likes` with `likesData: { hasLiked, likesTotal }`, flags `isMyComment`, and sorts comments newest-first.

**Data model.** `models/Post.js` embeds `comments[]` and `likes[]` as subdocuments referencing `Person`. Models are defined with `mongoose.model(name, plainObject)` (no explicit Schema, no timestamps option; `createdAt`/`updatedAt` are manual defaults).

**Automated posts (`POST /weekly-save`).** Called by an external cron. Not JWT-protected: it requires the `Authorization` header to equal `CRON_SECRET`. It calls the separate news microservice (`services/news-client.js` → `GET ${NEWS_API_URL}/news?limit=8` with `x-api-key`). It then saves the first article whose `title` isn't already a Post, authored by `ADMIN_ID`. News fetching/LLM processing used to live here and was moved to that microservice.
