/** Bingkai halaman galeri (latar kuning penuh + footer promosi), sama dengan desain HP. */
export function Frame({ children }: { children: React.ReactNode }) {
  return <div className="g">{children}</div>;
}

export function Footer() {
  return (
    <footer>
      <div>
        <p>Mau booth seseru ini di acaramu?</p>
        <a href="https://booth.sissi.id">booth.sissi.id →</a>
        <small>Dibuat dengan Sissi Booth</small>
      </div>
    </footer>
  );
}
