// RAG color for a risk from its likelihood + impact (a 3x3 matrix).
// Kept in its own module (not actions.ts) because a "use server" file may only
// export async functions, and this is a plain synchronous helper.
//
//            impact:  low     medium   high
//   likelihood low    green   green    amber
//   likelihood med    green   amber    red
//   likelihood high   amber   red      red
export function riskRag(
  likelihood: string,
  impact: string
): "red" | "amber" | "green" {
  const isHigh = (v: string) => v === "high";
  const isLow = (v: string) => v === "low";

  // red: both high, or one high and the other medium.
  if (
    (isHigh(likelihood) && isHigh(impact)) ||
    (isHigh(likelihood) && impact === "medium") ||
    (likelihood === "medium" && isHigh(impact))
  ) {
    return "red";
  }

  // green: both low, or one low and the other not high (low+low, low+med, med+low).
  if (
    (isLow(likelihood) && !isHigh(impact)) ||
    (isLow(impact) && !isHigh(likelihood))
  ) {
    return "green";
  }

  // amber: everything else (medium+medium, low+high, high+low).
  return "amber";
}
