import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">
        Consultant&apos;s Client Portal
      </h1>
      <p className="text-muted-foreground">Project status, at a glance</p>
      <Button>Get started</Button>
    </div>
  );
}
