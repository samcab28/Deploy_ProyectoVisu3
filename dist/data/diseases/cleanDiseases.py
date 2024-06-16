import json

with open('C:/users/samir/Visualizacion/Proyecto3/data/diseases/diseases.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

nodes = data.get('nodes', [])
edges = data.get('edges', [])

# Guardar nodos en NodeEurosis.json
with open('NodeDiseases.json', 'w', encoding='utf-8') as f:
    json.dump(nodes, f, indent=4)

# Guardar aristas en EdgeEurosis.json
with open('EdgeDiseases.json', 'w', encoding='utf-8') as f:
    json.dump(edges, f, indent=4)
