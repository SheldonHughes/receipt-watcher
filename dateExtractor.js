const KEYWORDS = {
  POSITIVE: [
    /invoice date/i,
    /billing date/i,
    /transaction date/i,
    /date:/i,
    /sold on/i,
  ],
  NEGATIVE: [/due date/i, /exp/i, /delivery date/i, /statement date/i],
};

export function extractDate(text) {
  // 1. Find all potential dates (using your existing regex)
  // Let's assume your regex finds dates and their indices in the string
  const dateMatches = findAllDateMatches(text);

  if (dateMatches.length === 0) return null;
  if (dateMatches.length === 1) return dateMatches[0].date;

  let bestMatch = { date: dateMatches[0].date, score: 0 };

  dateMatches.forEach((match) => {
    let currentScore = 0;

    // 2. Look at the text immediately preceding the date (e.g., 40 characters)
    const context = text
      .substring(Math.max(0, match.index - 40), match.index)
      .toLowerCase();

    // 3. Score the context
    KEYWORDS.POSITIVE.forEach((re) => {
      if (re.test(context)) currentScore += 10;
    });
    KEYWORDS.NEGATIVE.forEach((re) => {
      if (re.test(context)) currentScore -= 10;
    });

    // 4. Tie-breaker: Usually, the date higher up in the document is the "main" one
    currentScore -= (match.index / text.length) * 5;

    if (currentScore > bestMatch.score) {
      bestMatch = { date: match.date, score: currentScore };
    }
  });

  return bestMatch.date;
}
