"use client";

import { useState } from "react";
import { KeyRound, Plus, RefreshCw, WalletCards } from "lucide-react";
import {
  changeAdminPassword,
  createAdmin,
  createLicense,
  createOwner,
  extendLicense,
  recordPayment,
  resetOwnerPassword,
  rotateKey,
  updateLicense,
  updateOwner,
} from "@/lib/dash/admin-actions";
import type { ActionState } from "@/lib/dash/action-state";
import { date, waLink } from "@/lib/dash/format";
import type { License, OwnerProfile } from "@/lib/dash/types";
import { ActionForm, Button, CopyButton, DateField, Dialog, DialogAction, Field, SelectField, SubmitButton, TextArea } from "./client";
import { todayYmd } from "./pickers";

const PLANS = [
  { value: "monthly", label: "Bulanan" },
  { value: "daily", label: "Harian" },
  { value: "yearly", label: "Tahunan" },
];

function Actions({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">{children}</div>;
}

export function NewOwnerButton() {
  return (
    <DialogAction label="Tambah pemilik" title="Tambah pemilik booth" tone="blue" icon={<Plus className="size-4" strokeWidth={3} />}>
      {(close) => (
        <ActionForm action={createOwner}>
          {(s) => (
            <>
              <Field label="Nama" name="name" required error={s.fields?.name} />
              <Field label="Email (untuk masuk dashboard)" name="email" type="email" required error={s.fields?.email} />
              <Field label="No. WhatsApp" name="phone" inputMode="tel" placeholder="0812…" error={s.fields?.phone} />
              <Field label="Kata sandi awal" name="password" required error={s.fields?.password} hint="Min. 8 karakter, berisi huruf & angka. Berikan ke pemilik lewat WA." />
              <Actions>
                <Button type="button" onClick={close}>Batal</Button>
                <SubmitButton>Simpan</SubmitButton>
              </Actions>
            </>
          )}
        </ActionForm>
      )}
    </DialogAction>
  );
}

export function EditOwnerButton({ owner }: { owner: OwnerProfile }) {
  return (
    <DialogAction label="Ubah profil" title="Ubah profil pemilik" small>
      {(close) => (
        <ActionForm action={updateOwner} onDone={close}>
          {(s) => (
            <>
              <input type="hidden" name="id" value={owner.id} />
              <Field label="Nama" name="name" defaultValue={owner.name} required error={s.fields?.name} />
              <Field label="Email" name="email" type="email" defaultValue={owner.email} required error={s.fields?.email} />
              <Field label="No. WhatsApp" name="phone" defaultValue={owner.phone} error={s.fields?.phone} />
              <Actions>
                <Button type="button" onClick={close}>Batal</Button>
                <SubmitButton>Simpan</SubmitButton>
              </Actions>
            </>
          )}
        </ActionForm>
      )}
    </DialogAction>
  );
}

export function ResetPasswordButton({ ownerId }: { ownerId: string }) {
  return (
    <DialogAction label="Reset sandi" title="Reset kata sandi pemilik" small>
      {(close) => (
        <ActionForm action={resetOwnerPassword} onDone={close}>
          {(s) => (
            <>
              <input type="hidden" name="id" value={ownerId} />
              <Field label="Kata sandi baru" name="password" required error={s.fields?.password} hint="Min. 8 karakter, huruf & angka." />
              <Actions>
                <Button type="button" onClick={close}>Batal</Button>
                <SubmitButton>Ganti sandi</SubmitButton>
              </Actions>
            </>
          )}
        </ActionForm>
      )}
    </DialogAction>
  );
}

/** Kunci lisensi hanya ditampilkan sekali — tampilkan dengan tombol salin & kirim WA. */
function KeyResult({ s, owner, onClose }: { s: ActionState; owner?: OwnerProfile; onClose: () => void }) {
  const key = s.data?.key ?? "";
  const wa = owner
    ? waLink(
        owner.phone,
        `Halo ${owner.name}, ini kunci lisensi Sissi Booth kamu:\n\n${key}\n\nCara aktivasi: buka aplikasi Sissi Booth › Admin › Lisensi › tempel kunci › AKTIFKAN.\nDashboard: https://booth.sissi.id/dashboard (masuk dengan email ${owner.email}).`,
      )
    : null;
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm">{s.message} Simpan sekarang — kunci ini <b>tidak bisa dilihat lagi</b> setelah dialog ditutup.</p>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-booth-yellow px-4 py-3">
        <code className="font-mono text-lg font-bold tracking-wide">{key}</code>
        <CopyButton text={key} />
      </div>
      {s.data?.ends_at && <p className="text-sm text-muted">Berlaku sampai {date(s.data.ends_at)}.</p>}
      <Actions>
        <Button type="button" onClick={onClose}>Tutup</Button>
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center rounded-xl border-2 border-ink bg-booth-green px-4 font-label text-sm uppercase shadow-hard-sm">
            Kirim via WA
          </a>
        )}
      </Actions>
    </div>
  );
}

export function NewLicenseButton({ owner }: { owner: OwnerProfile }) {
  const [result, setResult] = useState<ActionState | null>(null);
  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
    setResult(null);
  };
  return (
    <>
      <Button type="button" tone="blue" small onClick={() => setOpen(true)}>
        <KeyRound className="size-4" strokeWidth={2.5} /> Buat lisensi
      </Button>
      <Dialog open={open} onClose={close} title={result ? "Kunci lisensi" : "Buat lisensi"}>
        {result ? (
          <KeyResult s={result} owner={owner} onClose={close} />
        ) : (
          <ActionForm action={createLicense} onDone={setResult}>
            {(s) => (
              <>
                <input type="hidden" name="owner_id" value={owner.id} />
                <SelectField label="Paket" name="plan" options={PLANS} error={s.fields?.plan} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Jumlah periode" name="periods" type="number" min={1} max={36} defaultValue={1} error={s.fields?.periods} />
                  <Field label="Maks. booth" name="max_devices" type="number" min={1} max={100} defaultValue={1} error={s.fields?.max_devices} />
                </div>
                <p className="text-xs text-muted">Belum ada pembayaran? Catat lewat tombol “Catat pembayaran” setelah transfer masuk.</p>
                <Actions>
                  <Button type="button" onClick={close}>Batal</Button>
                  <SubmitButton>Buat lisensi</SubmitButton>
                </Actions>
              </>
            )}
          </ActionForm>
        )}
      </Dialog>
    </>
  );
}

export function RotateKeyButton({ license, owner }: { license: License; owner?: OwnerProfile }) {
  const [result, setResult] = useState<ActionState | null>(null);
  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
    setResult(null);
  };
  return (
    <>
      <Button type="button" small onClick={() => setOpen(true)}>
        <RefreshCw className="size-4" strokeWidth={2.5} /> Kunci baru
      </Button>
      <Dialog open={open} onClose={close} title={result ? "Kunci lisensi baru" : "Buat kunci baru?"}>
        {result ? (
          <KeyResult s={result} owner={owner} onClose={close} />
        ) : (
          <ActionForm action={rotateKey} onDone={setResult}>
            {() => (
              <>
                <input type="hidden" name="id" value={license.id} />
                <p className="text-sm">Kunci lama (…{license.key_hint.slice(-4)}) langsung tidak berlaku untuk aktivasi baru. Booth yang sudah aktif tetap jalan.</p>
                <Actions>
                  <Button type="button" onClick={close}>Batal</Button>
                  <SubmitButton tone="pink">Buat kunci baru</SubmitButton>
                </Actions>
              </>
            )}
          </ActionForm>
        )}
      </Dialog>
    </>
  );
}

export function ExtendLicenseButton({ license }: { license: License }) {
  return (
    <DialogAction label="Perpanjang" title="Perpanjang lisensi (tanpa catat bayar)" small>
      {(close) => (
        <ActionForm action={extendLicense} onDone={close}>
          {(s) => (
            <>
              <input type="hidden" name="id" value={license.id} />
              <p className="text-sm text-muted">Untuk perpanjangan berbayar, pakai “Catat pembayaran” agar masuk laporan pendapatan.</p>
              <SelectField label="Paket" name="plan" options={PLANS} defaultValue={license.plan} />
              <Field label="Jumlah periode" name="periods" type="number" min={1} max={36} defaultValue={1} error={s.fields?.periods} />
              <Actions>
                <Button type="button" onClick={close}>Batal</Button>
                <SubmitButton>Perpanjang</SubmitButton>
              </Actions>
            </>
          )}
        </ActionForm>
      )}
    </DialogAction>
  );
}

export function LicenseSettingsButton({ license }: { license: License }) {
  return (
    <DialogAction label="Atur" title="Atur lisensi" small>
      {(close) => (
        <ActionForm action={updateLicense} onDone={close}>
          {(s) => (
            <>
              <input type="hidden" name="id" value={license.id} />
              <SelectField
                label="Status"
                name="status"
                defaultValue={license.status === "suspended" ? "suspended" : "active"}
                options={[
                  { value: "active", label: "Aktif" },
                  { value: "suspended", label: "Ditangguhkan (booth berhenti)" },
                ]}
              />
              <Field label="Maks. booth" name="max_devices" type="number" min={1} max={100} defaultValue={license.max_devices} error={s.fields?.max_devices} />
              <Actions>
                <Button type="button" onClick={close}>Batal</Button>
                <SubmitButton>Simpan</SubmitButton>
              </Actions>
            </>
          )}
        </ActionForm>
      )}
    </DialogAction>
  );
}

/** Catat pembayaran langganan (opsional sekaligus perpanjang lisensi). */
export function RecordPaymentButton({
  owners,
  ownerId,
  licenses,
  small,
}: {
  /** Daftar pemilik untuk dipilih (halaman pembayaran); kosong bila ownerId sudah pasti. */
  owners?: { id: string; name: string }[];
  ownerId?: string;
  licenses?: License[];
  small?: boolean;
}) {
  const licOptions = [
    { value: "", label: "Tanpa perpanjangan" },
    ...(licenses ?? []).map((l) => ({ value: l.id, label: `…${l.key_hint.slice(-4)} · s/d ${date(l.ends_at)}` })),
  ];
  return (
    <DialogAction label="Catat pembayaran" title="Catat pembayaran langganan" tone="green" small={small} icon={<WalletCards className="size-4" strokeWidth={2.5} />}>
      {(close) => (
        <ActionForm action={recordPayment} onDone={close}>
          {(s) => (
            <>
              {ownerId ? (
                <input type="hidden" name="owner_id" value={ownerId} />
              ) : (
                <SelectField label="Pemilik" name="owner_id" options={(owners ?? []).map((o) => ({ value: o.id, label: o.name }))} error={s.fields?.owner_id} />
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nominal (Rp)" name="amount" inputMode="numeric" required placeholder="150000" error={s.fields?.amount} />
                <SelectField
                  label="Metode"
                  name="method"
                  options={[
                    { value: "transfer", label: "Transfer bank" },
                    { value: "qris", label: "QRIS" },
                    { value: "cash", label: "Tunai" },
                    { value: "other", label: "Lainnya" },
                  ]}
                />
              </div>
              <DateField label="Tanggal bayar" name="paid_on" defaultValue={todayYmd()} />
              {licenses && licenses.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <SelectField label="Perpanjang lisensi" name="license_id" options={licOptions} error={s.fields?.license_id} />
                  <Field label="Periode" name="periods" type="number" min={0} max={36} defaultValue={1} error={s.fields?.periods} hint="0 = hanya catat bayar" />
                </div>
              )}
              <TextArea label="Catatan" name="note" placeholder="mis. BCA a.n. Rani, 9 Okt" error={s.fields?.note} />
              <Actions>
                <Button type="button" onClick={close}>Batal</Button>
                <SubmitButton tone="green">Simpan</SubmitButton>
              </Actions>
            </>
          )}
        </ActionForm>
      )}
    </DialogAction>
  );
}

export function NewAdminButton() {
  return (
    <DialogAction label="Tambah admin" title="Tambah admin" tone="blue" small icon={<Plus className="size-4" strokeWidth={3} />}>
      {(close) => (
        <ActionForm action={createAdmin} onDone={close}>
          {(s) => (
            <>
              <Field label="Nama" name="name" required error={s.fields?.name} />
              <Field label="Email" name="email" type="email" required error={s.fields?.email} />
              <Field label="Kata sandi" name="password" required error={s.fields?.password} hint="Min. 8 karakter, huruf & angka." />
              <Actions>
                <Button type="button" onClick={close}>Batal</Button>
                <SubmitButton>Simpan</SubmitButton>
              </Actions>
            </>
          )}
        </ActionForm>
      )}
    </DialogAction>
  );
}

export function ChangePasswordForm({ action = changeAdminPassword }: { action?: (s: ActionState, f: FormData) => Promise<ActionState> }) {
  return (
    <ActionForm action={action}>
      {(s) => (
        <>
          {s.ok && <p className="rounded-xl border-2 border-ink bg-booth-green px-3 py-2 text-sm font-bold">{s.message}</p>}
          <Field label="Kata sandi sekarang" name="current_password" type="password" autoComplete="current-password" required error={s.fields?.current_password} />
          <Field label="Kata sandi baru" name="new_password" type="password" autoComplete="new-password" required error={s.fields?.new_password} hint="Min. 8 karakter, huruf & angka." />
          <div>
            <SubmitButton>Ganti sandi</SubmitButton>
          </div>
        </>
      )}
    </ActionForm>
  );
}
