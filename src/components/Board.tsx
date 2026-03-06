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
  color: string;
};

export const Board: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const location = useLocation();

  if (!boardId) return <div>Invalid boardId</div>;

  const [notes, setNotes] = useState<Note[]>([]);
  const [copied, setCopied] = useState(false);

  const [draggingNote, setDraggingNote] = useState<Note | null>(null);
  const offsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const boardRef = useRef<HTMLDivElement>(null);
  const draggedRef = useRef(false);

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");

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
    const notesRef = collection(db, "boards", boardId, "notes");
    const docRef = await addDoc(notesRef, {
      text: "",
      x: 60 + Math.random() * 400,
      y: 60 + Math.random() * 300,
      color: "#fffbe7",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setEditingNoteId(docRef.id);
    setDraftText("");
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
    draggedRef.current = false;
    setDraggingNote(note);
    const boardRect = boardRef.current?.getBoundingClientRect();
    const offsetX = e.clientX - note.x - (boardRect?.left || 0);
    const offsetY = e.clientY - note.y - (boardRect?.top || 0);
    offsetRef.current = { x: offsetX, y: offsetY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingNote) return;
    draggedRef.current = true;
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

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setDraftText(note.text);
  };

  const handleSaveEdit = async (note: Note) => {
    if (draftText !== note.text) {
      const noteRef = doc(db, "boards", boardId, "notes", note.id);
      await updateDoc(noteRef, {
        text: draftText,
        updatedAt: serverTimestamp(),
      })
    }
    setEditingNoteId(null);
    setDraftText("");
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setDraftText("");
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
        onClick={handleAddNote}
        className="absolute left-4 top-24 z-10"
        size="sm"
        variant="default"
      >
        付箋追加
      </Button>
      {notes.map((note) => {
        const isDragging = draggingNote && draggingNote.id === note.id;
        const isEditing = editingNoteId === note.id;
        return (
          <div
            key={note.id}
            style={{
              left: Math.max(8, Math.min(note.x, window.innerWidth - 280)),
              top: Math.max(8, Math.min(note.y, window.innerHeight - 100)),
              background: note.color
            }}
            className={`
              absolute min-w-[120px] min-h-[80px] max-w-[260px]
              p-3 pr-7 rounded-md
              border border-[#e0c97f]
              select-none
              text-[15px] leading-relaxed text-[#222]
              break-words whitespace-pre-wrap
              transition-shadow transition-z
              ${isDragging ? "shadow-xl z-20 cursor-grabbing" : "shadow-md z-0 cursor-grab"}
              hover:shadow-lg
              bg-opacity-90
              group
            `}
            onPointerDown={e => {
              if(!isEditing) handlePointerDown(e, note);
            }}
            onClick={() => {
              if (draggedRef.current) {
                draggedRef.current = false;
                return;
              }
              if (!isEditing) handleStartEdit(note);
            }}
          >
            <div className="w-full break-words">
              {isEditing ? (
                <textarea
                  className="w-full h-24 p-1 rounded border focus:outline-none focus:ring"
                  value={draftText}
                  autoFocus
                  onChange={e => setDraftText(e.target.value)}
                  onBlur={() => handleSaveEdit(note)}
                  onKeyDown={e => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      handleCancelEdit();
                    }
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSaveEdit(note);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                />
              ) : (
                note.text || <span className="text-gray-400">（クリックで編集）</span>
              )}
            </div>
            <div className="flex gap-1 mt-2">
              {["#fffbe7", "#c2e7ff", "#ffd6e0"].map(c => (
                <button
                  key={c}
                  className={`w-5 h-5 rounded-full border transition-all
                    ${c === (note.color)
                      ? "border-gray-600 ring-2 ring-gray-400"
                      : "border-gray-300 hover:ring-2 hover:ring-gray-300"}
                      hover:scale-110
                  `}
                  style={{ background: c }}
                  aria-label={`色を${c}に変更`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChangeColor(note.id, c);
                  }}
                  onPointerDown={e => e.stopPropagation()}
                />
              ))}
            </div>
            <button
              className={`
                absolute top-2 right-2 p-0.5 rounded
                bg-transparent border-none text-red-500 font-bold
                text-base cursor-pointer z-10 opacity-0 group-hover:opacity-100
                transition-opacity
                hover:bg-red-50
                focus:opacity-100
              `}
              style={{lineHeight: "1"}}
              aria-label="付箋を削除"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteNote(note.id);
              }}
              onPointerDown={e => e.stopPropagation()}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
};
