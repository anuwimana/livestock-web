"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, logout } from "@/lib/api";

function formatErrors(data) {
  return Object.entries(data)
    .map(([field, msg]) => `${field}: ${Array.isArray(msg) ? msg.join(" ") : msg}`)
    .join(" | ");
}

export default function NewAnimal() {
  const router = useRouter();
  const [earTag, setEarTag] = useState("");
  const [species, setSpecies] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const created = await apiFetch("/animals/", {
        method: "POST",
        body: JSON.stringify({
          ear_tag: earTag,
          species,
          birth_date: birthDate,
        }),
      });
      router.push(`/animals/${created.id}`);
    } catch (err) {
      if (err.status === 401) {
        logout();
        router.replace("/login");
        return;
      }
      if (err.status === 400 && err.data) {
        setError(formatErrors(err.data));
      } else {
        setError(err.message);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm p-8">
      <Link href="/" className="text-green-500 underline">
        ← Back to animals
      </Link>
      <h1 className="mt-6 mb-6 text-2xl font-bold">Add animal</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Ear tag (e.g. RW-012)"
          value={earTag}
          onChange={(e) => setEarTag(e.target.value)}
          className="w-full rounded border bg-white p-2 text-black"
        />
        <select
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          className="w-full rounded border bg-white p-2 text-black"
        >
          <option value="">Select species</option>
          <option value="cattle">cattle</option>
          <option value="goat">goat</option>
          <option value="sheep">sheep</option>
          <option value="pig">pig</option>
        </select>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full rounded border bg-white p-2 text-black"
        />
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded bg-green-600 p-2 text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save animal"}
        </button>
      </form>
    </main>
  );
}