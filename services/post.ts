import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/firebase.config";
import { uploadImageAsync } from "@/lib/uploadImageAsync";
import { CreateCommentRequest } from "@/types/comment";
import { PostRequest, PostResponse } from "@/types/post";

const fetchPosts = async (
  lastPost?: QueryDocumentSnapshot<PostResponse>,
  postLimit: number = 10
) => {
  try {
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      ...(lastPost ? [startAfter(lastPost)] : []),
      limit(postLimit)
    );

    return await getDocs(q);
  } catch (error) {
    console.log("Error fetching posts:", error);
  }
};

const fetchPost = async (postId: string) => {
  try {
    const postData = doc(db, "posts", postId);
    const post = await getDoc(postData);

    return post.data() as PostResponse | undefined;
  } catch (error) {
    console.log("Error fetching post:", error);

    return undefined;
  }
};

const fetchComment = async (req: CreateCommentRequest) => {
  try {
    const collectionRef = collection(db, "comments");
    const docRef = await addDoc(collectionRef, {
      ...req,
      createdAt: new Date().toISOString(),
    });

    return docRef;
  } catch (error) {
    console.error("Error creating comment:", error);
  }
};

const fetchCommentedList = async (postId: string) => {
  try {
    const q = query(
      collection(db, "comments"),
      where("postId", "==", postId),
      orderBy("createdAt", "asc")
    );

    const response = await getDocs(q);

    return response;
  } catch (error) {
    console.error("Error fetching commented list:", error);
    return { docs: [] as QueryDocumentSnapshot<PostResponse>[] };
  }
};

const fetchPostDelete = async (postId: string) => {
  try {
    const response = await getDoc(doc(db, "posts", postId));

    if (!response.exists()) {
      console.error("Post does not exist:", postId);
      return;
    }

    await deleteDoc(response.ref);
  } catch (error) {
    console.error("Error deleting post:", error);
  }
};

const fetchPostUpdate = async (postId: string, data: Partial<PostRequest>) => {
  try {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, { ...data });
  } catch (error) {
    console.error("Error updating post:", error);
  }
};

const fetchPostWrite = async (postData: PostRequest) => {
  try {
    const imageUrls = postData.images.length
      ? await uploadImageAsync(postData.images, "post-image")
      : [];

    await addDoc(collection(db, "posts"), {
      ...postData,
      images: imageUrls,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error writing post:", error);
  }
};

export {
  fetchComment,
  fetchCommentedList,
  fetchPost,
  fetchPostDelete,
  fetchPosts,
  fetchPostUpdate,
  fetchPostWrite,
};
