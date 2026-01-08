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
