import json

# Leer datos desde el archivo JSON original
with open('C:/Users/samir/Visualizacion/Proyecto3/data/school/cleanDataSchool/EdgeSchool.json', 'r') as file:
    data = json.load(file)

# Crear una lista con los campos requeridos
filtered_data = []
for item in data:
    filtered_item = {
        "source": item["source"],
        "target": item["target"],
        "weight": item["attributes"]["weight"]
    }
    filtered_data.append(filtered_item)

# Escribir los datos filtrados en un nuevo archivo JSON
with open('EdgeSchool.json', 'w') as file:
    json.dump(filtered_data, file, indent=4)

print("Datos filtrados guardados en 'filtered.json'")
