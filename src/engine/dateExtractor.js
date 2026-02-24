const KEYWORDS = {
  POSITIVE: [
    /invoice date/i,
    /billing date/i,
    /bill date/i,
    /transaction date/i,
    /date:/i,
    /sold on/i,
    /service date/i,
  ],
  NEGATIVE: [
    /due date/i,
    /exp/i,
    /delivery date/i,
    /statement date/i,
    /printed/i,
    /shipped/i,
  ],
};

// This regex looks for MM/DD/YYYY, MM-DD-YYYY, or YYYY-MM-DD
// It also handles cases where OCR might put extra spaces
const DATE_REGEX = /(\d{1,4}[.\/\-]\d{1,2}[.\/\-]\d{1,4})/g;

export function extractDate(text) {
  if (!text) return null;

  const dateMatches = [];
  let match;

  // 1. Find every date in the document
  while ((match = DATE_REGEX.exec(text)) !== null) {
    const rawDate = match[0];
    const parsedDate = parseDateString(rawDate);

    if (parsedDate) {
      dateMatches.push({
        date: parsedDate,
        index: match.index,
        raw: rawDate,
      });
    }
  }

  if (dateMatches.length === 0) return null;

  // 2. Score the matches
  let bestMatch = null;
  let highestScore = -100;

  dateMatches.forEach((match) => {
    let score = 0;

    // Context check: look at the 40 characters before the date
    const start = Math.max(0, match.index - 40);
    const context = text.substring(start, match.index).toLowerCase();

    // Add points for "good" keywords
    KEYWORDS.POSITIVE.forEach((re) => {
      if (re.test(context)) score += 20;
    });

    // Subtract points for "bad" keywords
    KEYWORDS.NEGATIVE.forEach((re) => {
      if (re.test(context)) score -= 20;
    });

    // Tie-breaker: Prefer dates appearing earlier in the text (top of the page)
    const positionPenalty = (match.index / text.length) * 10;
    score -= positionPenalty;

    if (score > highestScore) {
      highestScore = score;
      bestMatch = match.date;
    }
  });

  return bestMatch;
}

/**
 * Helper to turn a string like "01/28/2026" into a JS Date object
 */
function parseDateString(str) {
  // Replace common OCR errors: 'l' or 'I' with '1', 'O' with '0'
  const cleanStr = str.replace(/[lI]/g, "1").replace(/[O]/g, "0");
  const d = new Date(cleanStr);

  // Ensure it's a valid date and not in the distant future
  if (isNaN(d.getTime())) return null;

  // Basic sanity check: Reject dates from before 1990 or more than 1 year in the future
  const year = d.getFullYear();
  const currentYear = new Date().getFullYear();
  if (year < 1990 || year > currentYear + 1) return null;

  return d;
}
