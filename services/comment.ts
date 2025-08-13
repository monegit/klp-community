import { db } from "@/firebase.config";
import { CreateCommentRequest } from "@/types/comment";
import { PostResponse } from "@/types/post";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  QueryDocumentSnapshot,
  where,
} from "firebase/firestore";

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

export { fetchComment, fetchCommentedList };
