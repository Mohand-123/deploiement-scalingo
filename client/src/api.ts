// L'URL de l'API ne vient jamais d'une valeur en dur (voir le sujet, étape 01) :
// elle est figée au build par Vite depuis VITE_API_URL.
const API_URL = import.meta.env.VITE_API_URL;

export type Note = {
  id: number;
  content: string;
  created_at: string;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, options);
  if (!response.ok) {
    throw new Error(`Erreur API ${response.status} sur ${path}`);
  }
  return response.json() as Promise<T>;
}

export function getHealth() {
  return request<{ status: string }>("/health");
}

export function listNotes() {
  return request<Note[]>("/notes");
}

export function createNote(content: string) {
  return request<Note>("/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
}
