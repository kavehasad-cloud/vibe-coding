"use client";

import { useActionState } from "react";
import { login, signup, type AuthState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AuthState = {};

export default function LoginPage() {
  const [loginState, loginAction, loginPending] = useActionState(
    login,
    initialState
  );
  const [signupState, signupAction, signupPending] = useActionState(
    signup,
    initialState
  );

  const error = loginState.error ?? signupState.error;
  const pending = loginPending || signupPending;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Client Portal</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Log in or create an account to continue.
      </p>

      <form className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input id="password" name="password" type="password" required />
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            formAction={loginAction}
            disabled={pending}
            className="flex-1"
          >
            {loginPending ? "Logging in…" : "Log in"}
          </Button>
          <Button
            type="submit"
            formAction={signupAction}
            disabled={pending}
            variant="outline"
            className="flex-1"
          >
            {signupPending ? "Signing up…" : "Sign up"}
          </Button>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </form>
    </main>
  );
}
