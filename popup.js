document.addEventListener("DOMContentLoaded", () => {
    const summaryButton = document.querySelector(".summary"); // Select the summary button
    const quizifyButton = document.querySelector(".quizify"); // Select the quizify button
    
    if (summaryButton) {
        summaryButton.addEventListener("click", async () => {
            console.log("Summary button clicked!");
            const summary = await summarizeTranscript();  // Ensure this function is defined
            document.getElementById("summary-output").textContent = summary;  // Update summary-output with the 
    } else {
        console.log("Quizify button not found.");
    }
});
