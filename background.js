importScripts('config.js');

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "modifyText") {
        // Handle message
        handleModifyText(request, sender, sendResponse);

        // Return true immediately to keep the port open
        return true;
    }
});

async function handleModifyText(request, sender, sendResponse) {
    try {
        // Modify to match your config object structure
        const apiKey = config.OPENAI_API_KEY // or config.OPENAI_API_KEY, whatever you defined

        if (!apiKey) {
            console.error("No API key found in config");
            sendResponse({error: "API key not found"});
            return;
        }

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o", // Or whatever model you prefer
                messages: [
                    {
                        role: "system",
                        content: "You are an assistant that helps make text more readable for people with dyslexia. Simplify complex sentences, avoid idioms, use clear language, and organize information clearly. Keep the same meaning but make it easier to read."
                    },
                    {
                        role: "user",
                        content: request.text
                    }
                ],
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            sendResponse({error: errorData.error?.message || "API request failed"});
            return;
        }

        const data = await response.json();
        sendResponse({response: data.choices[0].message.content});
    } catch (error) {
        console.error("Error in background script:", error);
        sendResponse({error: error.toString()});
    }
}