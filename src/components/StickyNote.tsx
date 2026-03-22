import React from "react";
import type { Note } from "../types/Note"

type StickyNoteProps = {
  note: Note;
  isDragging: boolean;
  isEditing: boolean;
  draftText: string;
  onPointerDown: (e: React.PointerEvent, note: Note) => void;
  onStartEdit: (note: Note) => void;
  onSaveEdit: (note: Note) => void;
  onCancelEdit: () => void;
  onChangeDraft: (v: string) => void;
  onChangeColor: (id: string, color: string) => void;
  onDelete: (id: string) => void;
  draggedRef: React.RefObject<boolean>;
};

export const StickyNote: React.FC<StickyNoteProps> = ({
  note, isDragging, isEditing, draftText,
  onPointerDown, onStartEdit, onSaveEdit, onCancelEdit,
  onChangeDraft, onChangeColor, onDelete, draggedRef
}) => (
  <div
    style={{
      left: Math.max(8, Math.min(note.x, window.innerWidth - 280)),
      top: Math.max(8, Math.min(note.y, window.innerHeight - 100)),
      background: note.color
    }}
    className={`
        absolute min-w-[120px] min-h-[80px] max-w-[260px]
        p-3 pr-7 rounded-xl
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
      if (!isEditing) onPointerDown(e, note);
    }}
    onClick={() => {
      if (draggedRef.current) {
        draggedRef.current = false;
        return;
      }
      if (!isEditing) onStartEdit(note);
    }}
  >
    <div className="w-full break-words">
      {isEditing ? (
        <textarea
          className="w-full h-24 p-1 rounded border focus:outline-none focus:ring"
          value={draftText}
          autoFocus
          onChange={e => onChangeDraft(e.target.value)}
          onBlur={() => onSaveEdit(note)}
          onKeyDown={e => {
            if (e.key === "Escape") {
              e.preventDefault();
              onCancelEdit();
            }
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSaveEdit(note);
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
            onChangeColor(note.id, c);
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
      style={{ lineHeight: "1" }}
      aria-label="付箋を削除"
      tabIndex={-1}
      onClick={(e) => {
        e.stopPropagation();
        onDelete(note.id);
      }}
      onPointerDown={e => e.stopPropagation()}
    >
      ×
    </button>
  </div>
);
