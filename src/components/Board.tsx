import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, QueryDocumentSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import type { DocumentData } from "firebase/firestore"

type Note = {
  id: string;
  text: string;
  x: number;
  y: number;
};

export const Board: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [text, setText] = useState("");

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

  const handleAddNote = async () => {
    if (!text.trim()) return;
    const notesRef = collection(db, "boards", "default", "notes");
    await addDoc(notesRef, {
      text,
      x: 60 + Math.random() * 400,
      y: 60 + Math.random() * 300,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setText("");
    setShowInput(false);
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", background: "#f8f8f8" }}>
      <button
        onClick={() => setShowInput(true)}
        style={{ position: "absolute", left: 16, top: 16, zIndex: 2 }}
      >
        付箋追加
      </button>
      {showInput && (
        <div style={{
          position: "absolute", left: 16, top: 56,
          background: "#fff", padding: 8, border: "1px solid #ccc", borderRadius: 6, zIndex: 2
        }}>
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="付箋テキスト"
            style={{ marginRight: 8 }}
            autoFocus
          />
          <button onClick={handleAddNote} disabled={!text.trim()}>追加</button>
          <button onClick={() => { setShowInput(false); setText(""); }}>キャンセル</button>
        </div>
      )}
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
