# TrenLog Progress

Kreiraj kompletnu web aplikaciju za evidenciju treninga prema sledećim detaljnim specifikacijama:

1. Naziv aplikacije

Aplikacija se zove "TrenLog".

2. Cilj aplikacije

Glavni cilj aplikacije je da omogući korisnicima lako, brzo i pregledno praćenje sportskih treninga, istorije podignutih težina i napretka kroz vreme, kako bi ostali motivisani i imali jasan uvid u svoj fitnes razvoj.

3. Tipovi korisnika

Neregistrovani korisnik: Može da vidi samo početnu (Landing) stranicu sa marketinškim tekstom i opcijama za prijavu/registraciju.

Registrovani korisnik (Vežbač): Ima pristup svim funkcionalnostima za unos, izmenu i pregled sopstvenih treninga i statistike.

4. Glavne stranice (Layout & Pages)

Landing stranica (Početna): Čist dizajn sa "Hero" sekcijom, kratkim opisom prednosti aplikacije i uočljivim dugmadima "Registruj se" i "Prijavi se".

Dashboard (Kontrolna tabla): Centralno mesto nakon prijave. Prikazuje brzu statistiku (broj treninga ove nedelje, ukupan volumen, poslednji trening) i dugme "Započni novi trening".

Stranica za unos treninga: Dinamička forma gde korisnik bira vežbe, unosi broj serija, ponavljanja i težinu za svaku seriju.

Istorija treninga: Hronološki prikaz svih završenih treninga sa mogućnošću filtriranja po datumu ili tipu treninga.

Profil i Statistika: Grafikoni napretka (npr. grafik linije za rast snage na ključnim vežbama) i osnovna podešavanja profila korisnika.

5. Glavne funkcionalnosti

Autentifikacija: Registracija i prijava korisnika (putem email-a i lozinke).

Kreiranje treninga: Korisnik može da izabere predefinisane vežbe (ili doda svoju), unese težinu (kg) i broj ponavljanja za svaku seriju (Set). Moguće je dodati više vežbi u jedan trening.

Tajmer za pauzu: Integrisani štoperica/tajmer unutar stranice za trening koji odbrojava vreme odmora između serija (npr. 60 ili 90 sekundi).

Istorija i brisanje: Pregled detalja svakog starog treninga uz mogućnost brisanja pogrešno unetog treninga.

Interaktivni grafikoni: Prikaz napretka za odabranu vežbu kroz vreme pomoću grafikona.

6. Struktura podataka (Baza podataka)

U bazi je potrebno čuvati sledeće entitete i polja:

Users (Korisnici): id, name, email, password_hash, created_at.

Exercises (Vežbe): id, name (npr. Čučanj, Benč pres), category (npr. Grudi, Noge), is_custom (da li je korisnik sam kreirao).

Workouts (Trening sesije): id, user_id, workout_name (npr. "Trening A - Noge"), date, duration_minutes.

Workout_Sets (Serije unutar treninga): id, workout_id, exercise_id, set_number (1, 2, 3...), weight_kg, reps.

7. Izgled i stil korisničkog interfejsa (UI/UX)

Tema: Moderan, čist i sportski "Dark Mode" (tamna tema) kao primarni izgled.

Paleta boja: Pozadina u tamno sivoj/crnoj boji (#121212), tekst u beloj i svetlo sivoj. Akcentna boja koja se koristi za dugmad, tajmer i važne elemente treba da bude neonsko zelena (#CCFF00) ili svetlo plava (#00E5FF) kako bi asocirala na energiju i fitnes.

Komponente: Zaobljene ivice na karticama (Cards), jasan kontrast, moderni i čitljivi bezserifni fontovi (npr. Inter ili Roboto).

Prilagodljivost: Interfejs mora biti potpuno "Mobile-first" (responzivan), jer će korisnici aplikaciju primarno koristiti na mobilnim telefonima dok su u teretani.

Molim te generiši funkcionalan prototip sa funkcionalnim UI komponentama, mock podacima i navigacijom između ovih stranica.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4fc9a6cc-3e6c-49c6-999e-488a508860b8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
