// import { fetchUserProfilesMap } from "@/lib/users";
// import { fetchPosts } from "@/services/post";
import { fetchAccountProfileImages } from "@/services/account";
import { fetchPosts } from "@/services/post";
import { AccountProfile } from "@/types/account";
import { PostResponse } from "@/types/post";
import { QueryDocumentSnapshot } from "firebase/firestore";

// // --- 간단 메모리 캐시 (앱 메모리 내) ---
// let _listCache: {
//   posts: PostResponse[];
//   lastDoc?: QueryDocumentSnapshot<DocumentData>;
//   ts: number;
//   limit: number;
// } | null = null;
// const LIST_CACHE_TTL = 10_000; // 10초
// const _detailCache = new Map<string, PostResponse>();

type PagedPosts = {
  posts: PostResponse[];
  lastPost?: QueryDocumentSnapshot<PostResponse>;
  limit: number;
};

let _postCache: PagedPosts | null = null;

export const usePost = () => {
  // const [isLoading, setIsLoading] = useState(false);

  const getPosts = async (postLimit: number = 10): Promise<PagedPosts> => {
    try {
      const response = await fetchPosts(undefined, postLimit);

      console.log("Fetched posts:", response?.docs[0].id);
      if (!response || response.empty) {
        _postCache = {
          posts: [],
          lastPost: undefined,
          limit: postLimit,
        };
        return _postCache;
      }

      const basePosts: PostResponse[] = response.docs.map((post) => {
        const data = post.data();
        return {
          postId: post.id,
          userId: data.userId || "",
          title: data.title || "",
          content: data.content || "",
          images: data.images || [],
          createdAt: data.createdAt || "",
          comments: data.comments || [],
        };
      });

      const usersMap: Record<string, AccountProfile> =
        await fetchAccountProfileImages(basePosts.map((post) => post.userId));

      const posts = basePosts.map((post) => ({
        ...post,
        nickname: usersMap[post.userId]?.nickname || "",
        profileImageURL: usersMap[post.userId]?.profileImageURL || "",
      }));

      const lastPost = response.docs[response.docs.length - 1] as
        | QueryDocumentSnapshot<PostResponse>
        | undefined;

      _postCache = {
        posts,
        lastPost,
        limit: postLimit,
      };
      // posts.forEach((post) => _postCache.set(post.postId, post));

      return {
        posts,
        lastPost,
        limit: postLimit,
      };
    } catch (error) {
      console.error("Error fetching posts:", error);
      return {
        posts: [],
        lastPost: undefined,
        limit: postLimit,
      };
    }
  };

  const getNextPosts = async (
    lastPost: QueryDocumentSnapshot<PostResponse>,
    postLimit: number = 10
  ): Promise<PagedPosts> => {
    if (!lastPost)
      return {
        posts: [],
        lastPost: undefined,
        limit: postLimit,
      };

    try {
      const response = await fetchPosts(lastPost, postLimit);

      if (!response)
        return {
          posts: [],
          lastPost: undefined,
          limit: postLimit,
        };

      const basePosts = response.docs.map<PostResponse>((post) => {
        return {
          postId: post.id,
          userId: post.data().userId || "",
          title: post.data().title || "",
          content: post.data().content || "",
          images: post.data().images || [],
          createdAt: post.data().createdAt || "",
          comments: post.data().comments || [],
        };
      });
      const usersMap: Record<string, AccountProfile> =
        await fetchAccountProfileImages(basePosts.map((post) => post.userId));

      const newPosts = basePosts.map((post) => ({
        ...post,
        nickname: usersMap[post.userId]?.nickname || "",
        profileImageURL: usersMap[post.userId]?.profileImageURL || "",
      }));
      const newLastPost = response.docs[
        response.docs.length - 1
      ] as QueryDocumentSnapshot<PostResponse>;

      if (_postCache) {
        const seenIds = new Set(_postCache.posts.map((post) => post.postId));
        const mergedIds = [
          ..._postCache.posts,
          ...newPosts.filter((post) => !seenIds.has(post.postId)),
        ];

        _postCache.posts = mergedIds;
        _postCache.lastPost = newLastPost;
      } else {
        _postCache = {
          posts: newPosts,
          lastPost: newLastPost,
          limit: postLimit,
        };
      }

      return {
        posts: newPosts,
        lastPost: newLastPost,
        limit: postLimit,
      };
    } catch (error) {
      console.error("Error fetching next posts:", error);
      return {
        posts: [],
        lastPost: undefined,
        limit: postLimit,
      };
    }
  };

  return { getPosts, getNextPosts };
};

// const uploadImageAsync = async (uris: string[], fileNamePrefix: string) => {
//   const urls: string[] = [];
//   for (let i = 0; i < uris.length; i++) {
//     const uri = uris[i];
//     try {
//       const response = await fetch(uri);
//       if (!response.ok) continue;
//       const blob = await response.blob();
//       const storageRef = ref(
//         storage,
//         `images/${fileNamePrefix}_${i}_${Date.now()}.jpg`
//       );
//       await uploadBytes(storageRef, blob, {
//         contentType: (blob as any)?.type || "image/jpeg",
//       });
//       const url = await getDownloadURL(storageRef);
//       urls.push(url);
//     } catch (e) {
//       console.warn("이미지 업로드 실패", uri, e);
//     }
//   }
//   return urls;
// };

// export const usePost = () => {
//   const writePost = async (postData: PostRequest) => {
//     const imageUrls = postData.images?.length
//       ? await uploadImageAsync(postData.images, "post-image")
//       : [];
//     await addDoc(collection(db, "posts"), {
//       userId: postData.userId,
//       title: postData.title,
//       content: postData.content,
//       images: imageUrls,
//       createdAt: serverTimestamp(),
//       comments: [],
//     });
//     _listCache = null; // 목록 캐시 무효화
//   };

//   const getPostList = async (postLimit: number, force = false) => {
//     const now = Date.now();
//     if (
//       !force &&
//       _listCache &&
//       _listCache.limit === postLimit &&
//       now - _listCache.ts < LIST_CACHE_TTL
//     ) {
//       return {
//         posts: _listCache.posts,
//         lastDoc: _listCache.lastDoc as
//           | QueryDocumentSnapshot<PostResponse>
//           | undefined,
//         fromCache: true,
//       };
//     }

//     const q = query(
//       collection(db, "posts"),
//       orderBy("createdAt", "desc"),
//       limit(postLimit)
//     );
//     const snapshot = await getDocs(q);
//     const basePosts = snapshot.docs.map((d) => {
//       const data = d.data() as any;
//       return {
//         postId: d.id,
//         userId: data.userId || "",
//         title: data.title || "",
//         content: data.content || "",
//         images: data.images || [],
//         createdAt: data.createdAt || "",
//         comments: data.comments || [],
//       } as PostResponse;
//     });
//     // users에서 닉네임/프로필 이미지를 병합
//     const usersMap = await fetchUserProfilesMap(basePosts.map((p) => p.userId));
//     const posts = basePosts.map((p) => ({
//       ...p,
//       userNickname: usersMap[p.userId]?.nickname || "",
//       userPhotoURL: usersMap[p.userId]?.photoURL || "",
//     }));
//     const lastDoc = snapshot.docs[snapshot.docs.length - 1];

//     _listCache = { posts, lastDoc, ts: now, limit: postLimit };
//     posts.forEach((p) => _detailCache.set(p.postId, p));

//     return {
//       posts,
//       lastDoc: lastDoc as QueryDocumentSnapshot<PostResponse> | undefined,
//       fromCache: false,
//     };
//   };

//   const getNextPostList = async (
//     lastDoc: QueryDocumentSnapshot<DocumentData>,
//     pageLimit = 10
//   ) => {
//     if (!lastDoc) return { posts: [], lastDoc: undefined };

//     const q = query(
//       collection(db, "posts"),
//       orderBy("createdAt", "desc"),
//       startAfter(lastDoc),
//       limit(pageLimit)
//     );
//     const snapshot = await getDocs(q);
//     const basePosts = snapshot.docs.map((d) => {
//       const data = d.data() as any;
//       return {
//         postId: d.id,
//         userId: data.userId || "",
//         title: data.title || "",
//         content: data.content || "",
//         images: data.images || [],
//         createdAt: data.createdAt || "",
//         comments: data.comments || [],
//       } as PostResponse;
//     });
//     // users 병합
//     const usersMap = await fetchUserProfilesMap(basePosts.map((p) => p.userId));
//     const newPosts = basePosts.map((p) => ({
//       ...p,
//       userNickname: usersMap[p.userId]?.nickname || "",
//       userPhotoURL: usersMap[p.userId]?.photoURL || "",
//     }));
//     const newLast = snapshot.docs[snapshot.docs.length - 1];

//     if (_listCache) {
//       const mergedIds = new Set(_listCache.posts.map((p) => p.postId));
//       for (const p of newPosts)
//         if (!mergedIds.has(p.postId)) _listCache.posts.push(p);
//       _listCache.lastDoc = newLast;
//       _listCache.ts = Date.now();
//     }
//     newPosts.forEach((p) => _detailCache.set(p.postId, p));

//     return {
//       posts: newPosts,
//       lastDoc: newLast as QueryDocumentSnapshot<PostResponse> | undefined,
//     };
//   };

//   const getPostDetail = async (postId: string, force = false) => {
//     if (!force && _detailCache.has(postId)) {
//       return { post: _detailCache.get(postId)!, fromCache: true };
//     }
//     const refDoc = doc(db, "posts", postId);
//     const snap = await getDoc(refDoc);
//     if (!snap.exists()) return { post: null, fromCache: false };
//     const data = snap.data() as any;
//     // users에서 프로필 정보 별도 조회
//     let userNickname = "";
//     let userPhotoURL = "";
//     try {
//       if (data.userId) {
//         const usnap = await getDoc(doc(db, "users", data.userId));
//         if (usnap.exists()) {
//           const u: any = usnap.data();
//           userNickname = u?.nickname || "";
//           userPhotoURL = (u?.profileImageURL ?? u?.photoURL) || "";
//         }
//       }
//     } catch (e) {
//       console.warn("users 단건 조회 실패", e);
//     }
//     const post: PostResponse = {
//       postId: snap.id,
//       userId: data.userId || "",
//       nickname,
//       profileImageURL,
//       title: data.title || "",
//       content: data.content || "",
//       images: data.images || [],
//       createdAt: data.createdAt || "",
//       comments: data.comments || [],
//     };
//     _detailCache.set(postId, post);
//     return { post, fromCache: false };
//   };

//   const updatePost = async (postId: string, data: Partial<PostRequest>) => {
//     const refDoc = doc(db, "posts", postId);
//     await updateDoc(refDoc, { ...data });
//     _detailCache.delete(postId); // 정확성 위해 무효화
//     _listCache = null;
//   };

//   const deletePost = async (postId: string) => {
//     await deleteDoc(doc(db, "posts", postId));
//     _detailCache.delete(postId);
//     _listCache = null;
//   };

//   const addComment = async (req: CreateCommentRequest) => {
//     // 최상위 comments 컬렉션에 저장
//     const refCol = collection(db, "comments");
//     const docRef = await addDoc(refCol, {
//       postId: req.postId,
//       userId: req.userId,
//       comment: req.comment,
//       userNickname: (req as any).userNickname || null,
//       userPhotoURL: (req as any).userPhotoURL || null,
//       createdAt: serverTimestamp(),
//     });
//     return docRef.id;
//   };

//   const subscribeComments = (
//     postId: string,
//     onChange: (comments: Comment[]) => void,
//     onError?: (e: any) => void
//   ) => {
//     const q = query(
//       collection(db, "comments"),
//       where("postId", "==", postId),
//       orderBy("createdAt", "asc"),
//       limit(100)
//     );
//     const unsub = onSnapshot(
//       q,
//       (snap) => {
//         const list: Comment[] = snap.docs.map((d) => ({
//           commentId: d.id,
//           postId: (d.data() as any).postId || postId,
//           userId: (d.data() as any).userId || "",
//           comment: (d.data() as any).comment || "",
//           userNickname: (d.data() as any).userNickname || "",
//           userPhotoURL: (d.data() as any).userPhotoURL || "",
//           createdAt: (() => {
//             const c: any = (d.data() as any).createdAt;
//             if (!c) return "";
//             if (typeof c === "string") return c;
//             if (typeof c?.toDate === "function")
//               return c.toDate().toISOString();
//             if (c?.seconds) return new Date(c.seconds * 1000).toISOString();
//             return String(c);
//           })(),
//         }));
//         onChange(list);
//       },
//       (err) => onError?.(err)
//     );
//     return unsub;
//   };

//   const getComments = async (postId: string, max = 100): Promise<Comment[]> => {
//     const q = query(
//       collection(db, "comments"),
//       where("postId", "==", postId),
//       orderBy("createdAt", "asc"),
//       limit(max)
//     );
//     const snap = await getDocs(q);
//     return snap.docs.map((d) => {
//       const data = d.data() as any;
//       return {
//         commentId: d.id,
//         postId: data.postId || postId,
//         userId: data.userId || "",
//         comment: data.comment || "",
//         userNickname: data.userNickname || "",
//         userPhotoURL: data.userPhotoURL || "",
//         createdAt: (() => {
//           const c: any = data.createdAt;
//           if (!c) return "";
//           if (typeof c === "string") return c;
//           if (typeof c?.toDate === "function") return c.toDate().toISOString();
//           if (c?.seconds) return new Date(c.seconds * 1000).toISOString();
//           return String(c);
//         })(),
//       } as Comment;
//     });
//   };

//   return {
//     writePost,
//     getPostList,
//     getNextPostList,
//     getPostDetail,
//     updatePost,
//     deletePost,
//     addComment,
//     subscribeComments,
//     getComments,
//   };
// };

// // 외부에서 목록/상세 캐시를 비우기 위한 헬퍼 (닉네임/프로필 변경 시 사용)
// export const clearPostCaches = () => {
//   _listCache = null;
//   _detailCache.clear();
// };
