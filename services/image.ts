import { storage } from "@/firebase.config";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

interface ImageItem {
  uri: string;
  remote?: boolean;
}

const uploadLocalImages = async (images: ImageItem[]) => {
  const uploaded: string[] = [];
  for (let i = 0; i < images.length; i++) {
    try {
      const res = await fetch(images[i].uri);
      if (!res.ok) continue;
      const blob = await res.blob();
      const storageRef = ref(storage, `images/post_${Date.now()}_${i}.jpg`);
      await uploadBytes(storageRef, blob as any, {
        contentType: (blob as any)?.type || "image/jpeg",
      });
      const url = await getDownloadURL(storageRef);
      uploaded.push(url);
    } catch (e) {
      console.warn("이미지 업로드 실패", images[i].uri, e);
    }
  }
  return uploaded;
};

export { uploadLocalImages };
