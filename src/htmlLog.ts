export function appendToLog(message: any) {
  const elt = document.querySelector("#log")!;
  const line = document.createElement("code");
  const ts = new Date().toISOString().replace(/.+T(.{5}).+/, "$1");
  line.innerText = `${ts} — ${message}\n`;
  elt.appendChild(line);
  // Prune the HTML log
  while (document.querySelectorAll("#log code").length > 20) {
    document.querySelector("#log code")!.remove();
  }
}
