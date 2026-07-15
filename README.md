# 🎤 Dime quién canta — Beta GitHub

Primera beta funcional para smartphone del juego **Dime quién canta**.

## Incluye

- Diseño móvil vertical con estética retro/neón.
- Partidas de 10 rondas.
- Fragmentos musicales sintetizados de aproximadamente 10 segundos.
- Selección aleatoria del patrón musical en cada reproducción.
- Cuatro respuestas por ronda.
- Puntuación por rapidez y bonus de racha.
- Estadísticas y récord guardados en el dispositivo.
- PWA instalable y compatible con GitHub Pages.
- Sin dependencias externas.

## Importante

Esta demo **no contiene canciones comerciales**. Los fragmentos son patrones sintetizados originales generados en el navegador con Web Audio API. Para un lanzamiento comercial con grabaciones reales será necesario disponer de las licencias correspondientes.

## Probar localmente

Puedes abrir `index.html` directamente, aunque para probar el modo PWA es mejor usar un servidor local:

```bash
python3 -m http.server 8080
```

Después abre `http://localhost:8080`.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub.
2. Sube todos los archivos de esta carpeta.
3. Abre **Settings → Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**.
5. Elige la rama `main` y la carpeta `/root`.
6. Guarda los cambios.

## Próxima evolución sugerida

- Catálogo musical autorizado conectado a un backend.
- Inicio de sesión y sincronización.
- Modo 80, modo 90 y música española.
- Clasificación online.
- Retos diarios.
- Avatares, logros y tienda cosmética.

Todas las versiones futuras deben ser acumulativas y conservar las funciones existentes.
