document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('modify-page').addEventListener('click', function() {
        document.getElementById('status').textContent = 'Status: Processing page...';

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (!tabs[0]?.id) {
                document.getElementById('status').textContent = 'Status: No active tab foun.';
                return;
            }

            chrome.tabs.sendMessage(tabs[0].id, {action: "processPage"}, function(response) {
                if (chrome.runtime.lastError) {
                    console.error("Runtime error:", chrome.runtime.lastError);
                    document.getElementById('status').textContent = 'Status: Error - ' + chrome.runtime.lastError.message;
                    return;
                }

                if (response && response.status === 'success') {
                    document.getElementById('status').textContent =
                        `Status: Processing ${response.count} elements`;
                } else {
                    document.getElementById('status').textContent = 'Status: Error processing page';
                }
            });
        });
    });
});