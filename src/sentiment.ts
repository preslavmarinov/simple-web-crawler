const Sentiment = require("sentiment");

const sentiment = new Sentiment();

export function analyzeSentiment(text: string) {
    return sentiment.analyze(text);
}

export function scoreToLabel(score: number): string {
    if (score > 0) return "Positive";
    if (score < 0) return "Negative";
    return "Neutral";
}