export function copyText(text: string) {
  uni.setClipboardData({
    data: text,
    success: function () {
      uni.showToast({ title: "复制成功", icon: "success", duration: 3000 });
    },
  });
}

export function navigateTo(url: string, params: Record<string, string | number> = {}) {
  const queryString = Object.keys(params)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join("&");
  uni.navigateTo({ url: queryString ? `${url}?${queryString}` : url });
}

export function formatDateTime(value: string | number | Date): string {
  const normalized = typeof value === "string"
    ? value.replace(/^(\d{4}-\d{2}-\d{2})\s/, "$1T")
    : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return [
    `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
  ].join(" ");
}
