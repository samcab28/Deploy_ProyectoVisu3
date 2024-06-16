let nodes, links;
let simulation;
let numAlphaDecay = 30;

d3.json('cleanDataEurosis/NodeEurosis.json').then(data => {
  nodes = data;
  nodes.forEach(node => {
      node.x = Math.random() * width;
      node.y = Math.random() * height;
  });
  initializeSimulation();
}).catch(error => {
  console.error('Error:', error);
});

d3.json('cleanDataEurosis/EdgeEurosis.json').then(data => {
  links = data;
  initializeSimulation();
}).catch(error => {
  console.error('Error:', error);
});

const width = window.innerWidth * 0.8; 
const height = window.innerHeight * 0.8; 
const svg = d3.select('svg')
    .attr('width', width)
    .attr('height', height)
    .style('border', '1px solid black');

const container = svg.append('g'); // Contenedor para los elementos de la visualización

const zoom = d3.zoom()
    .scaleExtent([0.5, 5])
    .on('zoom', zoomed);

svg.call(zoom);

function zoomed(event) {
    container.attr('transform', event.transform);
}

function resetZoom() {
    svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity,
        d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
    );
}

function initializeSimulation() {
    if (!nodes || !links) return;

    const linkElements = container.append('g')
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('stroke-width', 1)
        .attr('stroke', '#E5E5E5');

    function getNodeColor(node) {
        return node.attributes.color;
    }

    function getNodeSize(node) {
        return node.attributes.size;
    }

    const nodeElements = container.append('g')
        .selectAll('circle')
        .data(nodes)
        .enter().append('circle')
        .attr('r', getNodeSize)
        .attr('fill', getNodeColor)
        .call(dragDrop);

    const textElements = container.append('g')
        .selectAll('text')
        .data(nodes)
        .text(node => node.attributes.label)
        .attr('font-size', 15)
        .attr('dx', 15)
        .attr('dy', 4);

    nodeElements.on('click', (event, node) => {
        nodeElements.attr('stroke', 'none').attr('stroke-width', 0);

        d3.select(event.target)
            .attr('stroke', 'black')  
            .attr('stroke-width', 3); 

        const nodeInfo = document.getElementById('nodeInfo');
        nodeInfo.innerHTML = `
            <h3>Node Information</h3>
            <p><strong>Label:</strong> ${node.attributes.label}</p>
            <p><strong>Color:</strong> ${node.attributes.color}</p>
            <p><strong>Size:</strong> ${node.attributes.size}</p>
            <p><strong>Country:</strong> ${node.attributes['1']}</p>
            <p><strong>Info:</strong> ${node.attributes['2']}</p>
            <p><strong>X:</strong> ${node.x}</p>
            <p><strong>Y:</strong> ${node.y}</p>
        `;
        nodeInfo.style.display = 'block';
    });

    simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links)
            .id(link => link.key)
            .strength(link => link.weight)
        )
        .force('charge', d3.forceManyBody().strength(-50))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(20))
        .force('x', d3.forceX().strength(0.1))
        .force('y', d3.forceY().strength(0.1))
        .alphaDecay(1 - Math.pow(0.001, 1 / numAlphaDecay));

    simulation.on('tick', () => {
        nodeElements
            .attr('cx', node => node.x = Math.max(0, Math.min(width, node.x)))
            .attr('cy', node => node.y = Math.max(0, Math.min(height, node.y)));

        textElements
            .attr('x', node => node.x = Math.max(0, Math.min(width, node.x)))
            .attr('y', node => node.y = Math.max(0, Math.min(height, node.y)));

        linkElements
            .attr('x1', link => link.source.x)
            .attr('y1', link => link.source.y)
            .attr('x2', link => link.target.x)
            .attr('y2', link => link.target.y);
    });
}

const dragDrop = d3.drag()
    .on('start', (event, node) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        node.fx = node.x;
        node.fy = node.y;
    })
    .on('drag', (event, node) => {
        node.fx = event.x;
        node.fy = event.y;
    })
    .on('end', (event, node) => {
        if (!event.active) simulation.alphaTarget(0);
        node.fx = node.x;
        node.fy = node.y;
    });

function updateAlphaDecay() {
    const alphaDecayInput = document.getElementById('alphaDecay').value;
    numAlphaDecay = alphaDecayInput;
    simulation.alphaDecay(1 - Math.pow(0.001, 1 / numAlphaDecay));
    simulation.alpha(1).restart();
}
