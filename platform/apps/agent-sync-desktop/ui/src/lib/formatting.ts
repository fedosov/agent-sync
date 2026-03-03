export function compactPath(path: string | null | undefined): string {
  if (!path) {
    return "-";
  }
  const segments = path.split("/").filter(Boolean);
  if (segments.length <= 3) {
    return path;
  }
  return `/${segments[0]}/.../${segments[segments.length - 1]}`;
}
