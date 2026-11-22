"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api";

export default function Navbar() {
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-green-700"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white">
            L
          </span>
          Livestock Health
        </Link>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Log out
        </button>
      </div>
    </header>
  );
}