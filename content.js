(function() {
    const targetNodeTypes = ['P', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'DD', 'DT', 'CAPTION'];

    const minTextLength = 50;
    const maxElementsToProcess = 10;
    let processedCount = 0;
    let pendingElements = 0;

    function processSingleElement(element) {
        if (element.dataset.isModified) { return; }

        const originalText = element.textContent.trim();

        if (originalText.length < minTextLength) return;

        element.dataset.isModified = 'true';

        const originalHTML = element.innerHTML;
        element.dataset.oldState = originalHTML;
        element.innerHTML = `<em>Processing text for readability...</em>`;

        chrome.runtime.sendMessage(
            {action: "modifyText", text: originalText},
            function(response) {

                if (chrome.runtime.lastError) {
                    console.error("Runtime error:", chrome.runtime.lastError);
                    element.innerHTML = originalHTML;
                    element.dataset.isModified = 'error';
                    return;
                }

                if (response && response.response) {
                    element.innerHTML = response.response;
                } else if (response && response.error) {
                    console.error("Error modifying text:", response.error);
                    element.innerHTML = originalHTML;
                    element.dataset.isModified = 'error';
                } else {
                    element.innerHTML = originalHTML;
                    element.dataset.isModified = 'error';
                }
            }
        );
    }

    function resetSingleElement(element) {
        if (!element.dataset.isModified || element.dataset.isModified === 'error') { return; }

        if (element.dataset.oldState) {
            element.innerHTML = element.dataset.oldState;
            delete element.dataset.isModified;
            delete element.dataset.oldState;
            return true;
        }

        return false;
    }

    function processEntirePageElements(element) {
        if (element.dataset.isModified) { return; }

        const originalText = element.textContent.trim();

        if (originalText.length < minTextLength) return;
        if (processedCount >= maxElementsToProcess) return;

        element.dataset.isModified = 'true';
        processedCount++;
        pendingElements++;

        const originalHTML = element.innerHTML;
        element.dataset.oldState = originalHTML;
        element.innerHTML = `<em>Processing text for readability...</em>`;

        chrome.runtime.sendMessage(
            {action: "modifyText", text: originalText},
            function(response) {
                pendingElements--;

                if (chrome.runtime.lastError) {
                    console.error("Runtime error:", chrome.runtime.lastError);
                    element.innerHTML = originalHTML;
                    element.dataset.isModified = 'error';
                    return;
                }

                if (response && response.response) {
                    element.innerHTML = response.response;
                } else if (response && response.error) {
                    console.error("Error modifying text:", response.error);
                    element.innerHTML = originalHTML;
                    element.dataset.isModified = 'error';
                } else {
                    element.innerHTML = originalHTML;
                    element.dataset.isModified = 'error';
                }
            }
        );
    }

    function resetEntirePage() {
        let resetCount = 0;

        const modifiedElements = document.querySelectorAll('[data-is-modified="true"]');

        modifiedElements.forEach(element => {
            if (resetSingleElement(element)) {
                resetCount++;
            }
        });

        // Reset counters
        processedCount = 0;
        pendingElements = 0;

        return {
            status: resetCount > 0 ? 'success' : 'error',
            message: resetCount <= 0 ? 'No modified elements found' : ''
        };
    }

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === "processPage") {
            processedCount = 0;
            pendingElements = 0;

            targetNodeTypes.forEach(nodeType => {
                const elements = document.querySelectorAll(nodeType);
                elements.forEach(element => {
                    processEntirePageElements(element);
                });
            });
            sendResponse({status: 'success', count: processedCount});
        } else if (request.action === "processHighlightedText") {
            const selection = window.getSelection();
            if (!selection) {
                sendResponse({status: 'error', response: 'No text selected'});
                return true;
            }

            let text = selection.getRangeAt(0).toString().trim();
            if (!text) {
                sendResponse({status: 'error', response: 'Selected text is empty'})
                return true;
            }

            let container = selection.getRangeAt(0).commonAncestorContainer;

            // check if the container is a text node and if so, get it's parent element
            if (container.nodeType === 3) {
                container = container.parentElement;
                console.log(container.tagName)
            }

            // currently, we don't do any fancy checking beyond whether the actual container that the text is in is
            // listed as one of our target elements
            if (targetNodeTypes.includes(container.tagName)) {
                processSingleElement(container);
                sendResponse({status: 'success'});
            } else {
                sendResponse({status: 'error', message: 'Selected element is not a supported text element'});
            }
        } else if (request.action === "resetHighlightedText") {
            const selection = window.getSelection();
            if (!selection) {
                sendResponse({status: 'error', response: 'No text selected'});
                return true;
            }

            let text = selection.getRangeAt(0).toString().trim();
            if (!text) {
                sendResponse({status: 'error', response: 'Selected text is empty'})
                return true;
            }

            let container = selection.getRangeAt(0).commonAncestorContainer;

            // check if the container is a text node and if so, get it's parent element
            if (container.nodeType === 3) {
                container = container.parentElement;
                console.log(container.tagName)
            }

            // currently, we don't do any fancy checking beyond whether the actual container that the text is in is
            // listed as one of our target elements
            if (targetNodeTypes.includes(container.tagName)) {
                resetSingleElement(container);
                sendResponse({status: 'success'});
            } else {
                sendResponse({status: 'error', message: 'Selected element is not a supported text element'});
            }
        } else if (request.action === "resetEntirePage") {
            const result = resetEntirePage();
            sendResponse(result);
        } else if (request.action === "resetAllModifications") {
            const result = resetEntirePage();
            sendResponse(result);
        }

        return true;
    });
})();