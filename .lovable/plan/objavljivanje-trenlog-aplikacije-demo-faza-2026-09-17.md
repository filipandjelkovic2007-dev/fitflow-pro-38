# Objavljivanje TrenLog aplikacije (demo faza)

## Kontekst

Aplikacija je namenjena demo fazi. Pre objavljivanja potrebno je proveriti aktuelna Supabase Auth podešavanja i potvrditi da odgovaraju ovoj fazi. Ovaj dokument predstavlja plan objavljivanja i ne predstavlja dokaz trenutnog stanja podešavanja.

## Koraci

### 1. Provera stanja pre objavljivanja

* Pregledati rezultat poslednjeg bezbednosnog skeniranja i proveriti da nema novih kritičnih nalaza.
* U Supabase Dashboard-u proveriti da je **Allow anonymous sign-ins** isključen.
* Proveriti podešavanja zaštite od kompromitovanih lozinki.
* Proveriti politiku potvrde email adrese i potvrditi da odgovara planiranoj demo fazi.
* Proveriti da aplikacija prolazi build bez grešaka.
* Proveriti da frontend ne sadrži niti izlaže tajne serverske vrednosti, uključujući Supabase `service_role` ključ.

### 2. Objavljivanje

* Pokrenuti deploy aplikacije kroz predviđeni hosting/deployment mehanizam.
* Nakon uspešnog deploy-a proveriti da je javna TrenLog adresa dostupna.
* Osnovno proveriti registraciju, prijavu i ključne funkcije aplikacije na objavljenoj verziji.

### 3. Obaveštenje nakon objavljivanja

* Preneti javni link aplikacije.
* Napomenuti da se deployment adresa može naknadno prilagoditi u skladu sa mogućnostima izabranog hosting rešenja.
* Za pravo lansiranje može se povezati sopstveni domen, ukoliko bude potreban.
* Pre korišćenja aplikacije od strane stvarnih korisnika ponovo proveriti i, po potrebi, promeniti politiku potvrde email adrese i ostala Auth podešavanja.

## Šta se NE menja bez posebne provere

* Ne menjati kod, bazu ili podešavanja autentifikacije samo radi objavljivanja.
* Ne menjati postojeća pravila privatnosti ili RLS politike kao deo samog deploy-a.
* Ne unositi tajne ključeve ili serverske privilegije u frontend konfiguraciju.

Sve promene van samog deployment postupka treba prethodno proveriti i eksplicitno odobriti.

