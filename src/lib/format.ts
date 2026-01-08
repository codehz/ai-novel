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
