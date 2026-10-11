# TrenLog

Aplikacija za evidenciju treninga u teretani: beležiš serije, težine i ponavljanja,
a TrenLog ti pokazuje koliko si jači nego prošlog meseca.

**Status:** demo faza (testiranje korisnika). Javna adresa: https://fitflow-pro-38.lovable.app

## Funkcionalnosti

- **Nalog** — registracija (ime i prezime, korisničko ime, email, lozinka), prijava
  email-adresom **ili** korisničkim imenom, odjava.
- **Jedinstveno korisničko ime** — ne može se ponoviti kod drugog vežbača.
- **Privatnost** — izbor odmah posle registracije i prekidač „Moji treninzi su javni"
  u profilu.
- **Kontrolna tabla** — treninzi ove nedelje, ukupan volumen, poslednji trening i
  dugme „Započni novi trening".
- **Unos treninga** — predefinisane vežbe ili sopstvena vežba, težina i ponavljanja
  za svaku seriju.
- **Tajmer pauze** — odbrojavanje odmora između serija.
- **Istorija** — hronološki prikaz, filter po datumu i po tipu treninga, pregled i
  brisanje treninga.
- **Vežbači** — spisak drugih vežbača sa javnim profilom i pregled njihovih treninga.
- **Profil i statistika** — napredak po vežbi i volumen po treningu (grafikoni).

## Stranice

| Adresa | Sadržaj |
| --- | --- |
| `/` | Početna stranica (za neprijavljene) |
| `/prijava`, `/registracija` | Prijava i registracija |
| `/dashboard` | Kontrolna tabla |
| `/trening` | Unos novog treninga |
| `/istorija` | Istorija treninga |
| `/vezbaci`, `/vezbaci/$id` | Vežbači i pregled pojedinačnog vežbača |
| `/profil` | Profil i statistika |

## Tehnologije

React 19 i TanStack Start (Vite), Tailwind CSS v4, komponente iz shadcn/ui,
Recharts za grafikone, Lovable Cloud za bazu i autentifikaciju.

## Podaci

| Tabela | Polja |
| --- | --- |
| `profiles` | id, name, email, username, created_at, workouts_public |
| `exercises` | id, name, category, is_custom, user_id |
| `workouts` | id, user_id, workout_name, date, duration_minutes |
| `workout_sets` | id, workout_id, exercise_id, set_number, weight_kg, reps |

Predefinisane vežbe (`is_custom = false`) vide svi; sopstvene vežbe prate ista
pravila vidljivosti kao i treninzi.

## Privatnost

- Svako vidi i menja **samo svoje podatke** — pravila pristupa su u bazi, ne u interfejsu.
- `workouts_public` (podrazumevano `false`) odlučuje da li te drugi prijavljeni
  korisnici vide: profil, treninzi, serije i sopstvene vežbe prate tu odluku.
- Email adresa je zaključana u bazi — svoju vidiš u profilu, tuđu nijedan korisnik
  ne može da pročita.
- Spisak vežbača radi preko zaštićenih server funkcija koje vraćaju samo bezbedna polja.

## Kako se radi

Projekat je povezan sa GitHub-om: promene u Lovable editoru automatski se guraju u
repo, a promene gurnute u repo stižu nazad u Lovable. Razvoj ide kroz Lovable
editor — lokalno pokretanje nije potrebno.

## Pre pravog lansiranja

- Uključiti potvrdu email adrese (u demo fazi je isključena).
- Povezati pravi domen i po želji preimenovati Lovable adresu.
- Pokrenuti novu bezbednosnu proveru pre nego što link dobije veći broj testera.
