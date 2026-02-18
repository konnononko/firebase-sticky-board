import React, { useState } from "react";
import { auth, db } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
