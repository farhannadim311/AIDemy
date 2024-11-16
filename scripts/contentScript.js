console.log("Loaded");

let currentVideo = "";
let subs = " ";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { YoutubeTranscript } from 'youtube-transcript';
const genAI = new GoogleGenerativeAI("APIKEY");
const generativeModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

// Listener for incoming messages
chrome.runtime.onMessage.addListener(async (obj, sender, response) => {
    const { type, videoID } = obj;
    console.log("Transcript function started");
    if (type === "NEW") {
        currentVideo = videoID;
        try {
            // Fetch transcript and store it in `subs`
            const transcriptData = await YoutubeTranscript.fetchTranscript(videoID);
            // Extract only the text from each entry and join into a single string
            subs = transcriptData.map(entry => entry.text).join(" ");
            console.log("Transcript fetched:", subs);  // Output the concatenated transcript text

            // Store transcript in Chrome storage for later retrieval
            chrome.storage.sync.set({ [currentVideo]: subs });

            // Now that `subs` is populated, call `summarizeTranscript`
            const summary = await summarizeTranscript();
            console.log("Summary generated:", summary);

            // Now, call `quizifyTranscript`
            const quiz = await quizifyTranscript();
            console.log("Quiz Generated:", quiz);

            // Optionally, send a response back
            response({ summary, quiz });
        } catch (error) {
            console.error("Error fetching transcript or processing:", error);
            response({ error: "Failed to process transcript." });
        }
    }
    return true; // Indicate that the response is sent asynchronously
});

async function summarizeTranscript() {
    console.log("summarize loaded");
    if (!subs || subs.trim() === "") {
        console.error("No transcript available to summarize.");
        return;
    }
    const prompt = "Summarise the content in keypoints so that a student can understand the concepts by just reading your summary and not watching the video:\n\n" + subs;
    try {
        const result =  await generativeModel.generateContent(prompt);
        const summary = result.response.text();
        return summary;
    } catch (error) {
        console.error("Error generating summary:", error);
    }
}


async function quizifyTranscript() {
    console.log("summarize loaded");
    if (!subs || subs.trim() === "") {
        console.error("No transcript available to summarize.");
        return;
    }
    const prompt = "Provide me with 10 multiple choice questions about this video. Return your answer entirely in the form of a JSON object. The JSON object should have a key named 'questions' which is an array of the questions. Each quiz question should include the choices, the answer, and a brief explanation of why the answer is correct. Don't include anything other than the JSON. The JSON properties of each question should be 'query', 'choices', 'answer', and 'explanation. The choices shouldn't have any ordinal value like A, B, C, D or a number like 1,2,3,4.  The answer should be the 0-indexed number of the correct choice.\n\n" + subs;
    try {
        const result =  await generativeModel.generateContent(prompt);
        const quiz = result
        return quiz;
    } catch (error) {
        console.error("Error generating quiz:", quiz);
    }
}
