"use client";
import Image from "next/image";


import { useState } from "react";
import { authClient } from "@/lib/auth-client";




export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { data: session, isPending, error } = authClient.useSession();


  const signUp = async (e: any) => {
    e.preventDefault();
    const { data, error } = await authClient.signUp.email({
        name: "John Doe", // required
        email: email, // required
        password: password, // required
        image: "https://example.com/image.png",
        callbackURL: "http://localhost:3000/",
    });
    console.log({ data, error });
  }

  const signInEmail = async (e: any) => {
    e.preventDefault();
    const { data, error } = await authClient.signIn.email({
        email: email, // required
        password: password, // required
        callbackURL: "http://localhost:3000/",
    });
    console.log({ data, error });
  }

  const signIn = async () => {
    const data = await authClient.signIn.social({
      provider: "google",
    });
  };

  if (session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
          <h1 className="text-2xl font-bold mb-4">Welcome, {session.user?.email}</h1>
          <button
            onClick={async () => {
              await authClient.signOut();
            }}
            className="mt-8 px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Sign Out
          </button>
        </main>
      </div>
    );
  }



  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <form action="" onSubmit={signUp} className="flex flex-col gap-4 w-full max-w-sm">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="example@example.com"
            onChange={(e) => setEmail(e.target.value)}
            />
          
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="password"
            onChange={(e) => setPassword(e.target.value)}
            />

          <button type="submit">
            SignUp
          </button>
          <button onClick={signInEmail} type="button">
            SignIn
          </button>

        </form>
        <button onClick={signIn} className="mt-8 px-4 py-2 bg-blue-600 text-white rounded-lg">
          Sign in with Google
        </button>

        {isPending && <p>Loading...</p>}
        {/* {error && <p>{error}</p>} */}
        {/* {data && <p>{data}</p>} */}
      </main>
    </div>
  );
}
