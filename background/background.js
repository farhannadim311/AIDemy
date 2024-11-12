console.log("Loaded");
chrome.tabs.onUpdated.addListener((tabID, tab) => {
    if (tab.url && tab.url.includes("youtube.com/watch")) {
      const queryParameters = tab.url.split("?")[1];
      const urlParameters = new URLSearchParams(queryParameters);
      console.log(urlParameters)
      chrome.tabs.sendMessage(tabID, {
        type: "NEW", 
        videoID: urlParameters.get("v"), // Extract the video ID from URL parameters
      });
    }
  });
chrome.runtime.onInstalled.addListener(() => {
  const apiKey = "YOUR_API_KEY_HERE";
  chrome.storage.sync.set({ geminiApiKey: apiKey });
  console.log("API key set.");
});

// Listen for requests from other parts of the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_API_KEY") {
      chrome.storage.sync.get("geminiApiKey", (data) => {
          sendResponse({ apiKey: data.geminiApiKey });
      });
      return true; // Keeps the messaging channel open for async sendResponse
  }
});
