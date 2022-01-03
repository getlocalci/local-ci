// See https://circleci.com/docs/2.0/caching/#using-keys-and-templates
// arch doesn't need to be replaced.
// @todo: implement .Revision
const dynamicCache: DynamicCache = {
  '.Branch': '$CIRCLE_BRANCH',
  '.BuildNum': '$CIRCLE_BUILD_NUM',
  '.Environment.variableName': '',
  '.Revision': '',
  epoch: 'date +%s',
};

export default function convertToBash(command: string): string {
  return command.replace(
    /{{(.+?)}}/g,
    (fullMatch: string, dynamicCommand: string) =>
      `$(${Object.keys(dynamicCache).reduce(
        (accumulator, original) =>
          accumulator
            .replace(original, dynamicCache[original as keyof DynamicCache])
            .replace(
              /checksum (\S+)/g,
              (fullMatch: string, fileName: string) =>
                `if [ -f ${fileName} ]; then shasum ${fileName} | awk '{print $1}'; fi`
            )
            .replace(
              /\.Environment\.(\S+)/,
              (fullMatch: string, envVar: string) => `echo $${envVar}`
            ),
        dynamicCommand
      )})`
  );
}
