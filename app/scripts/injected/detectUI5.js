(function () {
    'use strict';

    /**
     * Create an object witch the initial needed information from the UI5 availability check.
     * @returns {Object}
     */
    function createResponseToContentScript() {
        var responseToContentScript = Object.create(null);
        var responseToContentScriptBody;
        var promise = Promise.resolve(responseToContentScript);

        responseToContentScript.detail = Object.create(null);
        responseToContentScriptBody = responseToContentScript.detail;

        if (window.sap && window.sap.ui) {
            responseToContentScriptBody.action = 'on-ui5-detected';
            responseToContentScriptBody.framework = Object.create(null);
            responseToContentScriptBody.framework.version = '';
            responseToContentScriptBody.framework.name = 'UI5';

            try {
              promise = sap.ui.getVersionInfo({async:true}).then(
                function(versionInfo) {
                  var frameworkInfo = versionInfo.gav || versionInfo.name;
                  responseToContentScriptBody.framework.version = versionInfo.version;
                  responseToContentScriptBody.framework.name = frameworkInfo.indexOf('openui5') !== -1 ? 'OpenUI5' : 'SAPUI5';
                  return responseToContentScript;
                },
                function() {
                  return responseToContentScript;
                }
              );
            } catch (e) {
              // ignore
            }

            // Check if the version is supported
            responseToContentScriptBody.isVersionSupported = !!sap.ui.require;

        } else {
            responseToContentScriptBody.action = 'on-ui5-not-detected';
        }

        return promise;
    }

    function createAndSendResponseToContentScript() {
        // Send information to content script
        createResponseToContentScript().then(function(response) {
          console.log("detectUI5 response: %o", response);
          document.dispatchEvent(new CustomEvent('detect-ui5-content', response));
        });
    }

    createAndSendResponseToContentScript();
    
    // Listens for event from injected script
    document.addEventListener('do-ui5-detection-injected', createAndSendResponseToContentScript, false);
}());
