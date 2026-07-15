# Dime quién canta — Real Music Preview Beta

Beta web móvil preparada para GitHub Pages. Reproduce **previews oficiales reales** recuperadas en tiempo real desde el catálogo de Apple/iTunes Search y usa únicamente 10 segundos de cada preview.

## Funciones

- Canciones y artistas reales de los años 80 y 90.
- Fragmento variable de 10 segundos dentro de la preview disponible.
- Modos ¿Quién canta?, título, décadas, 80, 90, supervivencia, contrarreloj y experto.
- Perfil, carrera, eventos, colección, ranking local, tienda, logros y guardado automático.
- PWA instalable en smartphone.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo.
2. Sube todos los archivos de esta carpeta a la rama `main`.
3. Abre **Settings → Pages**.
4. Selecciona **Deploy from a branch**, rama `main`, carpeta `/root`.

## Importante

- La aplicación no almacena ni redistribuye canciones.
- La disponibilidad de cada preview depende del catálogo, país y condiciones del proveedor.
- Para un lanzamiento comercial, revisa y acepta las condiciones vigentes del proveedor y obtén asesoramiento sobre las licencias necesarias.
- El conector musical está aislado en `resolvePreview()` para poder sustituirlo por MusicKit, Deezer u otro proveedor autorizado.
