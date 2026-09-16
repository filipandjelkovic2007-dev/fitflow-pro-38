import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Prijava email-om ILI korisničkim imenom.
// Pretraga naloga se radi na serveru i tek uz ispravnu lozinku vraća sesiju,
// tako da se email adrese drugih korisnika nikada ne izlažu javno.
export const signInWithIdentifier = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({ identifier: z.string().min(1), password: z.string().min(1) })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const identifier = data.identifier.trim();
    let email = identifier;

    if (!identifier.includes("@")) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .ilike("username", identifier)
        .maybeSingle();
      if (!profile) return { error: "Pogrešno korisničko ime ili lozinka." as string, session: null };
      const { data: found } = await supabaseAdmin.auth.admin.getUserById(profile.id);
      if (!found?.user?.email) {
        return { error: "Pogrešno korisničko ime ili lozinka." as string, session: null };
      }
      email = found.user.email;
    }

    // Prijava se radi običnim (javnim) ključem, kao i iz pregledača
    const publicClient = createClient(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_PUBLISHABLE_KEY"]!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const { data: signed, error } = await publicClient.auth.signInWithPassword({
      email,
      password: data.password,
    });
    if (error || !signed.session) {
      return { error: "Pogrešni podaci za prijavu." as string, session: null };
    }
    return {
      error: null as string | null,
      session: {
        access_token: signed.session.access_token,
        refresh_token: signed.session.refresh_token,
      },
    };
  });
