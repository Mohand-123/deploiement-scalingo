import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHealth } from "../api";

export default function Home() {
  const [apiStatus, setApiStatus] = useState<"chargement" | "ok" | "erreur">(
    "chargement",
  );

  useEffect(() => {
    getHealth()
      .then(() => setApiStatus("ok"))
      .catch(() => setApiStatus("erreur"));
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>TP Déploiement Scalingo</h1>
      <p>
        Statut de l'API : <strong>{apiStatus}</strong>
      </p>
      <p>
        <Link to="/notes">Aller aux notes →</Link>
      </p>
    </main>
  );
}
