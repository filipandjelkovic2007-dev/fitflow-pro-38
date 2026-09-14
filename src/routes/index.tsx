import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Dumbbell, LineChart, Timer } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FitLog — Evidencija treninga i napretka u teretani" },
      {
        name: "description",
        content:
          "FitLog je jednostavna aplikacija za evidenciju treninga: beleži serije, težine i ponavljanja i prati napredak kroz grafikone.",
      },
      { property: "og:title", content: "FitLog — Evidencija treninga i napretka" },
      {
        property: "og:description",
        content: "Beleži serije, težine i ponavljanja. Prati napredak i ostani motivisan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Dumbbell,
    title: "Brz unos treninga",
    text: "Dodaj vežbe, serije, kilažu i ponavljanja u par dodira — dok si još u teretani.",
  },
  {
    icon: Timer,
    title: "Tajmer za pauzu",
    text: "Ugrađeni odbrojavač od 60 ili 90 sekundi drži tvoj tempo između serija.",
  },
  {
    icon: LineChart,
    title: "Grafikoni napretka",
    text: "Vidi kako ti snaga raste na ključnim vežbama kroz nedelje i mesece.",
  },
  {
    icon: Activity,
    title: "Kompletna istorija",
    text: "Svaki trening je sačuvan, pretraživ i lako obrisiv ako grešiš u unosu.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Dumbbell className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">FitLog</span>
        </div>
        <Link
          to="/prijava"
          className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          Prijavi se
        </Link>
      </header>

      <section className="mx-auto max-w-5xl px-4 pb-16 pt-8 md:pt-16">
        <p className="mb-4 inline-block rounded-full border border-primary/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
          Tvoj dnevnik snage
        </p>
        <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
          Svaka serija se <span className="text-primary">broji</span>.
          <br />
          Zabeleži je.
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          FitLog pamti tvoje težine, ponavljanja i volumen treninga, pa ti tačno pokazuje
          koliko si jači nego prošlog meseca.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/registracija"
            className="glow-neon inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 text-base font-bold text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            Registruj se
          </Link>
          <Link
            to="/prijava"
            className="inline-flex items-center justify-center rounded-full border border-border px-7 py-3 text-base font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Prijavi se
          </Link>
        </div>

        <dl className="mt-14 grid grid-cols-3 gap-3">
          {[
            ["12k+", "unetih serija"],
            ["98%", "vraća se nedeljno"],
            ["3 min", "prosečan unos"],
          ].map(([v, l]) => (
            <div key={l} className="surface-card p-4">
              <dt className="text-2xl font-black text-primary sm:text-3xl">{v}</dt>
              <dd className="mt-1 text-xs text-muted-foreground sm:text-sm">{l}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-20">
        <h2 className="text-2xl font-bold tracking-tight">Zašto FitLog</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="surface-card p-5">
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        FitLog — prototip aplikacije za evidenciju treninga.
      </footer>
    </div>
  );
}
