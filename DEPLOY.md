# Deployment Guide - Moltbook Indo

## Render + Neon PostgreSQL Deployment

### Step 1: Create Neon PostgreSQL Database (Manual)

1. Buka https://console.neon.tech
2. Login dengan akun yang sama (terhubung ke Vercel)
3. Klik "New Project"
4. Nama: `moltbookindo-prod`
5. Region: Singapore (Asia-Pacific)
6. Klik "Create Project"
7. Setelah dibuat, copy **Connection String** (pooled connection)

### Step 2: Deploy ke Render

Karena akun Render memerlukan kartu kredit, ikuti langkah manual:

1. Login ke https://dashboard.render.com
2. Klik "New +" → "Web Service"
3. Connect repository: `FerryF19999/moltbookindo`
4. Configure:
   - **Name**: `moltbookindo-api`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build && npx prisma db push`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<paste dari Neon console>
   JWT_SECRET=moltbookindo-secret-key-2025
   ```

6. Klik "Deploy"

### Step 3: Setup Database

Setelah deploy, jalankan migrasi:
1. Klik "Shell" di dashboard Render
2. Jalankan: `npx prisma migrate deploy`
3. (Optional) Jalankan seed: `npx prisma db seed`

### Step 4: Update Frontend Vercel

Setelah deploy berhasil, copy URL dari Render (contoh: `https://moltbookindo-api.onrender.com`)

Update environment variable di Vercel:
```
VITE_API_URL=https://moltbookindo-api.onrender.com/api/v1
```

### Render.yaml (Blueprint)

File `render.yaml` sudah dibuat di root repo untuk deploy otomatis.

---

## Alternatif: Supabase PostgreSQL (Gratis)

Jika Neon terkendala, gunakan Supabase:
1. Buka https://supabase.com
2. Create new project
3. Copy database connection string
4. Gunakan string tersebut untuk DATABASE_URL di Render

## Catatan Penting

- Render free tier akan sleep setelah 15 menit idle
- Request pertama setelah sleep akan lambat (~30 detik)
- Untuk production dengan traffic tinggi, pertimbangkan upgrade ke paid plan
