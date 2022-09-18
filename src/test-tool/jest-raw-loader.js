// jest-raw-loader compatibility with Jest version 28.
// Copied from https://github.com/keplersj/jest-raw-loader/pull/239#issuecomment-1192438360
module.exports = {
  process: (content) => {
    return {
      code: "module.exports = " + JSON.stringify(content),
    };
  },
};
