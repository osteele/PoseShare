function updateGallery() {
  const svg = document.getElementById('gallery');

  const activePerformers = [...performers];
  // synthesize some more performers, for debugging purposes
  // let srcIndex = 0;
  // while (activePerformers.length > 0 && activePerformers.length < 4) {
  //   const src = activePerformers[srcIndex++];
  //   activePerformers.push({ ...src, id: src.id + '-1' });
  // }

  const rows = ceil(sqrt(activePerformers.length));
  const cols = ceil(activePerformers.length / rows);
  const width = svg.width.animVal.value;
  const height = svg.height.animVal.value;
  const cellWidth = min(width / cols, height / rows);
  const scale = cellWidth / 640;
  const cellHeight = 480 * scale;

  let row = -1, col = cols;
  for (const person of activePerformers) {
    if (++col >= cols) {
      col = 0;
      row++;
    }
    if (!person.pose) continue;

    let g = svg.getElementById(person.id);
    if (!g) {
      g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('id', person.id);
      svg.appendChild(g);
    }
    const color = `hsl(${person.hue}, 100%, 50%)`;
    g.setAttribute('transform', `translate(${col * cellWidth}, ${row * cellHeight
      }) scale(${scale})`);
    g.innerHTML = '';
    // add text for the person.name
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '320');
    text.setAttribute('y', '20');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('font-size', '40');
    text.setAttribute('fill', 'white');
    text.textContent = person.name;
    g.appendChild(text);

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
    border.setAttribute('stroke-width', 3);
    border.setAttribute('width', 640 - 5);
    border.setAttribute('height', 480 - 5);
    g.appendChild(border);
  }
}
