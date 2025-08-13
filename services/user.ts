import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/firebase.config";
import { UserProfile } from "@/types/user";

type AccountIdsMap = Record<string, UserProfile>;

const fetchUserProfileImagesByIds = async (
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
      const response = await getDocs(q);

      response.forEach((doc) => {
        result[doc.id] = {
          nickname: doc.data().nickname || "",
          profileImageURL: doc.data().profileImageURL || "",
        };
      });
    } catch (error) {
      console.warn("fetchAccountProfileImages 실패", error);
    }
  }

  return result;
};

const fetchUserProfilesByIds = async (userIds: string[]) => {
  const result: AccountIdsMap = {};
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));

  if (uniqueIds.length === 0) return result;

  const chunkSize = 10;

  for (let i = 0; i < uniqueIds.length; i += chunkSize) {
    try {
      const q = query(
        collection(db, "users"),
        where(documentId(), "in", userIds)
      );

      const response = await getDocs(q);

      response.forEach((doc) => {
        const data = doc.data();
        result[doc.id] = {
          nickname: data.nickname || "",
          profileImageURL: data.profileImageURL || "",
        };
      });
    } catch (error) {
      console.warn("fetchUserProfilesByIds 실패", error);
    }
  }

  return result;
};

const fetchUserProfileById = async (userId: string): Promise<UserProfile> => {
  try {
    const response = await getDoc(doc(db, "users", userId));

    if (response.exists()) {
      const userData = response.data();

      return {
        nickname: userData.nickname ?? "",
        profileImageURL: userData.profileImageURL ?? "",
      };
    }

    return {
      nickname: "",
      profileImageURL: "",
    };
  } catch (error) {
    console.log("fetchUserProfileById 실패", error);

    return {
      nickname: "",
      profileImageURL: "",
    };
  }
};

export {
  fetchUserProfileById,
  fetchUserProfileImagesByIds,
  fetchUserProfilesByIds,
};
