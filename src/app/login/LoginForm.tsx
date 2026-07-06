"use client";

import { useActionState } from "react";
import { Lock, User } from "lucide-react";
import { login, type LoginState } from "./actions";
import styles from "./login.module.css";

const initialState: LoginState = {};

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form className={styles.card} action={formAction}>
      <h2 className={styles.title}>Iniciar sesión</h2>
      <p className={styles.subtitle}>Ingresá tus credenciales para acceder al panel</p>

      <input type="hidden" name="next" value={next} />

      <label className={styles.label} htmlFor="username">
        Usuario
      </label>
      <div className={styles.inputWrapper}>
        <User size={16} className={styles.inputIcon} />
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          autoFocus
          required
          className={styles.input}
        />
      </div>

      <label className={styles.label} htmlFor="password">
        Contraseña
      </label>
      <div className={styles.inputWrapper}>
        <Lock size={16} className={styles.inputIcon} />
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={styles.input}
        />
      </div>

      {state.error && <p className={styles.error}>{state.error}</p>}

      <button type="submit" disabled={pending} className={styles.button}>
        {pending ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
