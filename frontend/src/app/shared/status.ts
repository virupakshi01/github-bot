import { BadgeTone } from "./ui/badge/badge.component";

export function eventStatusTone(status: string): BadgeTone {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "PROCESSING":
      return "warning";
    case "FAILED":
      return "danger";
    default:
      return "info"; // RECEIVED
  }
}

export function actionStatusTone(status: string): BadgeTone {
  return status === "SUCCESS" ? "success" : "danger";
}
