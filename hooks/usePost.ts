import { db, storage } from "@/firebase.config";
import { Comment, CreateCommentRequest } from "@/types/comment";
import { PostRequest, PostResponse } from "@/types/post";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  documentId,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

// --- 간단 메모리 캐시 (앱 메모리 내) ---
let _listCache: {
  posts: PostResponse[];
  lastDoc?: QueryDocumentSnapshot<DocumentData>;
  ts: number;
  limit: number;
} | null = null;
const LIST_CACHE_TTL = 10_000; // 10초
const _detailCache = new Map<string, PostResponse>();

const uploadImageAsync = async (uris: string[], fileNamePrefix: string) => {
  const urls: string[] = [];
  for (let i = 0; i < uris.length; i++) {
    const uri = uris[i];
    try {
      const response = await fetch(uri);
      if (!response.ok) continue;
      const blob = await response.blob();
      const storageRef = ref(
        storage,
        `images/${fileNamePrefix}_${i}_${Date.now()}.jpg`
      );
      await uploadBytes(storageRef, blob, {
        contentType: (blob as any)?.type || "image/jpeg",
      });
      const url = await getDownloadURL(storageRef);
      urls.push(url);
    } catch (e) {
      console.warn("이미지 업로드 실패", uri, e);
    }
  }
  return urls;
};

export const usePost = () => {
  const writePost = async (postData: PostRequest) => {
    const imageUrls = postData.images?.length
      ? await uploadImageAsync(postData.images, "post-image")
      : [];
    await addDoc(collection(db, "posts"), {
      userId: postData.userId,
      title: postData.title,
      content: postData.content,
      images: imageUrls,
      createdAt: serverTimestamp(),
      comments: [],
    });
    _listCache = null; // 목록 캐시 무효화
  };

  const getPostList = async (postLimit: number, force = false) => {
    const now = Date.now();
    if (
      !force &&
      _listCache &&
      _listCache.limit === postLimit &&
      now - _listCache.ts < LIST_CACHE_TTL
    ) {
      return {
        posts: _listCache.posts,
        lastDoc: _listCache.lastDoc as
          | QueryDocumentSnapshot<PostResponse>
          | undefined,
        fromCache: true,
      };
    }

    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(postLimit)
    );
    const snapshot = await getDocs(q);
    const basePosts = snapshot.docs.map((d) => {
      const data = d.data() as any;
      return {
        postId: d.id,
        userId: data.userId || "",
        title: data.title || "",
        content: data.content || "",
        images: data.images || [],
        createdAt: data.createdAt || "",
        comments: data.comments || [],
      } as PostResponse;
    });
    // users에서 닉네임/프로필 이미지를 병합
    const userIds = Array.from(new Set(basePosts.map((p) => p.userId).filter(Boolean)));
    const usersMap: Record<string, { nickname?: string; photoURL?: string }> = {};
    const chunkSize = 10;
    for (let i = 0; i < userIds.length; i += chunkSize) {
      const chunk = userIds.slice(i, i + chunkSize);
      try {
        const uq = query(collection(db, "users"), where(documentId(), "in", chunk));
        const usnap = await getDocs(uq);
        usnap.forEach((ud) => {
          const u: any = ud.data();
          usersMap[ud.id] = {
            nickname: u?.nickname ?? undefined,
            photoURL: (u?.profileImageURL ?? u?.photoURL) ?? undefined,
          };
        });
      } catch (e) {
        console.warn("users 병합 조회 실패", e);
      }
    }
    const posts = basePosts.map((p) => ({
      ...p,
      userNickname: usersMap[p.userId]?.nickname || "",
      userPhotoURL: usersMap[p.userId]?.photoURL || "",
    }));
    const lastDoc = snapshot.docs[snapshot.docs.length - 1];

    _listCache = { posts, lastDoc, ts: now, limit: postLimit };
    posts.forEach((p) => _detailCache.set(p.postId, p));

    return {
      posts,
      lastDoc: lastDoc as QueryDocumentSnapshot<PostResponse> | undefined,
      fromCache: false,
    };
  };

  const getNextPostList = async (
    lastDoc: QueryDocumentSnapshot<DocumentData>,
    pageLimit = 10
  ) => {
    if (!lastDoc) return { posts: [], lastDoc: undefined };

    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(pageLimit)
    );
    const snapshot = await getDocs(q);
    const basePosts = snapshot.docs.map((d) => {
      const data = d.data() as any;
      return {
        postId: d.id,
        userId: data.userId || "",
        title: data.title || "",
        content: data.content || "",
        images: data.images || [],
        createdAt: data.createdAt || "",
        comments: data.comments || [],
      } as PostResponse;
    });
    // users 병합
    const userIds = Array.from(new Set(basePosts.map((p) => p.userId).filter(Boolean)));
    const usersMap: Record<string, { nickname?: string; photoURL?: string }> = {};
    const chunkSize = 10;
    for (let i = 0; i < userIds.length; i += chunkSize) {
      const chunk = userIds.slice(i, i + chunkSize);
      try {
        const uq = query(collection(db, "users"), where(documentId(), "in", chunk));
        const usnap = await getDocs(uq);
        usnap.forEach((ud) => {
          const u: any = ud.data();
          usersMap[ud.id] = {
            nickname: u?.nickname ?? undefined,
            photoURL: (u?.profileImageURL ?? u?.photoURL) ?? undefined,
          };
        });
      } catch (e) {
        console.warn("users 병합 조회 실패", e);
      }
    }
    const newPosts = basePosts.map((p) => ({
      ...p,
      userNickname: usersMap[p.userId]?.nickname || "",
      userPhotoURL: usersMap[p.userId]?.photoURL || "",
    }));
    const newLast = snapshot.docs[snapshot.docs.length - 1];

    if (_listCache) {
      const mergedIds = new Set(_listCache.posts.map((p) => p.postId));
      for (const p of newPosts)
        if (!mergedIds.has(p.postId)) _listCache.posts.push(p);
      _listCache.lastDoc = newLast;
      _listCache.ts = Date.now();
    }
    newPosts.forEach((p) => _detailCache.set(p.postId, p));

    return {
      posts: newPosts,
      lastDoc: newLast as QueryDocumentSnapshot<PostResponse> | undefined,
    };
  };

  const getPostDetail = async (postId: string, force = false) => {
    if (!force && _detailCache.has(postId)) {
      return { post: _detailCache.get(postId)!, fromCache: true };
    }
    const refDoc = doc(db, "posts", postId);
    const snap = await getDoc(refDoc);
    if (!snap.exists()) return { post: null, fromCache: false };
    const data = snap.data() as any;
    // users에서 프로필 정보 별도 조회
    let userNickname = "";
    let userPhotoURL = "";
    try {
      if (data.userId) {
        const usnap = await getDoc(doc(db, "users", data.userId));
        if (usnap.exists()) {
          const u: any = usnap.data();
          userNickname = u?.nickname || "";
          userPhotoURL = (u?.profileImageURL ?? u?.photoURL) || "";
        }
      }
    } catch (e) {
      console.warn("users 단건 조회 실패", e);
    }
    const post: PostResponse = {
      postId: snap.id,
      userId: data.userId || "",
      userNickname,
      userPhotoURL,
      title: data.title || "",
      content: data.content || "",
      images: data.images || [],
      createdAt: data.createdAt || "",
      comments: data.comments || [],
    };
    _detailCache.set(postId, post);
    return { post, fromCache: false };
  };

  const updatePost = async (postId: string, data: Partial<PostRequest>) => {
    const refDoc = doc(db, "posts", postId);
    await updateDoc(refDoc, { ...data });
    _detailCache.delete(postId); // 정확성 위해 무효화
    _listCache = null;
  };

  const deletePost = async (postId: string) => {
    await deleteDoc(doc(db, "posts", postId));
    _detailCache.delete(postId);
    _listCache = null;
  };

  const addComment = async (req: CreateCommentRequest) => {
    // 최상위 comments 컬렉션에 저장
    const refCol = collection(db, "comments");
    const docRef = await addDoc(refCol, {
      postId: req.postId,
      userId: req.userId,
      comment: req.comment,
      userNickname: (req as any).userNickname || null,
      userPhotoURL: (req as any).userPhotoURL || null,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  };

  const subscribeComments = (
    postId: string,
    onChange: (comments: Comment[]) => void,
    onError?: (e: any) => void
  ) => {
    const q = query(
      collection(db, "comments"),
      where("postId", "==", postId),
      orderBy("createdAt", "asc"),
      limit(100)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: Comment[] = snap.docs.map((d) => ({
          commentId: d.id,
          postId: (d.data() as any).postId || postId,
          userId: (d.data() as any).userId || "",
          comment: (d.data() as any).comment || "",
          userNickname: (d.data() as any).userNickname || "",
          userPhotoURL: (d.data() as any).userPhotoURL || "",
          createdAt: (() => {
            const c: any = (d.data() as any).createdAt;
            if (!c) return "";
            if (typeof c === "string") return c;
            if (typeof c?.toDate === "function")
              return c.toDate().toISOString();
            if (c?.seconds) return new Date(c.seconds * 1000).toISOString();
            return String(c);
          })(),
        }));
        onChange(list);
      },
      (err) => onError?.(err)
    );
    return unsub;
  };

  const getComments = async (postId: string, max = 100): Promise<Comment[]> => {
    const q = query(
      collection(db, "comments"),
      where("postId", "==", postId),
      orderBy("createdAt", "asc"),
      limit(max)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        commentId: d.id,
        postId: data.postId || postId,
        userId: data.userId || "",
        comment: data.comment || "",
        userNickname: data.userNickname || "",
        userPhotoURL: data.userPhotoURL || "",
        createdAt: (() => {
          const c: any = data.createdAt;
          if (!c) return "";
          if (typeof c === "string") return c;
          if (typeof c?.toDate === "function") return c.toDate().toISOString();
          if (c?.seconds) return new Date(c.seconds * 1000).toISOString();
          return String(c);
        })(),
      } as Comment;
    });
  };

  return {
    writePost,
    getPostList,
    getNextPostList,
    getPostDetail,
    updatePost,
    deletePost,
    addComment,
    subscribeComments,
    getComments,
  };
};

// 외부에서 목록/상세 캐시를 비우기 위한 헬퍼 (닉네임/프로필 변경 시 사용)
export const clearPostCaches = () => {
  _listCache = null;
  _detailCache.clear();
};
