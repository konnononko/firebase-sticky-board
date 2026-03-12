import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { collection, doc, addDoc, getDocs, deleteDoc, serverTimestamp, query, where, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { User } from "firebase/auth";
import type { Timestamp } from "firebase/firestore";

type BoardSummary = {
  id: string;
  createdAt?: Timestamp;
}

export const Top: React.FC = () => {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [loadingBoards, setLoadingBoards] = useState(false);

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

  const handleDeleteBoard = async (id: string) => {
    if (!window.confirm("本当にこのボードを削除しますか？")) return;
    await deleteDoc(doc(db, "boards", id));
    setBoards(boards => boards.filter(b => b.id !== id));
  };

  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchBoards = async () => {
      if (!user || user.isAnonymous) {
        setBoards([]);
        return;
      }
      setLoadingBoards(true);
      try {
        const boardsRef = collection(db, "boards");
        const q = query(
          boardsRef,
          where("ownerUid", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setBoards(
          snap.docs.map(d => ({
            id: d.id,
            createdAt: d.data().createdAt
          }))
        );
      } catch (e: any) {
        setBoards([]);
        setError(e.message);
      } finally {
        setLoadingBoards(false);
      }
    };
    fetchBoards();
  }, [user]);

  const displayName = user?.isAnonymous
    ? "匿名ユーザー"
    : user?.displayName || user?.email || "ログイン中";

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold">firebase-sticky-board</CardTitle>
          <CardDescription>
            付箋ホワイトボードを作る
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            {!user || user.isAnonymous ? (
              <Button
                onClick={handleSignIn}
                className="w-full mb-2"
                variant="outline"
              >
                Googleでログイン
              </Button>
            ) : (
              <div className="text-sm text-muted-foreground mb-2">
                ログイン済: {displayName}
              </div>
            )}
            <Button
              disabled={creating || user?.isAnonymous}
              onClick={handleCreateBoard}
              className="w-full"
            >
              ボードを作成
            </Button>
          </div>
          {user && !user.isAnonymous && (
            <div className="mb-4">
              <div className="font-semibold mb-2">自分のボード一覧</div>
              {loadingBoards ? (
                <div className="text-sm text-muted-foreground">読み込み中...</div>
              ) : boards.length === 0 ? (
                <div className="text-sm text-muted-foreground">ボードがありません</div>
              ) : (
                <ul className="space-y-2">
                  {boards.map(b => (
                    <li key={b.id} className="flex items-center justify-between bg-muted px-2 py-1 rounded">
                      <button
                        className="text-blue-600 underline text-sm"
                        onClick={() => navigate(`/b/${b.id}`)}
                      >
                        {b.id}
                      </button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDeleteBoard(b.id)}
                      >
                        削除
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {error && (
            <div className="text-destructive text-sm px-2 py-1 rounded mb-2 bg-destructive/10">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
