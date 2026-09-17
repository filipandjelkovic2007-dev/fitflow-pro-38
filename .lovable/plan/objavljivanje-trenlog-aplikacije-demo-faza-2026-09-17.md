# Objavljivanje TrenLog aplikacije (demo faza)

## Kontekst
Aplikacija je u demo fazi — namenjena samo korišćenju uz mali broj demo korisnika, pa email potvrda pri registraciji ostaje isključena — registracija odmah prijavljuje korisnika. Bezbednosno skeniranje je prošlo bez nalaza, anonimni nalozi su isključeni, a lozinke se proveravaju protiv poznatih curenja.

## Koraci

1. **Provera stanja pre objavljivanja**
   - Pročitati rezultate poslednjeg bezbednosnog skeniranja (prošlo je bez nalaza — samo potvrditi da nema novih kritičnih nalaza).
   - Proveriti da li build prolazi bez grešaka.

2. **Objavljivanje**
   - Zatražiti objavljivanje aplikacije (deploy) — dostupna će biti javna TrenLog adresa.
   - deployment obično traje oko minut.

3. **Obaveštenje nakon objavljivanja**
   - Preneti javni link aplikacije.
   - Podsetiti da se Lovable adresa može preimenovati i da se pravi domen (npr. trenlog.rs) može povezati u podešavanjima projekta kad dođe pravo lansiranje.
   - Podsetiti da se email potvrda može uključiti kasnije, jednim klikom, pre nego što aplikaciju dobiju pravi korisnici.

## Šta se NE menja
- Ništa u kodu, bazi ili podešavanjima autentifikacije — email potvrda ostaje isključena za demo fazu.
