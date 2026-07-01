# Frontend Connected Fix

Perubahan yang sudah dibuat:

1. `frontend/src/app/lib/api.ts`
   - API client untuk memanggil backend FastAPI.
   - Default URL: `http://localhost:8000/api`.

2. `frontend/.env`
   - Berisi `VITE_API_URL=http://localhost:8000/api`.

3. `frontend/src/app/App.tsx`
   - Tombol `Generate Content` sekarang memanggil endpoint backend:
     `POST /api/ai/generate-content`.
   - Output AI dari Groq ditampilkan di dashboard.
   - Error backend/Groq ditampilkan di UI.

4. `backend/docker-compose.yml`
   - Port PostgreSQL diubah menjadi `5433:5432` supaya tidak bentrok dengan PostgreSQL lokal.

Cara menjalankan:

Backend:
```bash
cd backend
cp .env.example .env
# isi GROQ_API_KEY di .env
docker compose up --build
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Buka:
`http://localhost:5173`

Pastikan backend aktif di:
`http://localhost:8000/docs`
