(function() {
    const targetNodeTypes = ['P', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'DD', 'DT', 'CAPTION'];

    const minTextLength = 50;
    const maxElementsToProcess = 10;
    let processedCount = 0;
    let pendingElements = 0;

    function isVisible(element) {
        return element.offsetWidth > 0 || element.offsetHeight > 0;
    }

    function processElement(element) {
        if (element.dataset.isModified || !isVisible(element)) return;

        const originalText = element.textContent.trim();

        if (originalText.length < minTextLength) return;
        if (processedCount >= maxElementsToProcess) return;

        element.dataset.isModified = 'true';
        processedCount++;
        pendingElements++;

        const originalHTML = element.innerHTML;
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

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === "processPage") {
            processedCount = 0;
            pendingElements = 0;

            targetNodeTypes.forEach(nodeType => {
                const elements = document.querySelectorAll(nodeType);
                elements.forEach(element => {
                    processElement(element);
                });
            });
            sendResponse({status: 'success', count: processedCount});
        }

        return true;
    });
})();