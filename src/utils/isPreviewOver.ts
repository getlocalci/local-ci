const previewLengthInMilliseconds = 172800000; // 2 days.

export default function isPreviewOver(
  trialStartedTimeStamp: number | unknown
): boolean {
  return (
    !!trialStartedTimeStamp &&
    new Date().getTime() - Number(trialStartedTimeStamp) >
      previewLengthInMilliseconds
  );
}
