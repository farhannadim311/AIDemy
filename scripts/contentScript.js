// content.js
function addAIDemyButton() {
    if (!document.querySelector("#aidemy-button")) {
        const button = document.createElement("button");
        button.id = "aidemy-button";
        button.innerText = "AIDemy";
        button.style.position = "absolute";
        button.style.top = "10px";
        button.style.right = "10px";
        button.style.zIndex = "1000";
        button.onclick = showOptions;
        document.body.appendChild(button);
    }
}

function showOptions() {
    const options = prompt("Choose an option: Summarise, Quizify, Translate").toLowerCase();
    if (options === "summarise") summarizeTranscript();
    else if (options === "quizify") quizifyTranscript();
    else if (options === "translate") translateTranscript();
}

// Check if the video title contains "Education"
function checkTitle() {
    const title = document.title || document.querySelector("h1.title").innerText;
    if (title && title.toLowerCase().includes("education")) {
        addAIDemyButton();
    }
}

checkTitle();
async function fetchTranscript() {
    const videoId = new URLSearchParams(window.location.search).get("v");
    const response = await fetch(`https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`);
    const transcriptXML = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(transcriptXML, "text/xml");
    const transcriptText = Array.from(xmlDoc.getElementsByTagName("text")).map(node => node.textContent).join(" ");
    return transcriptText;
}
async function summarizeTranscript() {
    const transcript = await fetchTranscript();
    // Use OpenAI API to get the summary
    const summary = await fetchAIService("summarize", transcript);
    displayResult("Summary", summary);
}

async function quizifyTranscript() {
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

function displayResult(title, content) {
    alert(`${title}:\n${content}`);
}
