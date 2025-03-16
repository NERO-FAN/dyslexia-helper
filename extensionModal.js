document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('modify-page').addEventListener('click', function() {
        document.getElementById('status').textContent = 'Status: Processing page...';

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (!tabs[0]?.id) {
                document.getElementById('status').textContent = 'Status: No active tab found.';
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

    document.getElementById('modify-selected-text').addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (!tabs[0]?.id) {
                document.getElementById('status').textContent = 'Status: No active tab found';
                return;
            }

            chrome.tabs.sendMessage(tabs[0].id, {action: "processHighlightedText"}, function(response) {
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

    document.getElementById('reset-selected-text').addEventListener('click', function() {
        document.getElementById('status').className = 'status';
        document.getElementById('status').textContent = 'Status: Resetting Selected Text...';

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (!tabs[0]?.id) {
                document.getElementById('status').textContent = 'Status: No active tab found';
                return;
            }

            chrome.tabs.sendMessage(tabs[0].id, {action: "resetHighlightedText"}, function(response) {
                if (response && response.status === 'success') {
                    document.getElementById('status').className = 'status success';
                    document.getElementById('status').textContent = `Status: ${response.message}`;
                } else if (response && response.status === 'warning') {
                    document.getElementById('status').className = 'status';
                    document.getElementById('status').textContent = `Status: ${response.message}`;
                } else {
                    document.getElementById('status').className = 'status error';
                    document.getElementById('status').textContent = 'Status: Error resetting highlighted text';
                }
            });
        });
    });

    document.getElementById('reset-page-text').addEventListener('click', function() {
        document.getElementById('status').className = 'status';
        document.getElementById('status').textContent = 'Status: Resetting Page...';

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (!tabs[0]?.id) {
                document.getElementById('status').textContent = 'Status: No active tab found';
                return;
            }

            chrome.tabs.sendMessage(tabs[0].id, {action: "resetEntirePage"}, function(response) {
                if (response && response.status === 'success') {
                    document.getElementById('status').className = 'status success';
                    document.getElementById('status').textContent = `Status: ${response.message}`;
                } else if (response && response.status === 'warning') {
                    document.getElementById('status').className = 'status';
                    document.getElementById('status').textContent = `Status: ${response.message}`;
                } else {
                    document.getElementById('status').className = 'status error';
                    document.getElementById('status').textContent = 'Status: Error resetting entire page';
                }
            });
        });
    });

    document.getElementById('reset-all-modifications').addEventListener('click', function() {
        document.getElementById('status').className = 'status';
        document.getElementById('status').textContent = 'Status: Resetting All Modifications...';

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (!tabs[0]?.id) {
                document.getElementById('status').textContent = 'Status: No active tab found';
                return;
            }

            chrome.tabs.sendMessage(tabs[0].id, {action: "resetAllModifications"}, function(response) {
                if (response && response.status === 'success') {
                    document.getElementById('status').className = 'status success';
                    document.getElementById('status').textContent = `Status: ${response.message}`;
                } else if (response && response.status === 'warning') {
                    document.getElementById('status').className = 'status';
                    document.getElementById('status').textContent = `Status: ${response.message}`;
                } else {
                    document.getElementById('status').className = 'status error';
                    document.getElementById('status').textContent = 'Status: Error resetting all modifications';
                }
            });
        });
    });
});