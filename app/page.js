"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Animals</h1>
        <div className="flex gap-2">
          <Link
            href="/animals/new"
            className="rounded bg-green-600 px-3 py-1 text-white"
          >
            Add animal
          </Link>
          <button onClick={handleLogout} className="rounded border px-3 py-1">
            Log out
          </button>
        </div>
      </div>

      {status === "loading" && <p>Loading...</p>}
      {status === "error" && <p className="text-red-500">Error: {error}</p>}
      {status === "empty" && <p>No animals yet.</p>}

      {status === "ready" && (
        <>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-2">Ear tag</th>
                <th className="p-2">Species</th>
                <th className="p-2">Birth date</th>
              </tr>
            </thead>
            <tbody>
              {animals.map((a) => (
                <tr key={a.id} className="border-b">
                  <td className="p-2">
                    <Link
                      href={`/animals/${a.id}`}
                      className="text-green-500 underline"
                    >
                      {a.ear_tag}
                    </Link>
                  </td>
                  <td className="p-2">{a.species}</td>
                  <td className="p-2">{a.birth_date}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={!hasPrev}
              className="rounded border px-3 py-1 disabled:opacity-40"
            >
              Previous
            </button>
            <span>
              Page {page} · {count} animals
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNext}
              className="rounded border px-3 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      )}
    </main>
  );
}