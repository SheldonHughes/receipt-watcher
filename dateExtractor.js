import * as chrono from "chrono-node";

export function extractDate(text) {
  const results = chrono.parse(text);

  if (!results.length) return null;

  return results[0].start.date();
}
