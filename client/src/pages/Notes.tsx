import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { createNote, listNotes, type Note } from "../api";

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    listNotes()
      .then(setNotes)
      .catch(() => setError("Impossible de charger les notes depuis l'API."));
  }

  useEffect(refresh, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;
    try {
      await createNote(content.trim());
      setContent("");
      setError(null);
      refresh();
    } catch {
      setError("Impossible d'enregistrer la note.");
    }
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <p>
        <Link to="/">← Accueil</Link>
      </p>
      <h1>Notes</h1>
      <p>
        Sert à vérifier le parcours complet : une écriture (POST) puis une
        lecture (GET) en base, via l'API déployée.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Nouvelle note"
        />
        <button type="submit">Ajouter</button>
      </form>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <ul>
        {notes.map((note) => (
          <li key={note.id}>{note.content}</li>
        ))}
      </ul>
    </main>
  );
}
