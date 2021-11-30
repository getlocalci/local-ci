/* global document, acquireVsCodeApi */

(function () {
  function addLicenseHandlers() {
    const vscode = acquireVsCodeApi();
    const elementListeners = {
      'enter-license': 'enterLicense',
      'retry-license-validation': 'retryLicenseValidation',
      'take-survey': 'takeSurvey',
    };

    Object.keys(elementListeners).forEach(
      (elementId) => {
        document
          .getElementById(elementId)
          .addEventListener('click', () =>
            vscode.postMessage({ type: elementListeners[elementId] })
          );
      }
    );
  }

  // Mainly copied from @wordpress/dom-ready https://github.com/WordPress/gutenberg/blob/3da717b8d0ac7d7821fc6d0475695ccf3ae2829f/packages/dom-ready/src/index.js#L31
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    addLicenseHandlers();
  } else {
    document.addEventListener( 'DOMContentLoaded', addLicenseHandlers );
  }
})();
