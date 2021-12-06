/* global document, acquireVsCodeApi */

(function () {
  function addLicenseHandlers() {
    const vscode = acquireVsCodeApi();
    const listenerElements = {
      'take-survey': 'takeSurvey',
      'enter-license': 'enterLicense',
      'retry-license-validation': 'retryLicenseValidation',
    };

    Object.keys(listenerElements).forEach((elementId) => {
      const element = document.getElementById(elementId)
      if (element) {
        element.addEventListener('click', () =>
          vscode.postMessage({ type: listenerElements[elementId] })
        );
      }
    });
  }

  // Mainly copied from @wordpress/dom-ready https://github.com/WordPress/gutenberg/blob/3da717b8d0ac7d7821fc6d0475695ccf3ae2829f/packages/dom-ready/src/index.js#L31
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    addLicenseHandlers();
  } else {
    document.addEventListener( 'DOMContentLoaded', addLicenseHandlers );
  }
})();
