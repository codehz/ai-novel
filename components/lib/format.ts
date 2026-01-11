import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

/**
 * 格式化 JSON 数据为字符串
 * @param data 待格式化的数据
 * @returns 格式化后的 JSON 字符串或错误信息
 */
export const formatJson = (data: unknown): string => {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return "[Unserializable Object]";
  }
};

/**
 * 格式化日期为本地化字符串（SSR 安全）
 * @param date 待格式化的日期（可以是 Date、时间戳数字或 null/undefined）
 * @returns 格式化后的日期字符串，如 "2026年01月08日 10:30:45"，空值返回空字符串
 */
export const formatDateToLocaleString = (date: Date | number | null | undefined): string => {
  if (!date) return "";
  try {
    const dateObj = typeof date === "number" ? new Date(date) : date;
    return format(dateObj, "yyyy年MM月dd日 HH:mm:ss", { locale: zhCN });
  } catch {
    return "";
  }
};

/**
 * 格式化日期为简化的本地化字符串（仅月日时分）
 * @param date 待格式化的日期（可以是 Date、时间戳数字或 null/undefined）
 * @returns 格式化后的日期字符串，如 "1月08日 10:30"，空值返回空字符串
 */
export const formatDateToShortLocaleString = (date: Date | number | null | undefined): string => {
  if (!date) return "";
  try {
    const dateObj = typeof date === "number" ? new Date(date) : date;
    return format(dateObj, "M月dd日 HH:mm", { locale: zhCN });
  } catch {
    return "";
  }
};

/**
 * 检测字符串是否为有效 JSON
 * @param str 待检测的字符串
 * @returns 是否为有效 JSON
 */
export const isValidJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

/**
 * 格式化 JSON 内容字符串
 * @param content 原始内容字符串
 * @returns 格式化结果对象，包含 isJson 标记和 formatted 格式化后的内容
 */
export const formatJsonContent = (content: string): { isJson: boolean; formatted: string } => {
  if (isValidJSON(content)) {
    try {
      const parsed = JSON.parse(content);
      return {
        isJson: true,
        formatted: JSON.stringify(parsed, null, 2),
      };
    } catch {
      return { isJson: false, formatted: content };
    }
  }
  return { isJson: false, formatted: content };
};

/**
 * 通用下载函数
 * @param content 要下载的内容（字符串）
 * @param filename 下载文件的文件名（不含扩展名）
 * @param options 可选配置
 * @param options.type 内容 MIME 类型，默认自动检测（"application/json" 或 "text/plain"）
 * @param options.jsonPretty 是否对 JSON 内容进行格式化，默认 true
 */
export const downloadContent = (
  content: string,
  filename: string,
  options?: {
    type?: "json" | "text";
    jsonPretty?: boolean;
  },
): void => {
  const { type = "json", jsonPretty = true } = options ?? {};

  let finalContent: string;
  let mimeType: string;
  let finalFilename: string;

  if (type === "json") {
    try {
      const parsed = jsonPretty ? JSON.parse(content) : content;
      finalContent = JSON.stringify(parsed, null, 2);
      mimeType = "application/json";
      finalFilename = `${filename}.json`;
    } catch {
      finalContent = content;
      mimeType = "text/plain";
      finalFilename = `${filename}.txt`;
    }
  } else {
    finalContent = content;
    mimeType = "text/plain";
    finalFilename = `${filename}.txt`;
  }

  const blob = new Blob([finalContent], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = finalFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
