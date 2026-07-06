"use client";

import { CircleUserRound, LogOut } from "lucide-react";
import { useSession } from "@/components/session/SessionProvider";
import { logout } from "@/app/login/actions";
import styles from "@/components/Topbar.module.css";

export function UserMenu() {
  const { username } = useSession();

  return (
    <>
      <div className={styles.user}>
        <CircleUserRound size={22} />
        <span className={styles.userName}>{username ?? "Invitado"}</span>
      </div>
      <form action={logout}>
        <button type="submit" className={styles.logoutButton} title="Cerrar sesión">
          <LogOut size={18} />
        </button>
      </form>
    </>
  );
}
