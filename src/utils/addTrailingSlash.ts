export default function addTrailingSlash(path: string): string {
  if (!path) {
    return path;
  }

  const trimmedPath = path.trim();
  return trimmedPath.match(/\/$/) ? trimmedPath : `${trimmedPath}/`;
}
