const previewLengthInMilliseconds = 172800000; // 2 days.

export default function isPreviewExpired(
  trialStartedTimeStamp: number | unknown
): boolean {
  return (
    !!trialStartedTimeStamp &&
    new Date().getTime() - Number(trialStartedTimeStamp) >
      previewLengthInMilliseconds
  );
}
