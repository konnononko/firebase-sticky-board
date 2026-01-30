import React, { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, QueryDocumentSnapshot, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
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

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingNote, setDraggingNote] = useState<Note | null>(null);
  const offsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const notesRef = collection(db, "boards", "default", "notes");
    const unsubscribe = onSnapshot(notesRef, (snapshot) => {
      setNotes(_oldNotes => {
        const serverNotes = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          ...doc.data(),
        })) as Note[];
        if (draggingId && draggingNote) {
          return serverNotes.map(n =>
            n.id === draggingId ? draggingNote : n
          );
        }
        return serverNotes;
      });
    });
    return unsubscribe;
  }, [draggingId, draggingNote]);

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

  const handlePointerDown = (e: React.PointerEvent, note: Note) => {
    setDraggingId(note.id);
    setDraggingNote(note);
    const boardRect = boardRef.current?.getBoundingClientRect();
    const offsetX = e.clientX - note.x - (boardRect?.left || 0);
    const offsetY = e.clientY - note.y - (boardRect?.top || 0);
    offsetRef.current = { x: offsetX, y: offsetY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId || !draggingNote) return;
    const boardRect = boardRef.current?.getBoundingClientRect();
    const newX = e.clientX - offsetRef.current.x - (boardRect?.left || 0);
    const newY = e.clientY - offsetRef.current.y - (boardRect?.top || 0);
    setDraggingNote({ ...draggingNote, x: newX, y: newY });
    setNotes(notes =>
      notes.map(n =>
        n.id === draggingId
          ? { ...n, x: newX, y: newY }
          : n
      )
    );
  };

  const handlePointerUp = async () => {
    if (!draggingId || !draggingNote) return;
    const noteRef = doc(db, "boards", "default", "notes", draggingNote.id);
    await updateDoc(noteRef, {
      x: draggingNote.x,
      y: draggingNote.y,
      updatedAt: serverTimestamp(),
    });
    setDraggingId(null);
    setDraggingNote(null);
  };

  return (
    <div
      ref={boardRef}
      style={{ position: "relative", width: "100vw", height: "100vh", background: "#f8f8f8" }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
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
          onPointerDown={e => handlePointerDown(e, note)}
        >
          {note.text}
        </div>
      ))}
    </div>
  );
};
