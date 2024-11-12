console.log("Loaded");

let currentVideo = "";
let subs = "";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateText`;

// Listener for incoming messages
chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, videoID } = obj;
    if (type === "NEW") {
        currentVideo = videoID;
        // Fetch transcript and store it in `subs`
        YoutubeTranscript.fetchTranscript(videoID)
            .then(transcriptData => {
                // Extract only the text from each entry and join into a single string
                subs = transcriptData.map(entry => entry.text).join(" ");
                console.log("Transcript fetched:", subs);  // Output the concatenated transcript text

                // Store transcript in Chrome storage for later retrieval
                chrome.storage.sync.set({ [currentVideo]: subs });
            })
            .catch(error => {
                console.error("Error fetching transcript:", error);
            });
    }
});

// Function to fetch stored video data from Chrome storage
const fetchVideo = () => {
    return new Promise((resolve) => {
        chrome.storage.sync.get([currentVideo], (obj) => {
            resolve(obj[currentVideo] || "");  // Return an empty string if no transcript found
        });
    });
};

// Function to summarize transcript with Vertex AI
async function summarizeTranscript() {
    if (!subs || subs === "") {
        console.error("No transcript available to summarize.");
        return "No transcript available to summarize.";
    }

    // Get the API key
    const apiKey = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: "GET_API_KEY" }, (response) => {
            resolve(response.apiKey || null);
        });
    });

    if (!apiKey) {
        console.error("API key not available.");
        return "API key not found.";
    }

    const prompt = "As an expert writer with more than a decade of experience, please summarize the following in under 125 words:\n\n";
    const req = {
        prompt: {
            parts: [`${prompt}${subs}`]
        },
        parameters: { maxOutputTokens: 2048, temperature: 0.5, topP: 0.2, topK: 5 }
    };

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req)
        });

        const data = await response.json();
        const summary = data?.candidates?.[0]?.output || "No summary generated.";
        console.log("Summary:", summary);
        return summary;

    } catch (error) {
        console.error("Error fetching summary:", error);
        return "Failed to generate summary.";
    }
}

// Example of invoking the summarize function correctly
summarizeTranscript().then(summary => {
    console.log("Summary generated:", summary);
});

Document.addEventListener("DOMContentLoaded", () => {
    const summaryButton = document.getElementsByClassName("summary");
    if (summaryButton) {
        summaryButton.addEventListener("click", async () => {
            console.log("1");
            const summary = await summarizeTranscript();
            // Display summary in the popup, e.g., in an element with ID "summary-output"
            document.getElementById("summary-output").textContent = summary;
        });
    }
});

/*async function quizifyTranscript() {
    const transcript = await fetchTranscript();
    // Use OpenAI API to generate quiz questions
    const quiz = await fetchAIService("quizify", transcript);
    displayResult("Quiz", quiz);
}

async function translateTranscript(language = "es") {
    const transcript = await fetchTranscript();
    const translation = await fetchAIService("translate", transcript, language);
    displayResult(`Translation (${language})`, translation);
}

// Dummy function to simulate AI service calls (replace with actual API calls)
async function fetchAIService(action, text, language = "en") {
    let result;
    switch (action) {
        case "summarize":
            result = `Summarized: ${text.substring(0, 200)}...`;
            break;
        case "quizify":
            result = `Q1. ${text.substring(0, 50)}?`;
            break;
        case "translate":
            result = `Translated (${language}): ${text.substring(0, 200)}...`;
            break;
    }
    return result;
}
    */

