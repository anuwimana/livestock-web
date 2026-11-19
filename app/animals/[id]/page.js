"use client";
import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, getToken, logout } from "@/lib/api";

function byDateDesc(list) {
  return [...list].sort((x, y) => y.treat_date.localeCompare(x.treat_date));
}

function formatErrors(data) {
  return Object.entries(data)
    .map(([field, msg]) => `${field}: ${Array.isArray(msg) ? msg.join(" ") : msg}`)
    .join(" | ");
}

function AnimalDetailContent() {
  const { id } = useParams();
  const router = useRouter();
  const [animal, setAnimal] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const [drug, setDrug] = useState("");
  const [treatDate, setTreatDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    Promise.all([
      apiFetch(`/animals/${id}/`),
      apiFetch(`/treatments/?animal=${id}`),
    ])
      .then(([a, t]) => {
        setAnimal(a);
        setTreatments(byDateDesc(t));
        setStatus("ready");
      })
      .catch((err) => {
        if (err.status === 401) {
          logout();
          router.replace("/login");
          return;
        }
        if (err.status === 404) {
          setStatus("notfound");
          return;
        }
        setError(err.message);
        setStatus("error");
      });
  }, [id, router]);

  async function handleAdd(e) {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const created = await apiFetch("/treatments/", {
        method: "POST",
        body: JSON.stringify({
          animal: Number(id),
          drug,
          treat_date: treatDate,
        }),
      });
      setTreatments((prev) => byDateDesc([created, ...prev]));
      setDrug("");
      setTreatDate("");
    } catch (err) {
      if (err.status === 401) {
        logout();
        router.replace("/login");
        return;
      }
      if (err.status === 403) {
        setFormError(
          "Only a vet can add treatments. Please log in with a vet account."
        );
      } else if (err.status === 400 && err.data) {
        setFormError(formatErrors(err.data));
      } else {
        setFormError(err.message);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/" className="text-green-500 underline">
        ← Back to animals
      </Link>

      {status === "loading" && <p className="mt-6">Loading...</p>}
      {status === "notfound" && <p className="mt-6">Animal not found.</p>}
      {status === "error" && (
        <p className="mt-6 text-red-500">Error: {error}</p>
      )}

      {status === "ready" && (
        <>
          <h1 className="mt-6 text-2xl font-bold">{animal.ear_tag}</h1>
          <p className="mt-1">
            {animal.species} · born {animal.birth_date}
          </p>

          <h2 className="mt-8 mb-3 text-xl font-semibold">Add treatment</h2>
          <form onSubmit={handleAdd} className="mb-8 space-y-3">
            <input
              type="text"
              placeholder="Drug"
              value={drug}
              onChange={(e) => setDrug(e.target.value)}
              className="w-full rounded border bg-white p-2 text-black"
            />
            <input
              type="date"
              value={treatDate}
              onChange={(e) => setTreatDate(e.target.value)}
              className="w-full rounded border bg-white p-2 text-black"
            />
            {formError && <p className="text-red-500">{formError}</p>}
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save treatment"}
            </button>
          </form>

          <h2 className="mb-4 text-xl font-semibold">Treatment timeline</h2>
          {treatments.length === 0 ? (
            <p>No treatments yet.</p>
          ) : (
            <ol className="space-y-6 border-l pl-6">
              {treatments.map((t) => (
                <li key={t.id} className="relative">
                  <span className="absolute top-1 -left-[31px] h-3 w-3 rounded-full bg-green-500" />
                  <p className="text-sm opacity-70">{t.treat_date}</p>
                  <p className="font-medium">{t.drug}</p>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </main>
  );
}

export default function AnimalDetail() {
  return (
    <Suspense fallback={<p className="p-8">Loading...</p>}>
      <AnimalDetailContent />
    </Suspense>
  );
}