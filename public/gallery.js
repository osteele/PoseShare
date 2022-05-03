const syntheticPerformersMatch = document.location.hash.match(/synthetics(?:=(\d+))?/);
const synthesizePerformers = syntheticPerformersMatch === null ? 0 : Number(syntheticPerformersMatch[1] || 0);

function updateGallery() {
  const svg = document.getElementById('gallery');

  let activePerformers = performers;
  if (synthesizePerformers) {
    // synthesize some more performers, for debugging purposes
    activePerformers = [...activePerformers];
    let srcIndex = 0;
    while (activePerformers.length > 0 && activePerformers.length < synthesizePerformers) {
      const src = activePerformers[srcIndex++];
      activePerformers.push({ ...src, id: src.id + '-1', hue: src.hue + 30 });
    }
  }

  const rows = ceil(sqrt(activePerformers.length));
  const cols = ceil(activePerformers.length / rows);
  const width = svg.width.animVal.value;
  const height = svg.height.animVal.value;
  const scale = min(width / cols / 640, height / rows / 480);
  const cellWidth = 640 * scale;
  const cellHeight = 480 * scale;

  let row = -1, col = cols;
  for (const person of activePerformers) {
    if (++col >= cols) {
      col = 0;
      row++;
    }
    if (!person.pose) continue;

    let cell = svg.getElementById(person.id);
    if (!cell) {
      cell = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      cell.setAttribute('id', person.id);
      svg.appendChild(cell);
    }
    const color = `hsl(${person.hue}, 100%, 50%)`;
    cell.setAttribute('transform', `translate(${col * cellWidth} ${row * cellHeight})`);
    cell.innerHTML = '';

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `scale(${scale})`);
    cell.appendChild(g);

    // add text for the person.name
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', cellWidth / 2);
    text.setAttribute('y', 18);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('font-size', 20);
    text.setAttribute('fill', 'hsla(0, 0%, 100%, 25%)');
    text.textContent = person.name;
    cell.appendChild(text);

    // add circles for the keypoints
    for (const { score, position } of person.pose.pose.keypoints) {
      if (score < confidenceThreshold) continue;
      let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', position.x);
      circle.setAttribute('cy', position.y);
      circle.setAttribute('r', '10');
      circle.setAttribute('fill', color);
      g.appendChild(circle);
    }

    // add lines for the bones
    for (const [p1, p2] of person.pose.skeleton) {
      if (min(p1.score, p2.score) < confidenceThreshold) continue;
      let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', p1.position.x);
      line.setAttribute('y1', p1.position.y);
      line.setAttribute('x2', p2.position.x);
      line.setAttribute('y2', p2.position.y);
      line.setAttribute('stroke', color);
      line.setAttribute('stroke-width', '2');
      g.appendChild(line);
    }

    // add a rectangle for the pose outline
    const border = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    border.setAttribute('fill', `hsla(${person.hue}, 100%, 50%, 10%)`);
    border.setAttribute('stroke', color);
    // border.setAttribute('stroke-width', 2);
    border.setAttribute('width', cellWidth - 1);
    border.setAttribute('height', cellHeight - 1);
    cell.appendChild(border);
  }
}
