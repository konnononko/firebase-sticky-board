import React, { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, QueryDocumentSnapshot, addDoc, serverTimestamp, updateDoc, deleteDoc, doc } from "firebase/firestore";
import type { DocumentData } from "firebase/firestore"

type Note = {
  id: string;
  text: string;
  x: number;
  y: number;
  color?: string;
};

export const Board: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [text, setText] = useState("");

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
        if (draggingNote) {
          return serverNotes.map(n =>
            n.id === draggingNote.id ? draggingNote : n
          );
        }
        return serverNotes;
      });
    });
    return unsubscribe;
  }, [draggingNote]);

  const handleAddNote = async () => {
    if (!text.trim()) return;
    const notesRef = collection(db, "boards", "default", "notes");
    await addDoc(notesRef, {
      text,
      x: 60 + Math.random() * 400,
      y: 60 + Math.random() * 300,
      color: "#fffbe7",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setText("");
    setShowInput(false);
  };

  const handleDeleteNote = async (id: string) => {
    const noteRef = doc(db, "boards", "default", "notes", id);
    await deleteDoc(noteRef);
  };

  const handleChangeColor = async (id: string, color: string) => {
    const noteRef = doc(db, "boards", "default", "notes", id);
    await updateDoc(noteRef, { color, updatedAt: serverTimestamp() });
  };

  const handlePointerDown = (e: React.PointerEvent, note: Note) => {
    setDraggingNote(note);
    const boardRect = boardRef.current?.getBoundingClientRect();
    const offsetX = e.clientX - note.x - (boardRect?.left || 0);
    const offsetY = e.clientY - note.y - (boardRect?.top || 0);
    offsetRef.current = { x: offsetX, y: offsetY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingNote) return;
    const boardRect = boardRef.current?.getBoundingClientRect();
    const newX = e.clientX - offsetRef.current.x - (boardRect?.left || 0);
    const newY = e.clientY - offsetRef.current.y - (boardRect?.top || 0);
    setDraggingNote({ ...draggingNote, x: newX, y: newY });
    setNotes(notes =>
      notes.map(n =>
        n.id === draggingNote.id
          ? { ...n, x: newX, y: newY }
          : n
      )
    );
  };

  const handlePointerUp = async () => {
    if (!draggingNote) return;
    const noteRef = doc(db, "boards", "default", "notes", draggingNote.id);
    await updateDoc(noteRef, {
      x: draggingNote.x,
      y: draggingNote.y,
      updatedAt: serverTimestamp(),
    });
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
            background: note.color ?? "#fffbe7",
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
          <div style={{display: "flex", gap: 4, marginTop: 8}}>
            {["#fffbe7", "#c2e7ff", "#ffd6e0"].map(c => (
              <button
                key={c}
                style={{
                  width: 20, height: 20, borderRadius: "50%",
                  border: c === (note.color ?? "#fffbe7") ? "2px solid #444" : "1px solid #ccc",
                  background: c, cursor: "pointer",
                }}
                onClick={() => handleChangeColor(note.id, c)}
                aria-label={`色を${c}に変更`}
              />
            ))}
          </div>
          <button
            onClick={() => handleDeleteNote(note.id)}
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              background: "transparent",
              border: "none",
              color: "#a55",
              fontWeight: "bold",
              fontSize: 16,
              cursor: "pointer",
              zIndex: 1,
            }}
            aria-label="付箋を削除"
          >
            x
          </button>
        </div>
      ))}
    </div>
  );
};
