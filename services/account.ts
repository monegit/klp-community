import { db } from "@/firebase.config";
import { AccountProfile } from "@/types/account";
import {
  collection,
  documentId,
  getDocs,
  query,
  where,
} from "firebase/firestore";

type AccountIdsMap = Record<string, AccountProfile>;

const fetchAccountProfileImages = async (
  userIds: string[]
): Promise<AccountIdsMap> => {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  const result: AccountIdsMap = {};

  if (uniqueIds.length === 0) return result;

  const chunkSize = 10;

  for (let i = 0; i < uniqueIds.length; i += chunkSize) {
    const chunk = uniqueIds.slice(i, i + chunkSize);

    try {
      const q = query(
        collection(db, "users"),
        where(documentId(), "in", chunk)
      );
      const snapshot = await getDocs(q);

      snapshot.forEach((doc) => {
        result[doc.id] = {
          nickname: doc.data().nickname || "",
          profileImageURL: doc.data().photoURL || "",
        };
      });
    } catch (error) {
      console.warn("fetchAccountProfileImages 실패", error);
    }
  }

  return result;
};

export { fetchAccountProfileImages };
