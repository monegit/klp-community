// import { db } from "@/firebase.config";
// import {
//   collection,
//   documentId,
//   getDocs,
//   query,
//   where,
// } from "firebase/firestore";

// export interface UserProfileLite {
//   nickname?: string;
//   photoURL?: string;
// }

// export const fetchUserProfilesMap = async (
//   userIds: string[]
// ): Promise<Record<string, UserProfileLite>> => {
//   const unique = Array.from(new Set(userIds.filter(Boolean)));
//   const result: Record<string, UserProfileLite> = {};
//   if (unique.length === 0) return result;

//   const chunkSize = 10; // Firestore IN 제한
//   for (let i = 0; i < unique.length; i += chunkSize) {
//     const chunk = unique.slice(i, i + chunkSize);
//     try {
//       const q = query(
//         collection(db, "users"),
//         where(documentId(), "in", chunk)
//       );
//       const snap = await getDocs(q);
//       snap.forEach((d) => {
//         const u: any = d.data();
//         result[d.id] = {
//           nickname: u?.nickname ?? undefined,
//           photoURL: u?.profileImageURL ?? u?.photoURL ?? undefined,
//         };
//       });
//     } catch (e) {
//       console.warn("fetchUserProfilesMap 실패", e);
//     }
//   }
//   return result;
// };
