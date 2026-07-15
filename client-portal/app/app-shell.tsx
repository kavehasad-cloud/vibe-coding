import { NavBar } from "@/app/nav-bar";
import { Footer } from "@/app/footer";
import { TooltipProvider } from "@/components/ui/tooltip";

// Shared authenticated frame: one uniform full-width nav + a constrained
// content column. Every authenticated page wraps its content in this so the
// top bar is truly identical everywhere (DESIGN §4.6).
export function AppShell({
  children,
  maxWidth = "max-w-4xl",
}: {
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <TooltipProvider>
      <NavBar />
      <main className={`mx-auto w-full flex-1 ${maxWidth} px-6 py-10`}>
        {children}
      </main>
      <Footer />
    </TooltipProvider>
  );
}
