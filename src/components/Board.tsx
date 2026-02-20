import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom"
import { db, auth } from "../firebase";
import { collection, onSnapshot, QueryDocumentSnapshot, addDoc, serverTimestamp, updateDoc, deleteDoc, doc } from "firebase/firestore";
import type { DocumentData } from "firebase/firestore"
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Note = {
  id: string;
  text: string;
  x: number;
  y: number;
  color?: string;
};

export const Board: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const location = useLocation();

  if (!boardId) return <div>Invalid boardId</div>;

  const [notes, setNotes] = useState<Note[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const [draggingNote, setDraggingNote] = useState<Note | null>(null);
  const offsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (!user) signInAnonymously(auth);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const notesRef = collection(db, "boards", boardId, "notes");
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
  }, [draggingNote, boardId]);

  const handleAddNote = async () => {
    if (!text.trim()) return;
    const notesRef = collection(db, "boards", boardId, "notes");
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
    const noteRef = doc(db, "boards", boardId, "notes", id);
    await deleteDoc(noteRef);
  };

  const handleChangeColor = async (id: string, color: string) => {
    const noteRef = doc(db, "boards", boardId, "notes", id);
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
    const noteRef = doc(db, "boards", boardId, "notes", draggingNote.id);
    await updateDoc(noteRef, {
      x: draggingNote.x,
      y: draggingNote.y,
      updatedAt: serverTimestamp(),
    });
    setDraggingNote(null);
  };

  const shareUrl = window.location.origin + location.pathname;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div
      ref={boardRef}
      className="min-h-screen w-full bg-muted relative"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >

      <Card className="absolute left-4 top-4 z-10 flex flex-row items-center gap-3 px-4 py-2 max-w-md border bg-card shadow">
        <span className="text-muted-foreground">共有リンク:</span>
        <span className="font-mono text-sm max-w-[220px] truncate select-text" title={shareUrl}>{shareUrl}</span>
        <Button
          onClick={handleCopyLink}
          size="sm"
          variant="outline"
          className="ml-1"
        >
          コピー
        </Button>
        {copied && (
          <span className="text-green-600 text-xs ml-2">コピーしました</span>
        )}
      </Card>

      <Button
        onClick={() => setShowInput(true)}
        className="absolute left-4 top-24 z-10"
        size="sm"
        variant="default"
      >
        付箋追加
      </Button>
      {showInput && (
        <Card className="absolute left-4 top-36 z-20 p-3 flex flex-row gap-2 items-center">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="付箋テキスト"
            className="border rounded px-2 py-1 text-sm"
            autoFocus
          />
          <Button onClick={handleAddNote} disabled={!text.trim()} size="sm">
            追加
          </Button>
          <Button
            onClick={() => { setShowInput(false); setText(""); }}
            type="button"
            variant="ghost"
            size="sm"
          >
            キャンセル
          </Button>
        </Card>
      )}
      {notes.map((note) => (
        <div
          key={note.id}
          style={{
            left: note.x,
            top: note.y,
            background: note.color ?? "#fffbe7"
          }}
          className={`
            absolute min-w-[120px] min-h-[80px]
            p-3 pr-7 rounded-md
            border border-[#e0c97f] shadow-md
            select-none
            text-[15px] leading-relaxed text-[#222]
            break-words whitespace-pre-wrap
            transition-shadow
            cursor-grab
            hover:shadow-lg
            bg-opacity-90
            z-0
          `}
          onPointerDown={e => handlePointerDown(e, note)}
        >
          <div className="w-full break-words">
            {note.text}
          </div>
          <div className="flex gap-1 mt-2">
            {["#fffbe7", "#c2e7ff", "#ffd6e0"].map(c => (
              <button
                key={c}
                className={`w-5 h-5 rounded-full border transition-all
                  ${c === (note.color ?? "#fffbe7") 
                    ? "border-gray-600 ring-2 ring-gray-400" 
                    : "border-gray-300 hover:ring-2 hover:ring-gray-300"}
                `}
                style={{ background: c }}
                onClick={() => handleChangeColor(note.id, c)}
                aria-label={`色を${c}に変更`}
              />
            ))}
          </div>
          <button
            onClick={() => handleDeleteNote(note.id)}
            className={`
              absolute top-2 right-2 p-0.5 rounded
              bg-transparent border-none text-red-500 font-bold
              text-base cursor-pointer z-10 opacity-0 hover:opacity-100
              transition-opacity
              hover:bg-red-50
              focus:opacity-100
            `}
            style={{lineHeight: "1"}}
            aria-label="付箋を削除"
            tabIndex={-1}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
