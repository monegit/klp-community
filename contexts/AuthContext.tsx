import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  documentId,
  limit as fsLimit,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  startAfter,
  where,
  writeBatch,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { auth, db, storage } from "../firebase.config";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profile: { nickname?: string; photoURL?: string } | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nickname: string) => Promise<void>;
  updateNickname: (nickname: string) => Promise<void>;
  updateProfileImage: (localUri: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    nickname?: string;
    photoURL?: string;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const snap = await getDoc(doc(db, "users", u.uid));
          if (snap.exists()) {
            const data: any = snap.data();
            setProfile({ nickname: data.nickname, photoURL: data.photoURL });
          } else {
            setProfile(null);
          }
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    setUser(cred.user);
    try {
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      if (snap.exists()) {
        const data: any = snap.data();
        setProfile({ nickname: data.nickname, photoURL: data.photoURL });
      }
    } catch {}
  };

  const signUp = async (email: string, password: string, nickname: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    setUser(cred.user);
    await setDoc(doc(db, "users", cred.user.uid), {
      nickname,
      photoURL: "",
      createdAt: Date.now(),
    });
    setProfile({ nickname, photoURL: "" });
  };

  const updateNickname = async (nickname: string) => {
    if (!user) return;
    await setDoc(
      doc(db, "users", user.uid),
      { nickname, updatedAt: Date.now() },
      { merge: true }
    );
    setProfile((prev) => ({ ...(prev ?? {}), nickname }));

    // 기존 게시글/댓글의 캐시된 닉네임을 일괄 갱신
    try {
      const pageSize = 400; // 배치당 최대 문서 수 (여유롭게)
      const updateCollectionField = async (colName: string) => {
        let last: any = undefined;
        // documentId() 기준 페이지네이션으로 전체 대상 업데이트
        // where(userId == current)
        while (true) {
          const q = query(
            collection(db, colName),
            where("userId", "==", user.uid),
            orderBy(documentId()),
            ...(last ? [startAfter(last)] : []),
            fsLimit(pageSize)
          );
          const snap = await getDocs(q);
          if (snap.empty) break;
          const batch = writeBatch(db);
          for (const d of snap.docs) {
            batch.update(doc(db, colName, d.id), { userNickname: nickname });
          }
          await batch.commit();
          last = snap.docs[snap.docs.length - 1];
          if (snap.size < pageSize) break;
        }
      };
      await updateCollectionField("posts");
      await updateCollectionField("comments");
      // clearPostCaches();
    } catch (e) {
      // 백필 실패는 앱 동작에 치명적이지 않으므로 경고만
      console.warn("닉네임 백필 실패", e);
    }
  };

  const updateProfileImage = async (localUri: string) => {
    if (!user) return;
    const res = await fetch(localUri);
    if (!res.ok) throw new Error("이미지를 불러오지 못했습니다.");
    const blob = await res.blob();
    const storageRef = ref(
      storage,
      `profileImages/${user.uid}_${Date.now()}.jpg`
    );
    await uploadBytes(storageRef, blob as any, {
      contentType: (blob as any)?.type || "image/jpeg",
    });
    const url = await getDownloadURL(storageRef);
    await setDoc(
      doc(db, "users", user.uid),
      { photoURL: url, updatedAt: Date.now() },
      { merge: true }
    );
    setProfile((prev) => ({ ...(prev ?? {}), photoURL: url }));

    // 기존 게시글/댓글의 캐시된 프로필 이미지 URL을 일괄 갱신
    try {
      const pageSize = 400;
      const updateCollectionField = async (colName: string) => {
        let last: any = undefined;
        while (true) {
          const q = query(
            collection(db, colName),
            where("userId", "==", user.uid),
            orderBy(documentId()),
            ...(last ? [startAfter(last)] : []),
            fsLimit(pageSize)
          );
          const snap = await getDocs(q);
          if (snap.empty) break;
          const batch = writeBatch(db);
          for (const d of snap.docs)
            batch.update(doc(db, colName, d.id), { userPhotoURL: url });
          await batch.commit();
          last = snap.docs[snap.docs.length - 1];
          if (snap.size < pageSize) break;
        }
      };
      await updateCollectionField("posts");
      await updateCollectionField("comments");
      // clearPostCaches();
    } catch (e) {
      console.warn("프로필 이미지 백필 실패", e);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    profile,
    signIn,
    signUp,
    updateNickname,
    updateProfileImage,
    logout,
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
