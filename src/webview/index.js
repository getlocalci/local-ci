/* global document, acquireVsCodeApi */

(function () {
  const vscode = acquireVsCodeApi();
  document.getElementById('enter-license').addEventListener('click', () => {
    vscode.postMessage({ type: 'enterLicense' });
  });
})();
