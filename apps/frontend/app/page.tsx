"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button, buttonVariants } from "@/components/button";

function formatTime(totalCentiseconds: number) {
  const totalSeconds = Math.floor(totalCentiseconds / 100);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = totalCentiseconds % 100;

  return {
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    centiseconds: String(centiseconds).padStart(2, "0"),
  };
}

export default function Home() {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const carriedTimeRef = useRef(0);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    startTimeRef.current = performance.now() - carriedTimeRef.current;

    const interval = window.setInterval(() => {
      if (startTimeRef.current === null) {
        return;
      }

      const nextElapsed = performance.now() - startTimeRef.current;
      carriedTimeRef.current = nextElapsed;
      setElapsedMs(nextElapsed);
    }, 16);

    return () => {
      window.clearInterval(interval);
    };
  }, [isRunning]);

  useEffect(() => {
    let isCancelled = false;

    const loadUser = async () => {
      const token = window.localStorage.getItem("token");

      if (!token) {
        if (!isCancelled) {
          setIsSignedIn(false);
          setUsername(null);
        }
        return;
      }

      if (!isCancelled) {
        setIsSignedIn(true);
      }

      try {
        const response = await fetch("http://localhost:4000/", {
          headers: {
            Authorization: token,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          if (!isCancelled) {
            setIsSignedIn(false);
            setUsername(null);
          }
          return;
        }

        if (isCancelled) {
          return;
        }

        setUsername(typeof data?.username === "string" ? data.username : null);
      } catch {
        if (!isCancelled) {
          setIsSignedIn(false);
          setUsername(null);
        }
      }
    };

    void loadUser();

    return () => {
      isCancelled = true;
    };
  }, []);

  const totalCentiseconds = Math.floor(elapsedMs / 10);
  const time = formatTime(totalCentiseconds);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    carriedTimeRef.current = 0;
    startTimeRef.current = null;
    setElapsedMs(0);
  };

  const handleLogout = () => {
    window.localStorage.removeItem("token");
    setIsSignedIn(false);
    setUsername(null);
  };

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-gray-900 px-6 py-12 text-slate-100">
      <div className="fixed right-6 top-6 z-10 flex flex-wrap justify-end gap-3 sm:right-8 md:right-24 xl:right-32 sm:top-8">
        {isSignedIn ? (
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <>
          <Link href="/signin" className={buttonVariants({ variant: "ghost" })}>
            Sign In
          </Link>
          <Link href="/signup" className={buttonVariants({ variant: "secondary" })}>
            Sign Up
          </Link>
          </>
        )}
      </div>

      <section className="w-full max-w-2xl p-8 sm:p-10">
        <div className="space-y-6 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-yellow-300/80">
            Counter App
          </p>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {username ?? "Simple stopwatch counter."}
            </h1>
            <p className="mx-auto max-w-lg text-base leading-7 text-slate-300">
              Start the timer, pause it at any point, or reset it back to zero.
            </p>
          </div>

          <div className="inline-flex rounded-3xl border border-gray-700 bg-gray-950 px-6 py-5 font-mono text-3xl tracking-[0.18em] text-gray-100 shadow-lg shadow-black/30 sm:text-6xl">
            {time.minutes}:{time.seconds}:{time.centiseconds}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={handleStart} disabled={isRunning}>
              Start
            </Button>
            <Button
              onClick={handlePause}
              disabled={!isRunning}
              variant="secondary"
            >
              Pause
            </Button>
            <Button onClick={handleReset} variant="danger">
              Reset
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
