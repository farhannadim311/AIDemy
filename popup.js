document.getElementById("summary").addEventListener("click", () => requestContent("summarize"));
document.getElementById("quizifyButton").addEventListener("click", () => requestContent("quizify"));
document.getElementById("translateButton").addEventListener("click", () => requestContent("translate"));

function requestContent(action) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: action }, (response) => {
            displayContent(response.content);
        });
    });
}

function displayContent(content) {
    const contentDiv = document.getElementById("content");
    contentDiv.innerText = content || "No content available.";
}
