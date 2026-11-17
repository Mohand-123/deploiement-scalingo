import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Page introuvable</h1>
      <p>
        <Link to="/">← Retour à l'accueil</Link>
      </p>
    </main>
  );
}
