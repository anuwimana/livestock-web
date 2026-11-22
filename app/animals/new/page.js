"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
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
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Link href="/" className="text-sm text-green-700 hover:underline">
          ← Back to animals
        </Link>
        <h1 className="mt-4 text-3xl font-bold">Add animal</h1>

        <form
          onSubmit={handleSubmit}
          className="mt-6 max-w-md space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Ear tag
            </label>
            <input
              type="text"
              placeholder="e.g. RW-012"
              value={earTag}
              onChange={(e) => setEarTag(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Species
            </label>
            <select value={species} onChange={(e) => setSpecies(e.target.value)}>
              <option value="">Select species</option>
              <option value="cattle">cattle</option>
              <option value="goat">goat</option>
              <option value="sheep">sheep</option>
              <option value="pig">pig</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Birth date
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-green-600 py-2.5 font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save animal"}
          </button>
        </form>
      </main>
    </div>
  );
}