/* global document, acquireVsCodeApi */

(function () {
  function addLicenseHandlers() {
    const vscode = acquireVsCodeApi();

    document
      .getElementById('take-survey')
      .addEventListener('click', () =>
        vscode.postMessage({ type: 'takeSurvey' })
      );

    document
      .getElementById('enter-license')
      .addEventListener('click', () =>
        vscode.postMessage({ type: 'enterLicense' })
      );

    document
      .getElementById('retry-license-validation')
      .addEventListener('click', () =>
        vscode.postMessage({ type: 'retryLicenseValidation' })
      );
  }

  // Mainly copied from @wordpress/dom-ready https://github.com/WordPress/gutenberg/blob/3da717b8d0ac7d7821fc6d0475695ccf3ae2829f/packages/dom-ready/src/index.js#L31
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    addLicenseHandlers();
  } else {
    document.addEventListener( 'DOMContentLoaded', addLicenseHandlers );
  }
})();
