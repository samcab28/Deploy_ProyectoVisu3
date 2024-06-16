let nodes, links;
let simulation; // Definimos la variable simulation a nivel global
let numAlphaDecay = 30; //definicion del aphadecay de manera automatica

// Carga de datos de nodos
d3.json('cleanDataDiseases/NodeDiseases.json').then(data => {
    nodes = data;
    // Asignamos posiciones aleatorias iniciales a los nodos
    nodes.forEach(node => {
        node.x = Math.random() * width;
        node.y = Math.random() * height;
    });
    initializeSimulation();
}).catch(error => {
    console.error('Error:', error);
});

// Carga de datos de enlaces
d3.json('cleanDataDiseases/EdgeDiseases.json').then(data => {
    links = data;
    initializeSimulation();
}).catch(error => {
    console.error('Error:', error);
});

// Configuración de la ventana
const width = window.innerWidth * 0.8; 
const height = window.innerHeight * 0.8; 
const svg = d3.select('svg')
    .attr('width', width)
    .attr('height', height)
    .style('border', '1px solid black'); // Agregar borde negro

// Definir el comportamiento de zoom
const zoom = d3.zoom()
    .scaleExtent([0.5, 5]) // Configurar los límites de zoom
    .on('zoom', zoomed);

svg.call(zoom);

const container = svg.append('g'); // Contenedor para los elementos de la visualización

function zoomed(event) {
    container.attr('transform', event.transform);
}

// Función para resetear el zoom
function resetZoom() {
    svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity,
        d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
    );
}

// Función de inicialización de la simulación
function initializeSimulation() {
    if (!nodes || !links) return;

    const linkElements = svg.append('g')
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

    const nodeElements = svg.append('g')
        .selectAll('circle')
        .data(nodes)
        .enter().append('circle')
        .attr('r', getNodeSize) // Usar el tamaño basado en el atributo 'size'
        .attr('fill', getNodeColor)
        .call(dragDrop);

    const textElements = svg.append('g')
        .selectAll('text')
        .data(nodes)
        .text(node => node.attributes.label)
        .attr('font-size', 15)
        .attr('dx', 15)
        .attr('dy', 4);

    nodeElements.on('click', (event, node) => {
        // Restaurar estilos de todos los nodos
        nodeElements.attr('stroke', 'none').attr('stroke-width', 0);
    
        // Resaltar el nodo seleccionado
        d3.select(event.target)
            .attr('stroke', 'black')  
            .attr('stroke-width', 3); 
    
        //informacion de los nodos
        const nodeInfo = document.getElementById('nodeInfo');
        nodeInfo.innerHTML = `
            <h3>Node Information</h3>
            <p><strong>Nombre enfermedad:</strong> ${node.attributes.label}</p>
            <p><strong>Color:</strong> ${node.attributes.color}</p>
            <p><strong>Size:</strong> ${node.attributes.size}</p>
            <p><strong>Descripcion 1:</strong> ${node.attributes['0']}</p>
            <p><strong>Descripcion 2:</strong> ${node.attributes['1']}</p>
            <p><strong>X:</strong> ${node.x}</p>
            <p><strong>Y:</strong> ${node.y}</p>
        `;
        nodeInfo.style.display = 'block';
    });

    simulation = d3.forceSimulation(nodes) // Asignamos la simulación a la variable global
        .force('link', d3.forceLink(links)
            .id(link => link.key)
            .strength(link => link.weight)
        )
        .force('charge', d3.forceManyBody().strength(-50)) // Reducir la fuerza de repulsión
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(node => getNodeSize(node) + 10)) // Ajustar el radio de colisión según el tamaño del nodo
        .force('x', d3.forceX().strength(0.1)) // Fuerza de atracción hacia un punto central en X
        .force('y', d3.forceY().strength(0.1)) // Fuerza de atracción hacia un punto central en Y
        .alphaDecay(1 - Math.pow(0.001, 1 / numAlphaDecay)); // Ajustar alphaDecay para estabilizar

    simulation
        .on('tick', () => {
            // Restringir nodos dentro del recuadro
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

// Función de arrastrar y soltar
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

// Función para actualizar el alphaDecay
function updateAlphaDecay() {
    const alphaDecayInput = document.getElementById('alphaDecay').value;
    numAlphaDecay = alphaDecayInput;
    simulation.alphaDecay(1 - Math.pow(0.001, 1 / numAlphaDecay));
    simulation.alpha(1).restart(); // Reiniciar la simulación para aplicar los cambios
}
