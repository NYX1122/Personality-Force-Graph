document.addEventListener('DOMContentLoaded', () => {
  const pixelRatio = window.devicePixelRatio || 1;

  const canvas = document.querySelector('canvas');
  const context = canvas.getContext('2d');

  // Displayed size
  const displayedWidth = canvas.offsetWidth;
  const displayedHeight = canvas.offsetHeight;

  // Set actual size in memory (scaled to account for pixel ratio)
  canvas.width = displayedWidth * pixelRatio;
  canvas.height = displayedHeight * pixelRatio;

  // Scale the context to ensure correct drawing operations
  context.scale(pixelRatio, pixelRatio);

  // Ensure canvas CSS size matches its displayed size (not its in-memory size)
  canvas.style.width = displayedWidth + 'px';
  canvas.style.height = displayedHeight + 'px';

  let transform = d3.zoomIdentity; // Initialize transform for zoom

  fetch('./graphData.json')
    .then((response) => response.json())
    .then((graphData) => {
      const simulation = d3
        .forceSimulation(graphData.nodes)
        .force(
          'link',
          d3
            .forceLink(graphData.links)
            .id((d) => d.id)
            .distance(0)
            .strength(
              (d) =>
                (d.weight * d.weight * d.weight * d.weight * d.weight) /
                100000000
            )
        )
        .force('charge', d3.forceManyBody().strength(-1000).theta(1))
        .force(
          'center',
          d3.forceCenter(displayedWidth / 2, displayedHeight / 2)
        )
        .alphaDecay(0)
        .on('tick', draw); // Call draw function on tick

      const zoom = d3
        .zoom()
        .scaleExtent([0.1, 10])
        .on('zoom', (event) => {
          transform = event.transform;
          draw(); // Call draw function to apply zoom
        });

      d3.select(canvas).call(zoom);

      function draw() {
        context.save();
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.translate(transform.x, transform.y);
        context.scale(transform.k, transform.k);

        // Drawing links
        graphData.links.forEach((link) => {
          // Assuming link.source and link.target are objects with x, y, and color properties
          const gradient = context.createLinearGradient(
            link.source.x,
            link.source.y,
            link.target.x,
            link.target.y
          );
          gradient.addColorStop(0, link.source.color);
          gradient.addColorStop(1, link.target.color);

          context.beginPath();
          context.moveTo(link.source.x, link.source.y);
          context.lineTo(link.target.x, link.target.y);
          context.strokeStyle = gradient; // Use the gradient for the stroke style
          context.lineWidth = 5; // Increase the line width as needed
          context.stroke();
        });

        // Drawing nodes
        graphData.nodes.forEach((node) => {
          context.beginPath();
          context.arc(node.x, node.y, node.radius, 0, 2 * Math.PI, true);
          context.fillStyle = node.color;
          context.fill();

          // Draw the node name
          context.fillStyle = 'black'; // Text color
          context.textAlign = 'center'; // Align text horizontally centered
          context.textBaseline = 'middle'; // Align text vertically centered
          context.fillText(node.id, node.x, node.y);
        });

        context.restore();
      }
    })
    .catch((error) => console.error('Error fetching graph data:', error));
});
