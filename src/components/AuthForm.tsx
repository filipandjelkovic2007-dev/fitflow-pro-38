import { Link, useNavigate } from "@tanstack/react-router";
import { Dumbbell } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTrenLog } from "@/lib/fitlog-store";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, register, user, ready } = useTrenLog();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Ako je korisnik već prijavljen, vodi ga na kontrolnu tablu
  useEffect(() => {
    if (ready && user) navigate({ to: "/dashboard", replace: true });
  }, [ready, user, navigate]);

  const isRegister = mode === "register";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.includes("@") || password.length < 6) {
      setError("Unesi ispravan email i lozinku od bar 6 karaktera.");
      return;
    }
    setLoading(true);
    const message = isRegister
      ? await register(email.trim(), password, name.trim())
      : await login(email.trim(), password);
    setLoading(false);
    if (message) {
      setError(message);
      return;
    }
    navigate({ to: "/dashboard", replace: true });
  }

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

        <form className="mt-6 space-y-4" onSubmit={submit}>
          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="name">Ime</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Marko Marković"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ti@primer.com"
            />
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
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
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
