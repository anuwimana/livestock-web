"use client";
import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
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
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Link href="/" className="text-sm text-green-700 hover:underline">
          ← Back to animals
        </Link>

        {status === "loading" && (
          <p className="mt-6 text-gray-500">Loading...</p>
        )}
        {status === "notfound" && (
          <p className="mt-6 text-gray-700">Animal not found.</p>
        )}
        {status === "error" && (
          <p className="mt-6 rounded-lg bg-red-50 p-3 text-red-700">
            Error: {error}
          </p>
        )}

        {status === "ready" && (
          <>
            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{animal.ear_tag}</h1>
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800">
                  {animal.species}
                </span>
              </div>
              <p className="mt-1 text-gray-500">Born {animal.birth_date}</p>
            </div>

            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Add treatment</h2>
              <form onSubmit={handleAdd} className="max-w-md space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Drug
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin"
                    value={drug}
                    onChange={(e) => setDrug(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Treatment date
                  </label>
                  <input
                    type="date"
                    value={treatDate}
                    onChange={(e) => setTreatDate(e.target.value)}
                  />
                </div>
                {formError && (
                  <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {formError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save treatment"}
                </button>
              </form>
            </div>

            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-semibold">Treatment timeline</h2>
              {treatments.length === 0 ? (
                <p className="text-gray-500">No treatments yet.</p>
              ) : (
                <ol className="space-y-6 border-l-2 border-green-200 pl-6">
                  {treatments.map((t) => (
                    <li key={t.id} className="relative">
                      <span className="absolute top-1 -left-[31px] h-3 w-3 rounded-full bg-green-600" />
                      <p className="text-sm text-gray-500">{t.treat_date}</p>
                      <p className="font-medium">{t.drug}</p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function AnimalDetail() {
  return (
    <Suspense fallback={<p className="p-8 text-gray-500">Loading...</p>}>
      <AnimalDetailContent />
    </Suspense>
  );
}