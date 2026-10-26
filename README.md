# Creaciones Amara 💖

Página web de **Creaciones Amara**: detalles y regalos personalizados hechos a mano en Mariquita, Tolima.
*"Tú lo imaginas y nosotros lo creamos"*

Sitio estático (HTML, CSS y JavaScript puros, sin compilación) publicado con GitHub Pages.

## Estructura

```
index.html          Página completa
css/styles.css      Estilos (mobile-first)
js/main.js          Encabezado, menú, productos, confeti, burbuja, efectos
js/hero.js          Caja de regalo 3D, pétalos y mariposas
js/armador.js       Asistente "Arma tu detalle" y mensaje de WhatsApp
js/galeria.js       Muro polaroid y visor de fotos
assets/img/         Fotos (WebP + JPG, versión de 600 px y grande)
assets/favicon.svg  Ícono de corazón
```

## Cómo actualizar la página

1. Edita los archivos (textos en `index.html`, fotos en `assets/img/`).
2. Sube los cambios a la rama `main` (`git add . && git commit -m "cambio" && git push`).
   GitHub Pages publica la nueva versión sola en 1 o 2 minutos.

También puedes editar un archivo directo en github.com (ícono del lápiz → "Commit changes").

### Cambiar o agregar fotos

Usa fotos de máximo 1200 px de ancho. Para cada foto se usan dos formatos: `.webp` y `.jpg`
(con el mismo nombre). Las tarjetas y la galería usan la versión `-600`.

### Datos pendientes (marcados con `<!-- TODO -->` en el código)

- Dirección exacta, horarios, Instagram y TikTok (no se publicaron porque no se entregaron).
- Precios (a propósito no se muestran).
- Si el usuario de GitHub cambia, actualiza las URL absolutas de las etiquetas Open Graph en `index.html`.
