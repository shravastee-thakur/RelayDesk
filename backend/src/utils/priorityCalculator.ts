export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export const calculatePriority = (
  title: string,
  description: string,
): TicketPriority => {
  const text = `${title} ${description}`.toLowerCase();

  const urgentKeywords = [
    "payment failed",
    "money deducted",
    "server down",
    "cannot login",
    "account locked",
  ];
  if (urgentKeywords.some((keyword) => text.includes(keyword))) {
    return "URGENT";
  }

  const highKeywords = ["not working", "error", "crash", "freeze", "bug"];
  if (highKeywords.some((keyword) => text.includes(keyword))) {
    return "HIGH";
  }

  const lowKeywords = ["question", "how to", "feature request", "suggestion"];
  if (lowKeywords.some((keyword) => text.includes(keyword))) {
    return "LOW";
  }

  return "MEDIUM";
};
