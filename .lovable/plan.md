# Privatnost profila i treninga (bez admin zaobilaženja)

## Važna napomena pre svega

Polje `profiles.workouts_public` **ne postoji** u bazi — trenutne kolone su: `id`, `name`, `email`, `created_at`, `username`. Nema ga ni u kodu. Zato ga treba dodati pod tim istim imenom (ne `is_public`), pa ostaje tvoj model. Sve ostalo iz tvog spiska poštujem: `email` ostaje, okidač za nove naloge se ne dira.

## Šta se menja

1. Novo polje `workouts_public` (da/ne, **podrazumevano „ne" — svi su privatni**) u tabeli profila; svi postojeći nalozi se postavljaju na privatno.
2. Pravila pristupa u bazi dobijaju uslov: svoje uvek, tuđe samo ako je vežbač javan.
3. Stranica „Vežbači" i tuđi treninzi se učitavaju preko prijavljenog korisnika, bez povlašćenog ključa.
4. Na stranici Profil dodaje se prekidač „Moji treninzi su javni".

## Email adrese

`email` ostaje u tabeli. Da tuđa adresa ne bi bila dostupna, čitanje te jedne kolone se uskraćuje kroz aplikaciju (podatak ostaje u bazi), a sopstvena adresa se prikazuje iz naloga za prijavu.

## SQL (za postojeću bazu, još nije izvršeno)

```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS workouts_public boolean NOT NULL DEFAULT true;

-- odmah: novi nalozi su privatni, i svi postojeći se postavljaju na privatno
ALTER TABLE public.profiles ALTER COLUMN workouts_public SET DEFAULT false;
UPDATE public.profiles SET workouts_public = false;

-- pomoćna funkcija (bez rekurzije u pravilima)
CREATE OR REPLACE FUNCTION public.is_profile_public(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles p
                 WHERE p.id = _user_id AND p.workouts_public);
$$;
REVOKE EXECUTE ON FUNCTION public.is_profile_public(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_profile_public(uuid) TO authenticated;

DROP POLICY IF EXISTS "Korisnik vidi svoj profil" ON public.profiles;
CREATE POLICY "Vidljiv sopstveni i javni profil" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR workouts_public);

DROP POLICY IF EXISTS "Korisnik vidi svoje treninge" ON public.workouts;
CREATE POLICY "Vidljivi sopstveni i javni treninzi" ON public.workouts
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_profile_public(user_id));

DROP POLICY IF EXISTS "Korisnik vidi serije svojih treninga" ON public.workout_sets;
CREATE POLICY "Vidljive serije vidljivih treninga" ON public.workout_sets
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.workouts w
                 WHERE w.id = workout_sets.workout_id
                   AND (w.user_id = auth.uid() OR public.is_profile_public(w.user_id))));

DROP POLICY IF EXISTS "Vidljive predefinisane i sopstvene vezbe" ON public.exercises;
CREATE POLICY "Vidljive predefinisane, sopstvene i javne vezbe" ON public.exercises
  FOR SELECT TO authenticated
  USING (is_custom = false OR auth.uid() = user_id OR public.is_profile_public(user_id));

-- zaštita email adresa: tuđi email nije dostupan kroz aplikaciju
REVOKE SELECT ON public.profiles FROM authenticated;
GRANT SELECT (id, name, username, created_at, workouts_public) ON public.profiles TO authenticated;
GRANT UPDATE (name, username, workouts_public) ON public.profiles TO authenticated;
```

## Promene u kodu (minimalne)

- `src/lib/public-data.functions.ts`: sva četiri poziva prelaze sa povlašćenog klijenta na `context.supabase` (klijent prijavljenog korisnika), pa pravila baze stvarno važe. Uklanja se `import("@/integrations/supabase/client.server")`.
- `src/lib/trenlog-store.tsx`: tip profila dobija `workouts_public`; sopstveni profil se čita bez kolone `email` (adresa se uzima iz naloga za prijavu); `updateProfile` prima i vrednost prekidača umesto email-a.
- `src/routes/profil.tsx`: polje „Email" postaje samo za prikaz (iz naloga), dodaje se prekidač „Moji treninzi su javni".
- `src/lib/auth.functions.ts` ostaje nepromenjen (povlašćeni klijent tamo služi samo prijavi korisničkim imenom, ne čitanju tuđih podataka).

## Provera posle primene

Registracija dva naloga, jedan postavljen na privatno: privatni se ne pojavljuje u tuđem pregledu, javni se vidi sa treninzima; sopstveni podaci uvek vidljivi; bez grešaka u konzoli.
