"use client";

import { Plus } from "lucide-react";
import { changeOwnerPassword, createEvent, updateEvent, updateProfile } from "@/lib/dash/owner-actions";
import type { BoothEvent, OwnerProfile } from "@/lib/dash/types";
import { ActionForm, Button, DateField, DialogAction, Field, SelectField, SubmitButton, TextArea } from "./client";
import { todayYmd } from "./pickers";

function EventFields({ e, booths, fields }: { e?: BoothEvent; booths: { id: string; name: string }[]; fields?: Record<string, string> }) {
  return (
    <>
      <Field label="Nama acara" name="name" defaultValue={e?.name} required placeholder="Nikahan Rara & Dimas" error={fields?.name} />
      <Field label="Nama klien" name="client_name" placeholder="mis. Rara & Dimas" defaultValue={e?.client_name} error={fields?.client_name} />
      <div className="grid gap-3 sm:grid-cols-2">
        <DateField label="Tanggal mulai" name="starts_on" defaultValue={e?.starts_on ?? todayYmd()} error={fields?.starts_on} />
        <DateField label="Tanggal selesai" name="ends_on" defaultValue={e?.ends_on ?? todayYmd()} error={fields?.ends_on} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nilai kontrak (Rp)" name="contract_amount" inputMode="numeric" defaultValue={e?.contract_amount || ""} placeholder="1500000" error={fields?.contract_amount} />
        <Field label="Biaya lain (Rp)" name="other_cost" inputMode="numeric" defaultValue={e?.other_cost || ""} placeholder="transport, kru…" error={fields?.other_cost} />
      </div>
      {booths.length > 1 && (
        <SelectField
          label="Booth"
          name="device_id"
          defaultValue={e?.device_id ?? ""}
          options={[{ value: "", label: "Semua booth" }, ...booths.map((b) => ({ value: b.id, label: b.name }))]}
          error={fields?.device_id}
        />
      )}
      <TextArea label="Catatan" name="note" placeholder="mis. Gedung Serbaguna, 300 tamu, 2 kru" defaultValue={e?.note} error={fields?.note} />
      <p className="text-xs text-muted">Transaksi booth pada tanggal acara otomatis terhitung ke acara ini.</p>
    </>
  );
}

export function NewEventButton({ booths }: { booths: { id: string; name: string }[] }) {
  return (
    <DialogAction label="Tambah acara" title="Tambah acara" tone="blue" wide icon={<Plus className="size-4" strokeWidth={3} />}>
      {(close) => (
        <ActionForm action={createEvent}>
          {(s) => (
            <>
              <EventFields booths={booths} fields={s.fields} />
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" onClick={close}>Batal</Button>
                <SubmitButton>Simpan</SubmitButton>
              </div>
            </>
          )}
        </ActionForm>
      )}
    </DialogAction>
  );
}

export function EditEventButton({ event, booths }: { event: BoothEvent; booths: { id: string; name: string }[] }) {
  return (
    <DialogAction label="Ubah" title="Ubah acara" wide small>
      {(close) => (
        <ActionForm action={updateEvent} onDone={close}>
          {(s) => (
            <>
              <input type="hidden" name="id" value={event.id} />
              <EventFields e={event} booths={booths} fields={s.fields} />
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" onClick={close}>Batal</Button>
                <SubmitButton>Simpan</SubmitButton>
              </div>
            </>
          )}
        </ActionForm>
      )}
    </DialogAction>
  );
}

export function ProfileForm({ me }: { me: OwnerProfile }) {
  return (
    <ActionForm action={updateProfile}>
      {(s) => (
        <>
          {s.ok && <p className="rounded-xl border-2 border-ink bg-booth-green px-3 py-2 text-sm font-bold">{s.message}</p>}
          <Field label="Nama usaha / pemilik" name="name" placeholder="mis. Rani Photobooth" defaultValue={me.name} required error={s.fields?.name} />
          <Field label="No. WhatsApp" name="phone" placeholder="mis. 081234567890" defaultValue={me.phone} error={s.fields?.phone} />
          <Field
            label="Biaya kertas per lembar (Rp)"
            name="paper_cost"
            inputMode="numeric"
            defaultValue={me.paper_cost || ""}
            placeholder="mis. 2500"
            error={s.fields?.paper_cost}
            hint="Harga 1 pak kertas+tinta ÷ jumlah lembar. Dipakai menghitung keuntungan."
          />
          <div>
            <SubmitButton>Simpan</SubmitButton>
          </div>
        </>
      )}
    </ActionForm>
  );
}

export function OwnerPasswordForm() {
  return (
    <ActionForm action={changeOwnerPassword}>
      {(s) => (
        <>
          {s.ok && <p className="rounded-xl border-2 border-ink bg-booth-green px-3 py-2 text-sm font-bold">{s.message}</p>}
          <Field label="Kata sandi sekarang" name="current_password" placeholder="Kata sandi yang dipakai sekarang" type="password" autoComplete="current-password" required error={s.fields?.current_password} />
          <Field label="Kata sandi baru" name="new_password" placeholder="Min. 8 karakter, huruf & angka" type="password" autoComplete="new-password" required error={s.fields?.new_password} hint="Min. 8 karakter, huruf & angka." />
          <div>
            <SubmitButton>Ganti sandi</SubmitButton>
          </div>
        </>
      )}
    </ActionForm>
  );
}
