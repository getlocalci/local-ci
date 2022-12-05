export default function sanitizeLicenseKey(licenseKey: string): string {
  return licenseKey.replace(/[^A-Za-z0-9_-]/g, '');
}
