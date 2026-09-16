import { Link, useNavigate } from "@tanstack/react-router";
import { Dumbbell } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTrenLog } from "@/lib/fitlog-store";

// Poruke o greškama po pojedinačnom polju
type FieldErrors = {
  name?: string;
  username?: string;
  identifier?: string;
  password?: string;
};

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, register, user, ready } = useTrenLog();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  // Ako je korisnik već prijavljen, vodi ga na kontrolnu tablu
  useEffect(() => {
    if (ready && user) navigate({ to: "/dashboard", replace: true });
  }, [ready, user, navigate]);

  const isRegister = mode === "register";

  // Sprečava podrazumevano slanje forme (osvežavanje stranice)
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    void submit();
  }

  // Proverava samo ona polja koja nisu ispravno popunjena
  function validate(): FieldErrors {
    const next: FieldErrors = {};

    if (isRegister) {
      if (!name.trim()) next.name = "Unesi ime i prezime.";
      else if (name.trim().split(/\s+/).filter(Boolean).length < 2)
        next.name = "Unesi i ime i prezime.";

      if (!username.trim()) next.username = "Unesi korisničko ime.";
      else if (!/^[a-zA-Z0-9_.]{3,20}$/.test(username.trim()))
        next.username = "Korisničko ime: 3–20 znakova (slova, brojevi, _ ili .).";

      if (!identifier.trim()) next.identifier = "Unesi email adresu.";
      else if (!identifier.includes("@")) next.identifier = "Email adresa nije ispravna.";
    } else {
      if (!identifier.trim()) next.identifier = "Unesi email ili korisničko ime.";
    }

    if (!password) next.password = "Unesi lozinku.";
    else if (password.length < 6) next.password = "Lozinka mora imati bar 6 karaktera.";

    return next;
  }

  async function submit() {
    setFormError("");
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    const message = isRegister
      ? await register(identifier.trim(), password, name.trim(), username.trim())
      : await login(identifier.trim(), password);
    setLoading(false);
    if (message) {
      setFormError(message);
      return;
    }
    navigate({ to: "/dashboard", replace: true });
  }

  // Jedinstven prikaz crvene poruke ispod polja
  const fieldError = (key: keyof FieldErrors) =>
    errors[key] ? <p className="text-sm text-destructive">{errors[key]}</p> : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link to="/" className="mb-8 flex items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Dumbbell className="h-5 w-5" />
        </span>
        <span className="text-xl font-extrabold tracking-tight">TrenLog</span>
      </Link>

      <div className="surface-card w-full max-w-sm p-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {isRegister ? "Kreiraj nalog" : "Dobrodošao nazad"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isRegister
            ? "Par sekundi i spreman si za prvi trening."
            : "Prijavi se i nastavi tamo gde si stao."}
        </p>

        <form className="mt-6 space-y-4" noValidate onSubmit={onSubmit}>
          {isRegister && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Ime i prezime</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Marko Marković"
                  aria-invalid={Boolean(errors.name)}
                />
                {fieldError("name")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Korisničko ime</Label>
                <Input
                  id="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="marko_m"
                  aria-invalid={Boolean(errors.username)}
                />
                {fieldError("username") ?? (
                  <p className="text-xs text-muted-foreground">
                    Mora biti jedinstveno — ne može se ponavljati kod drugih vežbača.
                  </p>
                )}
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="identifier">{isRegister ? "Email" : "Email ili korisničko ime"}</Label>
            <Input
              id="identifier"
              type="text"
              autoComplete={isRegister ? "email" : "username"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={isRegister ? "ti@primer.com" : "ti@primer.com ili marko_m"}
              aria-invalid={Boolean(errors.identifier)}
            />
            {fieldError("identifier")}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Lozinka</Label>
            <Input
              id="password"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              aria-invalid={Boolean(errors.password)}
            />
            {fieldError("password")}
          </div>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <Button type="submit" disabled={loading} className="w-full rounded-full font-bold">
            {loading ? "Sačekaj…" : isRegister ? "Registruj se" : "Prijavi se"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {isRegister ? (
            <>
              Već imaš nalog?{" "}
              <Link to="/prijava" className="font-semibold text-primary">
                Prijavi se
              </Link>
            </>
          ) : (
            <>
              Nemaš nalog?{" "}
              <Link to="/registracija" className="font-semibold text-primary">
                Registruj se
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
