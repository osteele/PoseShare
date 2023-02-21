/**
 * This module handles the gallery view.
 * It displays the current state of the room, with each person's pose.
 */

import p5 from "p5";
import { room } from "./room";
import * as d3 from "d3";
import { confidenceThreshold, setOffset } from "./pose";
import { createSkeleton } from "./skeleton";

let galleryScale = 1;

export function initializeGallery() {
  const svg = document.getElementById("gallery")!;
  let dragging = false;
  svg.onmousedown = () => {
    dragging = true;
  };
  svg.onmousemove = (e) => {
    if (dragging) {
      setOffset(e.offsetX / galleryScale, e.offsetY / galleryScale);
    }
  };
  document.onmouseup = () => (dragging = false);
}

export function updateGallery(p5: p5): void {
  const svg = document.getElementById("gallery")! as unknown as SVGSVGElement;
  d3.select(svg).style("cursor", "pointer");
  svg.innerHTML = "";

  const { rows, cols } = room;
  const galleryWidth = svg.width.animVal.value;
  const galleryHeight = svg.height.animVal.value;
  const unscaledWidth = p5.width;
  const unscaledHeight = p5.height;
  const scale = (galleryScale = p5.min(
    galleryWidth / cols / unscaledWidth,
    galleryHeight / rows / unscaledHeight
  ));
  const cellWidth = unscaledWidth * scale;
  const cellHeight = unscaledHeight * scale;

  for (const person of room.performers) {
    if (!person.pose) continue;
    const { row, col } = person;
    const color = person.isSelf ? "white" : `hsl(${person.hue}, 100%, 50%)`;
    const background = person.isSelf
      ? "hsla(0, 0%, 50%, 30%)"
      : `hsla(${person.hue}, 100%, 50%, 10%)`;

    const svg_id = `gallery-person-${person.id}`;
    let cell = svg.getElementById(svg_id);
    if (!cell) {
      cell = document.createElementNS("http://www.w3.org/2000/svg", "g");
      cell.setAttribute("id", svg_id);
      svg.appendChild(cell);
    }
    if (`translate(${col * cellWidth} ${row * cellHeight})`.match(/NaN/))
      debugger;
    cell.setAttribute(
      "transform",
      `translate(${col * cellWidth} ${row * cellHeight})`
    );

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("transform", `scale(${scale})`);
    cell.appendChild(g);
    // dim squares of disconnected performers
    if (!person.connected) {
      d3.select(cell).attr("filter", "saturate(5%) blur(1px)");
    }

    // add a rectangle for the pose outline
    d3.select(cell)
      .append("rect")
      .attr("fill", background)
      .attr("stroke", color)
      .attr("width", cellWidth - 1)
      .attr("height", cellHeight - 1);

    // add text for the person.name
    d3.select(g)
      .append("text")
      .attr("x", unscaledWidth / 2)
      .attr("y", "1em")
      .attr("text-anchor", "middle")
      // .attr('dominant-baseline', 'text-top')
      .attr("font-size", 100)
      .attr("fill", "hsla(0, 0%, 100%, 25%)")
      .text(person.name);

    // add circles for the keypoints
    d3.select(g)
      .selectAll("circle")
      .data(person.pose.keypoints)
      .enter()
      .append("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 10)
      .attr("display", (d) =>
        d.score >= confidenceThreshold ? "inline" : "none"
      )
      .attr("fill", color);

    // add lines for the bones
    d3.select(g)
      .selectAll("line")
      .data(createSkeleton(person.pose))
      .enter()
      .append("line")
      .attr("x1", (d) => d[0].x)
      .attr("y1", (d) => d[0].y)
      .attr("x2", (d) => d[1].x)
      .attr("y2", (d) => d[1].y)
      .attr("display", (d) =>
        Math.min(d[0].score, d[1].score) >= confidenceThreshold
          ? "inline"
          : "none"
      )
      .attr("stroke", color)
      .attr("stroke-width", 2);

    // // add a rectangle that removes the colors
    // d3.select(cell)
    //   .append('rect')
    //   .attr('fill', 'white')
    //   // .attr('stroke', 'transparent')
    //   .attr('width', cellWidth - 1)
    //   .attr('height', cellHeight - 1)
  }
}
