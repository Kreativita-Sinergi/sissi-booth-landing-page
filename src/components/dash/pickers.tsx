"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Calendar, Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/components/shared/cn";

/** Pilihan & kalender kustom (aturan proyek: tanpa dropdown/date picker bawaan browser). */

export type Option = { value: string; label: string };

function useOutside(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && close();
    const key = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", down);
      document.removeEventListener("keydown", key);
    };
  }, [open, close]);
  return ref;
}

/**
 * Dropdown kustom. `name` → input tersembunyi untuk formulir; `onChange` untuk filter URL.
 * Keyboard: panah atas/bawah, Enter, Esc.
 */
export function Select({
  name,
  value,
  defaultValue,
  options,
  onChange,
  label,
  pill,
  invalid,
}: {
  name?: string;
  value?: string;
  defaultValue?: string;
  options: Option[];
  onChange?: (v: string) => void;
  label: string;
  /** Gaya kapsul kecil (filter di atas tabel). */
  pill?: boolean;
  invalid?: boolean;
}) {
  const [inner, setInner] = useState(defaultValue ?? options[0]?.value ?? "");
  const current = value ?? inner;
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const ref = useOutside(open, () => setOpen(false));
  const listId = useId();
  const pick = (v: string) => {
    setInner(v);
    onChange?.(v);
    setOpen(false);
  };
  const selected = options.find((o) => o.value === current);
  return (
    <div ref={ref} className={cn("relative", pill ? "inline-block" : "w-full")}>
      {name && <input type="hidden" name={name} value={current} />}
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          setHi(Math.max(0, options.findIndex((o) => o.value === current)));
          setOpen((o) => !o);
        }}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setOpen(true);
          } else if (open && e.key === "ArrowDown") {
            e.preventDefault();
            setHi((h) => Math.min(options.length - 1, h + 1));
          } else if (open && e.key === "ArrowUp") {
            e.preventDefault();
            setHi((h) => Math.max(0, h - 1));
          } else if (open && e.key === "Enter") {
            e.preventDefault();
            pick(options[hi].value);
          }
        }}
        className={cn(
          "flex w-full items-center justify-between gap-2 border-2 border-ink bg-white text-left",
          pill ? "h-9 rounded-full px-3 text-xs font-bold hover:bg-booth-yellow" : "h-11 rounded-xl px-3 text-base",
          invalid && "border-booth-pink",
        )}
      >
        <span className="truncate">{selected?.label ?? "Pilih…"}</span>
        <ChevronDown aria-hidden className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")} strokeWidth={3} />
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute left-0 z-40 mt-1 max-h-64 min-w-full overflow-y-auto rounded-xl border-2 border-ink bg-white p-1 shadow-hard-sm"
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === current}
              onMouseEnter={() => setHi(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(o.value);
              }}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm",
                i === hi && "bg-booth-yellow",
                o.value === current && "font-bold",
              )}
            >
              {o.label}
              {o.value === current && <Check aria-hidden className="size-4" strokeWidth={3} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// --- kalender ---

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const pad = (n: number) => String(n).padStart(2, "0");
const toYmd = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

export function todayYmd() {
  return new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
}

/** "2026-10-09" → "9 Okt 2026". */
export function ymdLabel(v: string) {
  if (!v) return "";
  const [y, m, d] = v.split("-").map(Number);
  return `${d} ${MONTHS[m - 1].slice(0, 3)} ${y}`;
}

/**
 * Kalender sebulan. Mode rentang: ketuk awal lalu akhir (ketuk lebih awal = ditukar).
 */
function Month({
  start,
  end,
  onPick,
  initial,
}: {
  start: string;
  end?: string;
  onPick: (d: string) => void;
  initial: string;
}) {
  const [y0, m0] = (initial || todayYmd()).split("-").map(Number);
  const [view, setView] = useState({ y: y0, m: m0 - 1 });
  const first = new Date(Date.UTC(view.y, view.m, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
  const today = todayYmd();
  const shift = (n: number) => setView((v) => ({ y: v.y + Math.floor((v.m + n) / 12), m: (v.m + n + 12) % 12 }));
  const lo = end && end < start ? end : start;
  const hi = end && end < start ? start : end;
  return (
    <div className="w-[280px]">
      <div className="mb-2 flex items-center justify-between">
        <button type="button" aria-label="Bulan sebelumnya" onClick={() => shift(-1)} className="rounded-lg border-2 border-ink p-1 hover:bg-booth-yellow">
          <ChevronLeft className="size-4" strokeWidth={3} />
        </button>
        <span className="font-label text-sm">
          {MONTHS[view.m]} {view.y}
        </span>
        <button type="button" aria-label="Bulan berikutnya" onClick={() => shift(1)} className="rounded-lg border-2 border-ink p-1 hover:bg-booth-yellow">
          <ChevronRight className="size-4" strokeWidth={3} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-xs">
        {DAYS.map((d) => (
          <span key={d} className="py-1 font-bold text-muted">
            {d}
          </span>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <span key={`l${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const v = toYmd(view.y, view.m, i + 1);
          const edge = v === lo || v === hi;
          const inside = lo && hi && v > lo && v < hi;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onPick(v)}
              className={cn(
                "h-9 rounded-lg text-sm",
                edge ? "bg-ink font-bold text-white" : inside ? "bg-booth-yellow" : "hover:bg-paper",
                v === today && !edge && "border-2 border-ink",
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Input tanggal tunggal dengan kalender kustom (nilai YYYY-MM-DD lewat input tersembunyi). */
export function DateInput({ name, defaultValue, label, invalid }: { name: string; defaultValue?: string; label: string; invalid?: boolean }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const ref = useOutside(open, () => setOpen(false));
  return (
    <div ref={ref} className="relative w-full">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn("flex h-11 w-full items-center justify-between gap-2 rounded-xl border-2 border-ink bg-white px-3 text-left text-base", invalid && "border-booth-pink")}
      >
        <span className={cn(!value && "text-muted")}>{value ? ymdLabel(value) : "Pilih tanggal"}</span>
        <Calendar aria-hidden className="size-4 shrink-0" strokeWidth={2.5} />
      </button>
      {open && (
        <div className="absolute left-0 z-40 mt-1 rounded-2xl border-2 border-ink bg-white p-3 shadow-hard-sm">
          <Month
            start={value}
            initial={value}
            onPick={(d) => {
              setValue(d);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

/** Pemilih rentang tanggal (popover): ketuk awal & akhir lalu Terapkan. */
export function RangePicker({ from, to, onApply, onClose }: { from: string; to: string; onApply: (f: string, t: string) => void; onClose: () => void }) {
  const [start, setStart] = useState(from);
  const [end, setEnd] = useState<string | undefined>(to);
  const ref = useOutside(true, onClose);
  return (
    <div ref={ref} className="absolute left-0 top-full z-40 mt-2 rounded-2xl border-2 border-ink bg-white p-3 shadow-hard-sm sm:left-auto sm:right-0">
      <Month
        start={start}
        end={end}
        initial={to}
        onPick={(d) => {
          if (end !== undefined) {
            setStart(d);
            setEnd(undefined);
          } else {
            setEnd(d);
          }
        }}
      />
      <div className="mt-3 flex items-center justify-between gap-2 border-t-2 border-ink/10 pt-3">
        <span className="text-xs text-muted">{end === undefined ? "Ketuk tanggal akhir" : `${ymdLabel(start < end ? start : end)} – ${ymdLabel(start < end ? end : start)}`}</span>
        <button
          type="button"
          onClick={() => {
            const e = end ?? start;
            onApply(start < e ? start : e, start < e ? e : start);
          }}
          className="h-9 rounded-xl border-2 border-ink bg-booth-blue px-3 font-label text-xs uppercase text-white shadow-hard-sm"
        >
          Terapkan
        </button>
      </div>
    </div>
  );
}
