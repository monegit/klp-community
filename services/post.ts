import { db } from "@/firebase.config";
import { PostResponse } from "@/types/post";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  startAfter,
} from "firebase/firestore";

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

export { fetchPosts };
