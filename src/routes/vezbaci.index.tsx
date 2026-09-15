import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { fetchProfiles, formatDate, type Profile } from "@/lib/fitlog-store";

export const Route = createFileRoute("/vezbaci/")({
  head: () => ({
    meta: [
      { title: "Vežbači — TrenLog" },
      { name: "description", content: "Spisak svih vežbača koji beleže treninge u TrenLog-u." },
      { property: "og:title", content: "Vežbači — TrenLog" },
      {
        property: "og:description",
        content: "Spisak svih vežbača koji beleže treninge u TrenLog-u.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell>
      <UsersPage />
    </AppShell>
  ),
});

function UsersPage() {
  const [profiles, setProfiles] = useState<Profile[] | null>(null);

  // Učitava spisak vežbača iz baze
  useEffect(() => {
    void fetchProfiles().then(setProfiles);
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Vežbači</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Klikni na ime da vidiš treninge tog vežbača.
        </p>
      </div>

      {profiles === null && <p className="text-sm text-muted-foreground">Učitavanje…</p>}

      {profiles?.length === 0 && (
        <div className="surface-card p-8 text-center text-sm text-muted-foreground">
          Još nema registrovanih vežbača.
        </div>
      )}

      <div className="space-y-3">
        {profiles?.map((p) => (
          <Link
            key={p.id}
            to="/vezbaci/$id"
            params={{ id: p.id }}
            className="surface-card grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-4 transition-colors hover:border-primary/50"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary">
              <Users className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-bold">{p.name}</span>
              <span className="block truncate text-xs text-muted-foreground">
                @{p.username} · Član od {formatDate(p.created_at)}
              </span>
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
