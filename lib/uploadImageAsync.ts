import { storage } from "@/firebase.config";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export const uploadImageAsync = async (
  uris: string[],
  fileNamePrefix: string
) => {
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
