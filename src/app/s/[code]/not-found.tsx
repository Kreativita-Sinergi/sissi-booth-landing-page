import { Footer, Frame } from "./frame";
import "./galeri.css";

export default function NotFound() {
  return (
    <Frame>
      <main>
        <div className="top">
          <a className="logo" href="https://booth.sissi.id">sissi booth</a>
        </div>
        <section className="empty">
          <div className="yah">YAH!</div>
          <h1>Galerinya nggak ketemu</h1>
          <p>Mungkin kodenya salah, atau fotonya sudah lewat 30 hari jadi dihapus otomatis.</p>
          <a className="btn w" href="https://booth.sissi.id">Ke booth.sissi.id</a>
        </section>
      </main>
      <Footer />
    </Frame>
  );
}
