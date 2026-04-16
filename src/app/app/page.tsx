import { redirect } from "next/navigation";

export default function AppRoot() {
  // MVP frontend-first : auth simulée. Redirige vers dashboard.
  // TODO backend : vérifier session et rediriger vers /app/login si non connecté.
  redirect("/app/dashboard");
}
