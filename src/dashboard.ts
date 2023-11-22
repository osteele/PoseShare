import { performersEmitter } from "./performers";
import { Performer } from "./types";

const dashboardElement = document.getElementById("dashboard")!;

export function initialize() {
  if (!dashboardElement) {
    console.error("dashboard.initialize: no dashboard element");
    return;
  }
  console.log("dashboard.initialize");
  performersEmitter.on("performers", updateDashboard);
}

function updateDashboard(performers: Performer[]) {
  // The system is initialized with some "dummy" participants.
  // Filter them out.
  const activePerformers = performers.filter(
    ({ pose, connected }) => pose && connected
  );
  document.getElementById(
    "dashboard-title"
  )!.innerHTML = `${activePerformers.length} participants`;
  dashboardElement.innerHTML =
    `<table><tr><th>Name</th><th>Recency</th><th>Position</th>` +
    activePerformers
      .map((performer) => {
        return `<tr>
        <td>${performer.name}</td>
        <td>${Number(new Date()) - performer.timestamp} ms</td>
        <td>(${performer.col}, ${performer.row})</td>
      </tr>`;
      })
      .join("") +
    `</table>`;
}
