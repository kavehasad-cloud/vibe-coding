// The single source of truth for all place data in the Milan pocket guide.
// Both eat.html and see.html read from this object — no page hardcodes its own list.
// Each place is just a name and a one-line description.
const MILAN = {
  eat: [
    { name: "Luini", desc: "Tiny spot near the Duomo famous for panzerotti — fried dough pockets." },
    { name: "Trattoria del Nuovo Macello", desc: "Classic Milanese cooking: risotto giallo and a proper cotoletta." },
    { name: "Pasticceria Marchesi", desc: "Old-world café for an espresso and a pastry before you wander." },
    { name: "Gelateria della Musica", desc: "Neighborhood gelato near the Navigli, made fresh in small batches." },
    { name: "Ratanà", desc: "Modern take on traditional Lombard dishes in a relaxed setting." },
    { name: "Spontini", desc: "Thick, square slices of cheesy Milanese-style pizza, sold to go." },
  ],
  see: [
    { name: "Duomo di Milano", desc: "The vast Gothic cathedral — climb to the rooftop for spire-level views." },
    { name: "Galleria Vittorio Emanuele II", desc: "Glass-roofed 19th-century shopping arcade next to the Duomo." },
    { name: "Santa Maria delle Grazie", desc: "Home of Leonardo's Last Supper — book your timed ticket ahead." },
    { name: "Castello Sforzesco", desc: "Renaissance fortress with museums and a big park behind it." },
    { name: "Navigli", desc: "Canal district lined with bars and workshops — best at sunset." },
    { name: "Pinacoteca di Brera", desc: "Major art gallery in the arty, walkable Brera quarter." },
  ],
};
