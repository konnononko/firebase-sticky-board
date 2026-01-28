import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, QueryDocumentSnapshot } from "firebase/firestore";
import type { DocumentData } from "firebase/firestore"

type Note = {
  id: string;
  text: string;
  x: number;
  y: number;
};

export const Board: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const notesRef = collection(db, "boards", "default", "notes");
    const unsubscribe = onSnapshot(notesRef, (snapshot) => {
      setNotes(
        snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          ...doc.data(),
        })) as Note[]
      );
    });
    return unsubscribe;
  }, []);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", background: "#f8f8f8" }}>
      {notes.map((note) => (
        <div
          key={note.id}
          style={{
            position: "absolute",
            left: note.x,
            top: note.y,
            minWidth: 120,
            minHeight: 80,
            background: "#fffbe7",
            border: "1px solid #e0c97f",
            borderRadius: 8,
            padding: 8,
            boxShadow: "2px 2px 8px #0001",
            userSelect: "none",
            color: "#222",
          }}
        >
          {note.text}
        </div>
      ))}
    </div>
  );
};
