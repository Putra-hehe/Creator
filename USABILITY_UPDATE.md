# CreatorForge AI Usability Update

Perubahan utama di frontend:

1. Generator dibuat menjadi workflow dua kolom:
   - kiri untuk input ide, platform, tone, dan quick ideas
   - kanan untuk output AI

2. Output AI tidak lagi ditampilkan sebagai teks panjang campur aduk.
   Output dipisahkan menjadi tab:
   - Script
   - Storyboard
   - Prompts
   - Caption
   - Checklist

3. Setiap bagian output punya tombol Copy.
   Ada juga tombol Copy all untuk menyalin seluruh hasil utama.

4. Dashboard sekarang mengambil data dari backend:
   - GET /api/dashboard/stats
   - GET /api/projects
   - GET /api/ai/generations

5. Ada Recent Generations.
   Hasil AI sebelumnya bisa diklik lagi dan ditampilkan di panel output.

6. Empty state dan loading state diperjelas supaya pengguna tidak bingung.

7. package.json ditambahkan react dan react-dom di dependencies agar build tidak gagal di environment baru.

Cara menjalankan tetap sama:

Backend:
cd backend
docker compose up --build

Frontend:
cd frontend
npm install
npm run dev
