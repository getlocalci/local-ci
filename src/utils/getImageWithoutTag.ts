// Images can have the tag at the end, like image-name:tag.
// So this gets the image name without the tag.
export default function getImageWithoutTag(image: string): string {
  const trimmedImage = image.trim();
  const pattern = /([^\s]+):[^\s]+$/;

  return trimmedImage.match(pattern)
    ? (trimmedImage.match(pattern) as Array<string>)[1]
    : trimmedImage;
}
