"use client";

import { useActionState } from "react";
import { login, signup, type AuthState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/app/footer";
import { PANEL } from "@/app/panel-title";

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

  // Pre-auth page: no NavBar (user isn't logged in), but the shared Footer pins
  // to the bottom for consistency. min-h-screen flex column → centered content
  // in the flex-1 region, Footer below.
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Branding: the grid mark (brand signature device, DESIGN §4) above
              the product name — the wordmark is spelled by the heading, so the
              mark alone avoids doubling "EDON". */}
          <div className="flex flex-col items-center text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/EDON_gridmark_navy.svg"
              alt=""
              className="size-20"
            />
            <h1 className="mt-4 text-xl font-semibold tracking-tight text-ink">
              EDON ERP
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Log in or create an account to continue.
            </p>
          </div>

          <Card className={`mt-10 ${PANEL}`}>
            <CardContent>
              <form className="space-y-4">
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
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
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

                {error ? (
                  <p className="text-sm text-destructive">{error}</p>
                ) : null}
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
