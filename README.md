# Furniture Store (React + Express + MySQL)

Online furniture store with English and Amharic, dark mode, guest checkout, customer accounts and an admin panel.

## Requirements
- Node.js 20 or newer
- MySQL 8

## 1. Install
```bash
cd server && npm install
cd ../client && npm install
```

## 2. Create the database (fresh installation)
Run from the main folder (the MySQL command line, replace the path if yours differs):
```bash
mysql -u root -p < server/db/schema.sql
mysql -u root -p furniture_store < server/db/base_tables.sql
```
Optional demo products and pages (skip this for a real client store):
```bash
mysql -u root -p furniture_store < server/db/seed.sql
mysql -u root -p furniture_store < server/db/batch2.sql
mysql -u root -p furniture_store < server/db/batch4.sql
```
Windows PowerShell does not support `<`. Use the `source` command inside the MySQL prompt instead:
`source C:/full/path/to/furniture-store/server/db/schema.sql;`

## 3. Server settings
Copy `server/.env.example` to `server/.env` and fill in the database password.

## 4. Secrets
Run this twice and put the two different results in `JWT_SECRET` and `CUSTOMER_JWT_SECRET`:
```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

## 5. Apply the migrations and create the admin
```bash
cd server
npm run migrate
node scripts/createAdmin.js USERNAME EMAIL 'A-LONG-PASSWORD' "Owner Name"
```
The password must have at least 10 characters.

## 6. Start
```bash
# terminal 1
cd server && npm run dev        # http://localhost:5000
# terminal 2
cd client && npm run dev        # http://localhost:5173
```
Admin panel: `http://localhost:5173/admin/login`

## Deployment
**Website (Vercel):** project root = `client`. Environment variable `VITE_API_URL` = the backend address (with https://). `client/vercel.json` makes page refresh work. Replace the backend address inside it.

**Backend (a host that runs Node.js, for example Render) plus a MySQL database:**
- Build command `npm install`, start command `npm start`, root directory `server`.
- Environment variables: everything in `server/.env.example`, with `NODE_ENV=production`, `TRUST_PROXY=1`, `CLIENT_ORIGIN` (the website address), `PUBLIC_SITE_URL` (the website address), `PUBLIC_API_URL` (the backend address), `DB_*` of the hosted database (`DB_SSL=true` if required) and both secrets.
- After the first deploy run `npm run migrate`, then create the admin with `node scripts/createAdmin.js`.
- **Photos:** files in `server/uploads` are lost when most hosts restart. Use a host with a permanent disk and set `UPLOADS_DIR` to its folder. Persistent disks usually need a paid plan: check the host's pricing page.

## Backup and restore
```bash
mysqldump -u USER -p --default-character-set=utf8mb4 --no-tablespaces --set-gtid-purged=OFF --result-file=backup-DATE.sql furniture_store
mysql -u USER -p furniture_store < backup-DATE.sql
```
Also copy the `uploads` folder. Do not commit backups (they are in `.gitignore`).

## Payments
Cash on delivery works. Chapa and Telebirr are **not integrated** and stay disabled until a real integration and merchant credentials exist.

## Before handing over to the client
- [ ] Business settings filled in (Admin: Business settings)
- [ ] Logo and browser icon uploaded
- [ ] Five policy pages written by the owner and published (Admin: Policies and FAQ)
- [ ] FAQ questions added
- [ ] About page edited, hero photos replaced with the client's own
- [ ] Demo products, demo reviews and demo orders deleted
- [ ] Real products with photos and stock added
- [ ] Amharic text checked by a native speaker
- [ ] Admin password set by the client and changed from any temporary one
- [ ] `server/.env` not in Git (see below)
- [ ] Production build passes: `cd client && npm run build`

## Check Git for leaked secrets
```bash
git log --all --oneline -- server/.env
```
If this prints anything, `.env` was committed in the past: change the database password and both JWT secrets, and treat the old ones as public.