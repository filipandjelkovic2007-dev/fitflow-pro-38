import { createFileRoute } from "@tanstack/react-router";

import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/registracija")({
  head: () => ({
    meta: [
      { title: "Registracija — TrenLog" },
      {
        name: "description",
        content: "Napravi TrenLog nalog i počni da beležiš treninge i napredak.",
      },
      { property: "og:title", content: "Registracija — TrenLog" },
      {
        property: "og:description",
        content: "Napravi TrenLog nalog i počni da beležiš treninge i napredak.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <AuthForm mode="register" />,
});
