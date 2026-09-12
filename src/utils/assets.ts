/** public/ 内资源必须拼接 BASE_URL，才能兼容 GitHub Pages 的仓库子路径。 */
export function publicAsset(path: string): string {
  const cleanPath = path.replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${cleanPath}`;
}
