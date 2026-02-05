import React, { useState } from "react";
import { auth, db } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export const Top: React.FC = () => {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleCreateBoard = async () => {
    if (!auth.currentUser || auth.currentUser.isAnonymous) {
      setError("ボード作成にはGoogleログインが必要です。");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const boardsRef = collection(db, "boards");
      const docRef = await addDoc(boardsRef, {
        createdAt: serverTimestamp(),
        ownerUid: auth.currentUser.uid,
        visibility: "public-link",
      });
      navigate(`/b/${docRef.id}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const user = auth.currentUser;
  const displayName = user?.isAnonymous
    ? "匿名ユーザー"
    : user?.displayName || user?.email || "ログイン中";

  return (
    <div style={{ maxWidth: 360, margin: "80px auto", textAlign: "center", border: "1px solid #ccc", padding: 24, borderRadius: 8 }}>
      <h2>firebase-sticky-board</h2>
      <p>付箋ホワイトボードを作る</p>
      <div style={{ margin: 16 }}>
        {!user || user.isAnonymous ? (
          <button onClick={handleSignIn}>
            Googleでログイン
          </button>
        ) : (
          <div style={{ marginBottom: 12 }}>ログイン済: {displayName}</div>
        )}
        <button
          disabled={creating || user?.isAnonymous}
          onClick={handleCreateBoard}
        >
          ボードを作成
        </button>
      </div>
      {error && <div style={{ color: "#a00", marginTop: 16 }}>{error}</div>}
    </div>
  );
};
