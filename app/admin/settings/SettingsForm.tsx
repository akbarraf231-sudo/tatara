"use client";

import { Settings } from "@/lib/settings";
import { useState, useTransition } from "react";
import { updateSettings } from "./actions";

export default function SettingsForm({ settings }: { settings: Settings }) {
  const [form, setForm] = useState<Settings>(settings);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(
    null
  );

  function update<K extends keyof Settings>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      const res = await updateSettings(form);
      if (!res.ok) {
        setMsg({ kind: "error", text: res.error });
      } else {
        setMsg({ kind: "ok", text: "✓ Pengaturan disimpan" });
        setTimeout(() => setMsg(null), 2500);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Brand */}
      <Section title="Identitas Toko">
        <Field
          label="Nama toko"
          help="Tampil di header, footer, dan judul halaman"
        >
          <Input
            value={form.business_name}
            onChange={(v) => update("business_name", v)}
            placeholder="Sinar Jaya Bakery"
            required
          />
        </Field>
        <Field label="Tagline" help="Kalimat pendek di hero landing page">
          <Input
            value={form.tagline}
            onChange={(v) => update("tagline", v)}
            placeholder="Roti & kue homemade fresh setiap hari"
          />
        </Field>
      </Section>

      {/* Contact */}
      <Section title="Kontak">
        <Field
          label="Nomor WhatsApp utama"
          help="Format: 628xxxxxxxxxx (tanpa + atau spasi)"
        >
          <Input
            value={form.whatsapp}
            onChange={(v) => update("whatsapp", v.replace(/[^0-9]/g, ""))}
            placeholder="6285801299758"
            required
            inputMode="numeric"
          />
        </Field>
        <Field
          label="WhatsApp Special Order"
          help="Bisa sama atau beda dengan WA utama"
        >
          <Input
            value={form.special_order_wa}
            onChange={(v) =>
              update("special_order_wa", v.replace(/[^0-9]/g, ""))
            }
            placeholder="6285801299758"
            inputMode="numeric"
          />
        </Field>
        <Field label="Email (opsional)">
          <Input
            type="email"
            value={form.email}
            onChange={(v) => update("email", v)}
            placeholder="email@toko.com"
          />
        </Field>
        <Field label="Alamat (opsional)">
          <Textarea
            value={form.address}
            onChange={(v) => update("address", v)}
            placeholder="Jl. ... No. ..."
          />
        </Field>
      </Section>

      {/* Hours */}
      <Section title="Jam Buka">
        <Field label="Senin – Jumat">
          <Input
            value={form.hours_weekday}
            onChange={(v) => update("hours_weekday", v)}
            placeholder="Senin – Jumat: 07.00 – 20.00"
          />
        </Field>
        <Field label="Sabtu – Minggu">
          <Input
            value={form.hours_weekend}
            onChange={(v) => update("hours_weekend", v)}
            placeholder="Sabtu – Minggu: 08.00 – 21.00"
          />
        </Field>
      </Section>

      {/* Images */}
      <Section title="Foto Landing Page">
        <Field
          label="Foto Hero (atas)"
          help="URL foto. Tip: upload ke Supabase Storage, lalu salin URL-nya."
        >
          <Input
            value={form.hero_image}
            onChange={(v) => update("hero_image", v)}
            placeholder="https://..."
          />
        </Field>
        <Field
          label="Foto Cerita (tengah)"
          help="URL foto untuk section cerita di landing page"
        >
          <Input
            value={form.story_image}
            onChange={(v) => update("story_image", v)}
            placeholder="https://..."
          />
        </Field>
      </Section>

      {/* Submit */}
      <div className="sticky bottom-0 -mx-4 border-t border-stone-200 bg-stone-50/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0">
        <div className="flex items-center justify-between gap-3">
          {msg && (
            <p
              className={`text-sm ${
                msg.kind === "ok" ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {msg.text}
            </p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="ml-auto rounded-full bg-rose-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:opacity-60"
          >
            {isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-6 ring-1 ring-stone-100">
      <h2 className="font-serif text-lg font-semibold text-stone-900">
        {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-stone-700">
        {label}
      </span>
      {children}
      {help && <span className="mt-1 block text-[11px] text-stone-400">{help}</span>}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  inputMode?: "text" | "numeric" | "tel" | "email";
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      inputMode={inputMode}
      className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:border-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-700/15"
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:border-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-700/15"
    />
  );
}
