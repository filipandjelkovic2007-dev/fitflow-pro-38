import { createFileRoute } from "@tanstack/react-router";

import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/prijava")({
  head: () => ({
    meta: [
      { title: "Prijava — TrenLog" },
      { name: "description", content: "Prijavi se na TrenLog i nastavi evidenciju treninga." },
      { property: "og:title", content: "Prijava — TrenLog" },
      { property: "og:description", content: "Prijavi se na TrenLog i nastavi evidenciju treninga." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <AuthForm mode="login" />,
});
