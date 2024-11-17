document.addEventListener("DOMContentLoaded", () => {
    const summaryButton = document.querySelector(".summary");
    const quizButton = document.querySelector(".quizify");
    const translateButton = document.querySelector(".translate-button");
    const languageSelect = document.querySelector("#language-select");
    const outputDiv = document.getElementById("output") || createOutputDiv();
    let quizData = "";
   

    // Event listener for Summary button
    if (summaryButton) {
        summaryButton.addEventListener("click", () => {
            const selectedLanguage = languageSelect.value || 'English';
            // Get the active tab
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const activeTab = tabs[0];

                // Send a message to the content script to get the summary
                chrome.tabs.sendMessage(activeTab.id, { action: "getSummary", language: selectedLanguage }, (response) => {
                    console.log("Selected language (popup.js):", selectedLanguage);
                    if (chrome.runtime.lastError) {
                        console.error("Error sending message to content script:", chrome.runtime.lastError);
                        outputDiv.textContent = "An error occurred while retrieving the summary.";
                        return;
                    }

                    if (response && response.summary) {
                        const formattedSummary = formatSummary(response.summary);
                        outputDiv.innerHTML = formattedSummary;
                    } else {
                        outputDiv.textContent = "No summary available. Please refresh the page and try again.";
                    }
                });
            });
        });
    } else {
        console.error("Summary button not found.");
    }

    // Event listener for Quizify button
    if (quizButton) {
        quizButton.addEventListener("click", () => {
            const selectedLanguage = languageSelect.value || 'English';
             console.log("Selected language (popup.js):", selectedLanguage);
            // Get the active tab
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const activeTab = tabs[0];

                // Send a message to the content script to get the quiz
                chrome.tabs.sendMessage(activeTab.id, { action: "getQuiz", language: selectedLanguage }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Error sending message to content script:", chrome.runtime.lastError);
                        outputDiv.textContent = "An error occurred while retrieving the quiz.";
                        return;
                    }

                    if (response && response.quiz) {
                        try {
                            quizData = response.quiz;
                            console.log("this is in popup.js");
                            console.log(quizData);
                            displayQuiz(quizData.questions);
                        } catch (e) {
                            console.error("Error parsing quiz data:", e);
                            outputDiv.textContent = "An error occurred while processing the quiz.";
                        }
                    } else {
                        outputDiv.textContent = "No quiz available. Please refresh the page and try again.";
                    }
                });
            });
        });
    } else {
        console.error("Quizify button not found.");
    }




    // Helper functions

    function createOutputDiv() {
        const newDiv = document.createElement("div");
        newDiv.id = "output";
        newDiv.style.marginTop = "10px";
        document.body.appendChild(newDiv);
        return newDiv;
    }

    function formatSummary(summaryText) {
        // Format the summary text as desired
        return `<h3>Summary:</h3><p>${summaryText}</p>`;
    }

    function displayQuiz(questions) {
        outputDiv.innerHTML = ''; // Clear previous content
        const form = document.createElement('form');

        questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.classList.add('question');

            const queryP = document.createElement('p');
            queryP.textContent = `${index + 1}. ${question.query}`;
            questionDiv.appendChild(queryP);

            question.choices.forEach((choice, choiceIndex) => {
                const choiceLabel = document.createElement('label');
                choiceLabel.textContent = choice;

                const choiceInput = document.createElement('input');
                choiceInput.type = 'radio';
                choiceInput.name = `question${index}`;
                choiceInput.value = choiceIndex;
                console.log(`Creating radio button with name: ${choiceInput.name}, value: ${choiceInput.value}`);


                choiceLabel.prepend(choiceInput);
                questionDiv.appendChild(choiceLabel);
                questionDiv.appendChild(document.createElement('br'));
            });

            form.appendChild(questionDiv);
            form.appendChild(document.createElement('hr'));
        });

        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Submit Quiz';
        form.appendChild(submitButton);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // Process the quiz answers
            const formData = new FormData(form);
            const userAnswers = {};
            for (let [key, value] of formData.entries()) {
                userAnswers[key] = value;
            }

            // Send the user's answers to the content script to get the results
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const activeTab = tabs[0];

                // Send user's answers to content script
                chrome.tabs.sendMessage(activeTab.id, { action: "submitQuiz", userAnswers: userAnswers }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Error sending message to content script:", chrome.runtime.lastError);
                        outputDiv.textContent = "An error occurred while processing the quiz results.";
                        return;
                    }

                    if (response && response.results) {
                        displayQuizResults(response.results);
                    } else {
                        outputDiv.textContent = "Failed to get quiz results. Please try again.";
                    }
                });
            });
        });

        outputDiv.appendChild(form);
    }

    function displayQuizResults(results) {
        outputDiv.innerHTML = ''; // Clear previous content
        const resultsDiv = document.createElement('div');

        let correctCount = 0;

        results.forEach((result, index) => {
            const questionResultDiv = document.createElement('div');
            questionResultDiv.classList.add('question-result');

            const queryP = document.createElement('p');
            queryP.textContent = `${index + 1}. ${result.query}`;
            questionResultDiv.appendChild(queryP);

            const answerP = document.createElement('p');
            if (result.isCorrect) {
                answerP.textContent = `Your answer: ${result.userChoice} (Correct)`;
                answerP.style.color = 'green';
                correctCount++;
            } else {
                answerP.textContent = `Your answer: ${result.userChoice || 'No answer selected'} (Incorrect)`;
                answerP.style.color = 'red';
            }
            questionResultDiv.appendChild(answerP);

            const explanationP = document.createElement('p');
            explanationP.textContent = `Explanation: ${result.explanation}`;
            questionResultDiv.appendChild(explanationP);

            resultsDiv.appendChild(questionResultDiv);
            resultsDiv.appendChild(document.createElement('hr'));
        });

        const scoreP = document.createElement('p');
        scoreP.textContent = `You got ${correctCount} out of ${results.length} questions correct.`;
        resultsDiv.prepend(scoreP);

        outputDiv.appendChild(resultsDiv);
    }
    function formatSummary(summaryText) {
        // Use the version that best fits your needs (simple split or regex)
        // Here's the regex version for better flexibility
    
        // Regular expression to match key points
        const regex = /\*\s\*\*(.*?)\*\*(.*?)(?=\*\s\*\*|$)/gs;
        let match;
        const formattedLines = [];
    
        // Check for introductory text before the first key point
        const introMatch = summaryText.match(/^(.*?)\*\s\*\*/s);
        if (introMatch && introMatch[1].trim() !== '') {
            formattedLines.push(introMatch[1].trim());
        }
    
        // Loop through all matches
        while ((match = regex.exec(summaryText)) !== null) {
            const title = match[1].trim();
            const content = match[2].trim();
    
            const formattedTitle = `<strong>${title}</strong>`;
            const formattedKeyPoint = `${formattedTitle}: ${content}`;
    
            formattedLines.push(formattedKeyPoint);
        }
    
        // Join the formatted lines with line breaks
        const formattedSummary = formattedLines.join('<br><br>');
    
        return formattedSummary;
    }
});
