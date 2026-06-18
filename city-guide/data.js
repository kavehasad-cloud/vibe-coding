// The single source of truth for all place data in the Milan pocket guide.
// eat.html, see.html, drink.html and aperitivo.html read from this object — no page hardcodes its own list.
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
  drink: [
    { name: "Bar Basso", desc: "Birthplace of the Negroni Sbagliato — order one in its oversized glass." },
    { name: "Camparino in Galleria", desc: "Historic Belle Époque bar for a classic Campari spritz by the Duomo." },
    { name: "Terrazza Aperol", desc: "Aperol's flagship terrace on Piazza del Duomo for a sunset spritz." },
    { name: "Mag Café", desc: "Navigli cocktail spot with vintage decor and inventive mixed drinks." },
    { name: "Dry Milano", desc: "Sleek bar pairing serious cocktails with gourmet pizza." },
  ],
  aperitivo: [
    { name: "Rita & Cocktails", desc: "Navigli institution famed for its generous early-evening aperitivo spread." },
    { name: "Living", desc: "Piazza Sempione spot known for a lavish buffet that comes with your drink." },
    { name: "Pandenus", desc: "Neighbourhood café-bistro with a popular, food-laden aperitivo hour." },
    { name: "Frida", desc: "Isola courtyard bar serving a classic, budget-friendly aperitivo with snacks." },
    { name: "Le Biciclette", desc: "Art-bar near Sant'Ambrogio with a long-running aperitivo buffet." },
    { name: "Luca e Andrea", desc: "Canalside Navigli bar with a plentiful spread to go with your spritz." },
  ],
};
