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
      {/* Tinted app canvas (§4.8 figure/ground): a full-bleed Mist surface so
          the Paper cards inside read as figures ON a ground, not white-on-white.
          Neutral Mist here keeps Ocean-tint reserved for structural/interactive
          fills (header bands, row hover). Nav + footer are chrome, left on Paper. */}
      <div className="flex-1 bg-mist">
        <main className={`mx-auto w-full ${maxWidth} px-6 py-10`}>
          {children}
        </main>
      </div>
      <Footer />
    </TooltipProvider>
  );
}
