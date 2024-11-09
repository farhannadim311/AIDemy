const xml2js = require('xml2js');    // Import xml2js to parse XML

async function getAvailableSubtitles(videoID) {
    const url = `http://video.google.com/timedtext?type=list&v=${videoID}`;
    const response = await fetch(url);
    const xml = await response.text();

    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xml);
    
    return result.transcript_list.track || []; // Array of subtitle options
}

async function fetchTranscript(videoID, lang, name = null, translateTo = null) {
    const baseUrl = `http://video.google.com/timedtext?lang=${lang}&v=${videoID}`;
    const url = name
        ? `${baseUrl}&name=${name}`
        : baseUrl;

    const finalUrl = translateTo ? `${url}&tlang=${translateTo}` : url;
    const response = await fetch(finalUrl);
    const transcriptXML = await response.text();

    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(transcriptXML);

    if (result.transcript && result.transcript.text) {
        const transcriptText = result.transcript.text
            .map(textNode => textNode._)
            .join(" ");
        return transcriptText;
    } else {
        console.log("Transcript not available for the specified language or subtitle track.");
        return null;
    }
}

// Example Usage
(async () => {
    const videoID = "7068mw-6lmI";
    const availableSubtitles = await getAvailableSubtitles(videoID);
    console.log("Available subtitles:", availableSubtitles);

    const lang = "en"; // Language code
    const name = "English"; // Subtitle track name (use null for auto-generated subtitles)
    const translateTo = "lv"; // Optional: Translate to Latvian

    const transcript = await fetchTranscript(videoID, lang, name, translateTo);
    if (transcript) {
        console.log("Transcript:", transcript);
    } else {
        console.log("No transcript found.");
    }
})();
GET https://www.googleapis.com/youtube/v3/captions/id