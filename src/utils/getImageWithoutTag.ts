// Images can have the tag at the end, like image-name:tag.
// So this gets the image name without the tag.
export default function getImageWithoutTag(image: string): string {
  const pattern = /([^:]+):[^\s]+$/;
  return image.match(pattern)
    ? (image.match(pattern) as Array<string>)[1]
    : image;
}
