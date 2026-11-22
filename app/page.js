"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { apiFetch, getToken, logout } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [animals, setAnimals] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    apiFetch(`/animals/?page=${page}`)
      .then((data) => {
        setAnimals(data.results);
        setCount(data.count);
        setHasNext(Boolean(data.next));
        setHasPrev(Boolean(data.previous));
        setStatus(data.results.length ? "ready" : "empty");
      })
      .catch((err) => {
        if (err.status === 401) {
          logout();
          router.replace("/login");
          return;
        }
        setError(err.message);
        setStatus("error");
      });
  }, [page, router]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-3xl font-bold">Animals</h1>
        <p className="mt-1 text-gray-500">
          Manage your animals and their treatment records.
        </p>

        <div className="mt-6 mb-5">
          <Link
            href="/animals/new"
            className="inline-block rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
          >
            + Add animal
          </Link>
        </div>

        {status === "loading" && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
            Loading...
          </div>
        )}
        {status === "error" && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            Error: {error}
          </div>
        )}
        {status === "empty" && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
            No animals yet. Click “Add animal” to create your first one.
          </div>
        )}

        {status === "ready" && (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-sm text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Ear tag</th>
                  <th className="px-4 py-3 font-medium">Species</th>
                  <th className="px-4 py-3 font-medium">Birth date</th>
                </tr>
              </thead>
              <tbody>
                {animals.map((a) => (
                  <tr key={a.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <Link
                        href={`/animals/${a.id}`}
                        className="font-medium text-green-700 hover:underline"
                      >
                        {a.ear_tag}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800">
                        {a.species}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{a.birth_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-3">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={!hasPrev}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page} · {count} animals
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNext}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}