"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { ADMIN_CREDENTIALS } from "@/lib/seed";

export default function AdminLoginPage() {
  const { isAdmin, login } = useApp();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAdmin) router.replace("/admin");
  }, [isAdmin, router]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const ok = login(username.trim(), password);
    if (!ok) {
      setError("Invalid credentials. Try the demo admin login shown below.");
      return;
    }
    router.push("/admin");
  };

  return (
    <div className="container-shell section-space !pt-10">
      <div className="mx-auto max-w-md surface p-6 md:p-8">
        <h1 className="font-display text-4xl">Admin login</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Manage flats inventory, featured listings, and enquiry leads.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button type="submit" className="btn btn-primary w-full">
            Sign in
          </button>
        </form>
        <p className="mt-5 rounded-xl bg-mist px-4 py-3 text-sm text-ink-soft">
          Demo credentials:{" "}
          <strong>
            {ADMIN_CREDENTIALS.username} / {ADMIN_CREDENTIALS.password}
          </strong>
        </p>
        <Link href="/" className="mt-4 inline-block text-sm font-semibold text-sage">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
