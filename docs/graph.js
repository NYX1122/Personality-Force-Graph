// Updated sample data for nodes with color and radius

import graphData from './graphData.json' assert { type: 'json' };

const { nodes, links } = graphData;

// Select the SVG element and set its width and height
const svg = d3.select('svg'),
  width = window.innerWidth,
  height = window.innerHeight;

svg
  .attr('viewBox', `0 0 ${width} ${height}`)
  .style('width', '100%') // Make SVG responsive
  .style('height', 'auto'); // Maintain aspect ratio

// Create the definitions for gradients
const defs = svg.append('defs');

// Create a group (`g`) element to contain all graph elements
const g = svg.append('g');

let link = g.append('g').attr('class', 'links').selectAll('path');

let node = g.append('g').attr('class', 'nodes').selectAll('circle');

// Define the zoom behavior with initial scaling and translation to center the graph
const zoomHandler = d3
  .zoom()
  .on('zoom', (event) => {
    g.attr('transform', event.transform);
  })
  .scaleExtent([0.1, 4]);

svg
  .call(zoomHandler)
  .call(
    zoomHandler.transform,
    d3.zoomIdentity.translate(width / 2, height / 2).scale(1)
  );

// Initialize the force simulation
const simulation = d3
  .forceSimulation(nodes)
  .force(
    'link',
    d3
      .forceLink(links)
      .id((d) => d.id)
      .distance(0)
      .strength(
        (d) =>
          (d.weight * d.weight * d.weight * d.weight * d.weight) / 100000000
      )
  )
  .force('charge', d3.forceManyBody().strength(-1000).theta(1))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .alphaDecay(0)
  .on('tick', ticked);

// Function to handle the drag events
function dragstarted(event) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  event.subject.fx = event.subject.x;
  event.subject.fy = event.subject.y;
}

function dragged(event) {
  event.subject.fx = event.x;
  event.subject.fy = event.y;
}

function dragended(event) {
  if (!event.active) simulation.alphaTarget(0);
  event.subject.fx = null;
  event.subject.fy = null;
}

links.forEach((link, i) => {
  const sourceColor = nodes.find(
    (n) =>
      n.id === (typeof link.source === 'object' ? link.source.id : link.source)
  ).color;
  const targetColor = nodes.find(
    (n) =>
      n.id === (typeof link.target === 'object' ? link.target.id : link.target)
  ).color;

  const gradient = defs
    .append('linearGradient')
    .attr('id', `gradient-${i}`)
    .attr('gradientUnits', 'userSpaceOnUse')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', 0)
    .attr('y2', 0);

  gradient.append('stop').attr('offset', '0%').attr('stop-color', sourceColor);

  gradient
    .append('stop')
    .attr('offset', '100%')
    .attr('stop-color', targetColor);
});

// Create nodes and links with initial properties
link = link
  .data(links)
  .enter()
  .append('path')
  .attr('stroke-width', 5)
  .attr('stroke', (d, i) => `url(#gradient-${i})`);

const nodeEnter = g
  .append('g')
  .attr('class', 'nodes')
  .selectAll('g')
  .data(nodes)
  .enter()
  .append('g')
  .call(
    d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended)
  );

// Append a circle to each 'g'
nodeEnter
  .append('circle')
  .attr('r', (d) => d.radius)
  .attr('fill', (d) => d.color);

// Append text to each 'g'
nodeEnter
  .append('text')
  .attr('dy', '.35em') // Vertically center text
  .attr('text-anchor', 'middle') // Horizontally center text
  .attr('font-weight', 'bold')
  .style('fill', 'black') // Text color
  .text((d) => d.id);

// Ticked function to update positions and gradient orientations
function ticked() {
  link
    .attr(
      'd',
      (d) => `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`
    )
    .each(function (d, i) {
      defs
        .select(`#gradient-${i}`)
        .attr('x1', d.source.x)
        .attr('y1', d.source.y)
        .attr('x2', d.target.x)
        .attr('y2', d.target.y);
    });

  node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

  nodeEnter.attr('transform', (d) => `translate(${d.x}, ${d.y})`);
}

simulation.on('tick', ticked);
