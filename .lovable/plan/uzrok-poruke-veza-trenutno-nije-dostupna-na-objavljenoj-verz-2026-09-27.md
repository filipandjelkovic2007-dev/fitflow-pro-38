# Uzrok poruke „Veza trenutno nije dostupna" na objavljenoj verziji

## Gde se poruka generiše
`src/routes/__root.tsx`
- linije 18-20: `hasBrowserDatabaseConfig` = da li su `VITE_SUPABASE_URL` i `VITE_SUPABASE_PUBLISHABLE_KEY` ugrađeni u build (`import.meta.env`).
- linije 22-37: komponenta `ConnectionUnavailable` (tekst poruke).
- linije 150-152: `if (typeof window !== "undefined" && !hasBrowserDatabaseConfig) return <ConnectionUnavailable />`.

## Zašto se aktivira samo na objavljenom URL-u
`VITE_*` vrednosti se upisuju u JS **u trenutku build-a**, ne pri učitavanju stranice. Provera objavljenog sajta (fitflow-pro-38.lovable.app, fajl `/assets/index-BFTg-4uw.js`):
- sadrži tekst „Veza trenutno…" (dakle nova zaštita je objavljena),
- **ne sadrži** adresu baze projekta (`zcoddmpabmvthcugfljs`) — nijedan asset.

Znači objavljeni build je napravljen bez podešavanja veze sa bazom, pa je `hasBrowserDatabaseConfig = false` i zaštita (dodata prošli put da spreči prazan ekran) prikazuje poruku. Preview se gradi iz lokalnog `.env` koji ima obe vrednosti, pa tamo radi. Kod, backend i baza su ispravni — problem je isključivo u sadržaju objavljenog build-a (isti uzrok kao ranija greška „Missing Supabase environment variable(s)").

## Predlog popravke (bez izmena UI-ja i koda)
1. Ponovo objaviti aplikaciju (Publish → Update) kako bi se napravio svež build sa podešavanjima veze.
2. Posle objave proveriti da objavljeni JS sadrži adresu baze i da se početna stranica učitava bez poruke.
3. Samo ako i novi build ostane bez vrednosti: kao rezervu, u `src/integrations/...` se NE dira; umesto toga razmotriti fiksni fallback javnih (publishable) vrednosti u `vite.config.ts` preko `define` — to su javni ključevi, bezbedni za klijent. Ovaj korak ide tek uz tvoje odobrenje.
