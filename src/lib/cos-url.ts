/**
 * 将 COS 私有桶 URL 转换为签名代理 URL
 */
export function toPublicUrl(url: string | null | undefined): string {
  if (!url) return "";
  // 已经是代理路径，不转换
  if (url.startsWith("/api/") || url.startsWith("/uploads/")) return url;
  // COS 私有桶 URL → 走签名代理
  if (url.includes(".cos.") || url.includes(".myqcloud.com")) {
    try {
      const u = new URL(url);
      return `/api/uploads/cos/${u.host}${u.pathname}`;
    } catch {
      return url;
    }
  }
  return url;
}
