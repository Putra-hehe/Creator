# CreatorForge AI Backend

Backend FastAPI untuk CreatorForge AI. Fitur utama:

- CRUD project
- Generate naskah konten dengan Groq Llama Versatile
- Simpan hasil generate ke PostgreSQL
- Dashboard stats sederhana
- Docker Compose siap jalan

## 1. Setup

```bash
cp .env.example .env
```

Isi `GROQ_API_KEY` di file `.env`.

## 2. Jalankan dengan Docker

```bash
docker compose up --build
```

Backend berjalan di:

```txt
http://localhost:8000
```

Swagger docs:

```txt
http://localhost:8000/docs
```

## 3. Endpoint penting

### Health check

```bash
curl http://localhost:8000/api/health
```

### Buat project

```bash
curl -X POST http://localhost:8000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Lelouch Mindset for Students",
    "niche":"Anime Strategy",
    "target_platform":"YouTube Shorts",
    "status":"Draft",
    "description":"Konten strategi hidup dari karakter Lelouch."
  }'
```

### Generate content pakai Groq

```bash
curl -X POST http://localhost:8000/api/ai/generate-content \
  -H "Content-Type: application/json" \
  -d '{
    "idea":"Pola pikir Lelouch untuk mahasiswa yang ingin menang dalam hidup",
    "platform":"YouTube Shorts",
    "tone":"Strategic",
    "language":"Indonesian"
  }'
```

### Ambil daftar hasil generate

```bash
curl http://localhost:8000/api/ai/generations
```

### Dashboard stats

```bash
curl http://localhost:8000/api/dashboard/stats
```

## 4. Hubungkan ke frontend Vite

Buat file `.env` di frontend:

```env
VITE_API_URL=http://localhost:8000/api
```

Contoh fungsi generate di frontend:

```ts
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export async function generateContent(payload: {
  idea: string;
  platform: string;
  tone: string;
  language?: string;
}) {
  const response = await fetch(`${API_URL}/ai/generate-content`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language: "Indonesian", ...payload }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}
```

## 5. Struktur database

Tabel utama:

- `projects`
- `content_generations`

Database dibuat otomatis saat backend pertama kali menyala.
