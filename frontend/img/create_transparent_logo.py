#!/usr/bin/env python3
"""
Script para crear logo con fondo transparente
"""
from PIL import Image

# Cargar imagen original
img = Image.open('logonuevoB.jpg')

# Redimensionar a 512x512
img = img.resize((512, 512), Image.Resampling.LANCZOS)

# Convertir a RGBA (necesario para transparencia)
img = img.convert("RGBA")

# Obtener datos de píxeles
datas = img.getdata()

# Crear nueva lista de píxeles
newData = []

# Umbral para detectar blanco (ajustable)
threshold = 240

for item in datas:
    # Si el píxel es blanco o casi blanco, hacerlo transparente
    if item[0] > threshold and item[1] > threshold and item[2] > threshold:
        # Hacer transparente (alpha = 0)
        newData.append((255, 255, 255, 0))
    else:
        # Mantener el píxel original
        newData.append(item)

# Actualizar datos de imagen
img.putdata(newData)

# Guardar como PNG
img.save("logo-google-ads-512-transparent.png", "PNG")

print("✅ Logo con fondo transparente creado: logo-google-ads-512-transparent.png")
print(f"   Tamaño: 512x512 px")
print(f"   Formato: PNG con transparencia")
