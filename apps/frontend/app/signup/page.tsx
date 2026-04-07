"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { Button, buttonVariants } from "@/components/button";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          data?.msg?.error ?? "Unable to sign up. Please try again later.";
        setErrorMessage(message);
        return;
      }

      if (typeof window !== "undefined" && data?.token) {
        window.localStorage.setItem("token", data.token);
      }

      setSuccessMessage(data?.msg ?? "Signed up successfully.");
      setUsername("");
      setPassword("");
    } catch {
      setErrorMessage("Unable to reach the server. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-900 px-6 py-12 text-slate-100">
      <section className="w-full max-w-md rounded-4xl border border-gray-700 bg-gray-800/70 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10">
        <div className="space-y-6">
          <div className="space-y-3 text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-yellow-300/80">
              New Account
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-white">
              Sign up
            </h1>
            <p className="text-sm leading-6 text-slate-300">
              Create an account with a username and password.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Username</span>
              <input
                type="text"
                name="username"
                placeholder="Choose a username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-2xl border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-yellow-400/70"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Choose a password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-gray-700 bg-gray-950 px-4 py-3 pr-14 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-yellow-400/70"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-yellow-200 transition hover:text-yellow-100"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {errorMessage ? (
              <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {errorMessage}
              </p>
            ) : null}

            {successMessage ? (
              <p className="rounded-2xl border border-yellow-400/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
                {successMessage}
              </p>
            ) : null}

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Signing Up..." : "Submit"}
            </Button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/" className={buttonVariants({ variant: "ghost" })}>
              Back to Counter
            </Link>
            <Link href="/signin" className={buttonVariants({ variant: "secondary" })}>
              Go to Sign In
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
