# CreatorForge AI Fullstack Starter

Isi paket:

- `frontend`: hasil desain Figma React/Vite dari file upload
- `backend`: FastAPI, PostgreSQL, Docker Compose, dan koneksi Groq Llama Versatile

## Jalankan backend

```bash
cd backend
cp .env.example .env
# isi GROQ_API_KEY di .env
docker compose up --build
```

Backend:

```txt
http://localhost:8000
http://localhost:8000/docs
```

## Jalankan frontend

```bash
cd frontend
npm install
npm run dev
```

Tambahkan `.env` di folder frontend:

```env
VITE_API_URL=http://localhost:8000/api
```

## Integrasi cepat

Gunakan contoh client di:

```txt
backend/frontend-api-client.ts
```

Salin file itu ke frontend, misalnya:

```txt
frontend/src/app/lib/api.ts
```

Lalu panggil `generateContent()` dari tombol Generate Content di `App.tsx`.
