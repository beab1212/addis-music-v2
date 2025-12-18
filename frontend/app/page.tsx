"use client";

import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/store/authStore";
import { AuthModal } from "@/components/AuthModal";
import { Toast } from "@/components/Toast";

export default function Home() {
  const { data: session, isPending } = authClient.useSession();
  const { openAuthModal } = useAuthStore();

  const signOut = async () => {
    await authClient.signOut();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100">
      {/* Background */}
      <Toast />
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-linear-to-tr from-orange-500/20 via-rose-500/10 to-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-56 right-1/3 h-[500px] w-[500px] rounded-full bg-linear-to-tr from-indigo-500/10 via-sky-500/10 to-emerald-500/10 blur-3xl" />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-20 backdrop-blur supports-backdrop-filter:bg-white/60 dark:supports-backdrop-filter:bg-black/40 border-b border-black/5 dark:border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/addisMusic.png" alt="Addis Music Logo" className="h-8 w-8 mr-2" />

            <span className="text-lg font-extrabold tracking-tight">
              Addis
              <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-pink-600">
                Music
              </span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="hover:text-orange-600">Features</a>
            <a href="#how" className="hover:text-orange-600">How it works</a>
            <a href="#pricing" className="hover:text-orange-600">Pricing</a>
            <a href="#faq" className="hover:text-orange-600">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            {isPending ? (
              <div className="h-8 w-24 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
            ) : session?.user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                    {session.user.image ? (
                      <img
                        src={session.user.image || 'https://img.freepik.com/premium-vector/person-with-blue-shirt-that-says-name-person_1029948-7040.jpg?semt=ais_hybrid&w=740&q=80'}
                        alt="Avatar"
                        width={32}
                        height={32}
                        className="h-8 w-8 object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-black/10 dark:bg-white/10" />
                    )}
                  </div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    {session.user.email ?? session.user.name ?? "User"}
                  </span>
                </div>
                <Link
                  href="/app"
                  className="rounded-lg border border-black/10 dark:border-white/10 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
                >
                  Open App
                </Link>
                <button
                  onClick={signOut}
                  className="rounded-lg bg-linear-to-r from-orange-600 to-pink-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal("signin")}
                  className="rounded-lg border border-black/10 dark:border-white/10 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal("signup")}
                  className="rounded-lg bg-linear-to-r from-orange-600 to-pink-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
              Stream. Discover. Share.
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-orange-600 to-pink-600">
                Music without limits
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-gray-600 dark:text-gray-300">
              A fast, elegant music experience with smart search, seamless playback, and curated playlists.
              Built for speed and a modern listening flow.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/app"
                className="rounded-xl bg-linear-to-r from-orange-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 hover:opacity-95"
              >
                Start Listening
              </Link>
              <a
                href="#features"
                className="rounded-xl border border-black/10 dark:border-white/10 px-6 py-3 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5"
              >
                See Features
              </a>
            </div>

            <div className="mt-6 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span>No credit card required</span>
              <span>•</span>
              <span>Cancel anytime</span>
              <span>•</span>
              <span>High‑performance player</span>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-4/3 w-full rounded-2xl border border-black/10 dark:border-white/10 bg-linear-to-br from-neutral-100 to-white dark:from-zinc-900 dark:to-zinc-950 p-3 shadow-2xl">
              <div className="h-full w-full rounded-xl border border-black/5 dark:border-white/5 bg-white/90 dark:bg-black/50 backdrop-blur">
                {/* Player mock */}
                <div className="flex h-full flex-col p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="h-4 w-28 rounded bg-black/10 dark:bg-white/10" />
                    <div className="h-6 w-6 rounded bg-linear-to-br from-orange-500 to-pink-600" />
                  </div>
                  <div className="grid grid-cols-[96px,1fr] gap-5">
                    <div className="h-24 w-24 rounded-lg bg-linear-to-br from-orange-500 to-pink-600" />
                    <div className="space-y-3">
                      <div className="h-4 w-40 rounded bg-black/10 dark:bg-white/10" />
                      <div className="h-3 w-64 rounded bg-black/10 dark:bg-white/10" />
                      <div className="h-2.5 w-full rounded bg-black/10 dark:bg-white/10" />
                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-black/10 dark:bg-white/10" />
                        <div className="h-8 w-8 rounded-full bg-black/10 dark:bg-white/10" />
                        <div className="h-8 w-8 rounded-full bg-black/10 dark:bg-white/10" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto grid grid-cols-3 gap-3">
                    <div className="h-10 rounded bg-black/10 dark:bg-white/10" />
                    <div className="h-10 rounded bg-black/10 dark:bg-white/10" />
                    <div className="h-10 rounded bg-black/10 dark:bg-white/10" />
                  </div>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-xl bg-linear-to-tr from-emerald-400/40 to-cyan-400/40 blur-xl" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">Built for Performance</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-300">
            Smooth navigation, low CPU usage, and instant interactions.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Seamless Player", desc: "Persistent playback across pages with low-latency updates." },
            { title: "Smart Search", desc: "Find tracks, artists, albums and tags in milliseconds." },
            { title: "Curated Playlists", desc: "Hand‑picked collections for every mood and moment." },
            { title: "Smart Recommendations", desc: "Personalized suggestions based on your listening habits." },
            { title: "Dark Mode", desc: "Designed to look great on any display and theme." },
            { title: "Mobile First", desc: "Responsive layouts that feel native on phones." },
          ].map((f, i) => (
            <div key={i} className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 p-6 shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-linear-to-br from-orange-500 to-pink-600" />
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { step: "1", title: "Browse", desc: "Explore trending tracks, artists, and albums." },
            { step: "2", title: "Play", desc: "Start the player and keep listening while you navigate." },
            { step: "3", title: "Collect", desc: "Build and share playlists you love." },
          ].map((s) => (
            <div key={s.step} className="rounded-2xl border border-black/10 dark:border-white/10 p-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-r from-orange-600 to-pink-600 text-white font-bold">
                {s.step}
              </span>
              <h4 className="mt-4 text-lg font-semibold">{s.title}</h4>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">Simple pricing</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-300">Start free. Upgrade anytime.</p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { name: "Free", price: "$0", features: ["Unlimited streaming", "Basic playlists", "Light/Dark mode"] },
            { name: "Pro", price: "$6/mo", features: ["Hi‑fi audio", "Advanced search", "Unlimited playlists"] },
            { name: "Team", price: "$12/mo", features: ["Collaborative playlists", "Admin tools", "Priority support"] },
          ].map((p, i) => (
            <div key={i} className="rounded-2xl border border-black/10 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <div className="mt-2 text-3xl font-extrabold">{p.price}</div>
              <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-linear-to-r from-orange-600 to-pink-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/app/premium"
                className="mt-6 inline-block w-full rounded-lg bg-linear-to-r from-orange-600 to-pink-600 px-4 py-2 text-center text-sm font-semibold text-white hover:opacity-90"
              >
                Choose {p.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold">Frequently asked questions</h2>
        <div className="mx-auto mt-8 divide-y divide-black/5 dark:divide-white/10 rounded-2xl border border-black/10 dark:border-white/10">
          {[
            { q: "Will playback stop when I navigate?", a: "No. The player persists across pages so music keeps playing." },
            { q: "Is there a free plan?", a: "Yes. Get started for free and upgrade anytime." },
            { q: "Does it support dark mode?", a: "Yes. The UI adapts automatically to your system theme." },
          ].map((item) => (
            <details key={item.q} className="group open:bg-black/5 dark:open:bg-white/3">
              <summary className="cursor-pointer list-none p-5 text-sm font-medium">
                {item.q}
              </summary>
              <div className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-300">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/5 dark:border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} AddisMusic. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <a href="#" className="hover:text-orange-600">Terms</a>
            <a href="#" className="hover:text-orange-600">Privacy</a>
            <a href="#" className="hover:text-orange-600">Contact</a>
          </div>
        </div>
      </footer>

      {/* Existing Auth Modal (store-driven) */}
      <AuthModal />
    </div>
  );
}
