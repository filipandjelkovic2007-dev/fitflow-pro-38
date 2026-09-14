import { createFileRoute } from "@tanstack/react-router";

import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/registracija")({
  head: () => ({
    meta: [
      { title: "Registracija — FitLog" },
      {
        name: "description",
        content: "Napravi FitLog nalog i počni da beležiš treninge i napredak.",
      },
      { property: "og:title", content: "Registracija — FitLog" },
      {
        property: "og:description",
        content: "Napravi FitLog nalog i počni da beležiš treninge i napredak.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <AuthForm mode="register" />,
});
