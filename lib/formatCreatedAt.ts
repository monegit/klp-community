export const formatCreatedAt = (input: any): string => {
  if (!input) return "";
  // Firestore Timestamp 형태 처리
  if (typeof input?.toDate === "function") {
    try {
      return input.toDate().toLocaleString();
    } catch {}
  }
  if (typeof input?.seconds === "number") {
    return new Date(input.seconds * 1000).toLocaleString();
  }
  if (input instanceof Date) {
    return input.toLocaleString();
  }
  if (typeof input === "string" || typeof input === "number") {
    const d = new Date(input);
    return isNaN(d.getTime()) ? String(input) : d.toLocaleString();
  }
  return "";
};
