# Sissi Booth — landing page

Landing page pemasaran aplikasi photobooth **Sissi Booth** (Next.js 16 + Tailwind 4, halaman statis).

```bash
npm install
npm run dev            # http://localhost:3000
npm run build && npm start
```

Env opsional: `NEXT_PUBLIC_SITE_URL` (default `https://booth.sissi.id`) untuk metadata/OG.

- Ubah teks: `src/constants/content.ts`
- Ubah warna/fon/bayangan: `src/app/globals.css` (`@theme`)
- Aturan kontributor/agent: `AGENTS.md` · catatan pekerjaan: `docs/PEKERJAAN.md`
