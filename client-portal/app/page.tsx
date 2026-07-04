import { redirect } from "next/navigation";

// The clients list now lives on /dashboard (which manages clients inline and
// enforces its own admin gate). Home just forwards there.
export default function Home() {
  redirect("/dashboard");
}
