# Xcade
[![Deploy to GitHub Pages](https://github.com/sebasbrs/xcade/actions/workflows/deploy.yml/badge.svg)](https://github.com/sebasbrs/xcade/actions/workflows/deploy.yml)

Xcade es un portal de juegos gratuitos para navegador construido con Astro. El sitio consume el catálogo de GameMonetize, crea una página estática para cada juego y permite jugarlo directamente desde el navegador mediante un `iframe`. El proyecto también integra Google AdSense para la monetización del sitio.

## Cómo funciona

1. Durante el build, `src/lib/games.ts` consulta el feed JSON de GameMonetize:
	`https://gamemonetize.com/feed.php?format=0`.
2. Los datos recibidos se normalizan: se aplican valores por defecto, se convierten las dimensiones numéricas y se generan slugs únicos a partir del título.
3. La página principal muestra una selección inicial de juegos, categorías y búsqueda en el cliente.
4. La ruta `/games` genera un catálogo paginado con 12 juegos por página.
5. La ruta `/game/[name]` genera una página estática por juego. Allí se muestran su información, instrucciones, juegos relacionados y el reproductor embebido de GameMonetize.
6. Astro genera el sitio como archivos estáticos en `dist/`. La configuración usa `https://www.xcade.org` como URL canónica y genera un sitemap.

Si el feed no responde correctamente durante el build, Astro no puede obtener el catálogo y la generación de las páginas de juegos falla.

## Integración con GameMonetize

El proyecto no aloja los juegos. Usa la información del feed de GameMonetize y el campo `url` de cada registro para cargar el juego remoto en `src/components/gameview.astro`.

La normalización realizada en `src/lib/games.ts` incluye:

- título, descripción, miniatura, instrucciones, etiquetas y categoría;
- slug legible para las URLs, con sufijo automático cuando hay títulos duplicados;
- conversión de `width` y `height` a números;
- reemplazo de `gamemonetize.co` por `gamemonetize.games` cuando aparece en una URL;
- valores por defecto para datos ausentes.

El reproductor se muestra con permisos para pantalla completa, gamepad, pointer lock, scripts, formularios y ventanas emergentes, según lo que requiere el juego embebido.

## Monetización con Google AdSense

Google AdSense está preparado en dos lugares:

- `src/layouts/Main.astro` incluye el script oficial de AdSense en el `<head>` de todas las páginas y declara la cuenta `ca-pub-3442782683509797` mediante `google-adsense-account`.
- `public/ads.txt` publica las líneas de autorización para Google AdSense. Este archivo queda disponible en `https://www.xcade.org/ads.txt` después del despliegue.

El archivo `ads.txt` contiene los identificadores autorizados para la cuenta del sitio. Si cambia la cuenta de AdSense, hay que actualizar tanto el identificador del layout como la línea correspondiente de `public/ads.txt` y volver a desplegar.

El script de AdSense por sí solo no crea una posición visible de anuncio. Para mostrar anuncios, las unidades publicitarias deben configurarse en AdSense y añadirse al componente o página donde deban aparecer, respetando las políticas de Google y las restricciones del contenido de juegos.

## Estructura principal

```text
/
├── public/
│   └── ads.txt                  # Autorización de vendedores para AdSense
├── src/
│   ├── components/              # Tarjetas, reproductor, banner y SEO
│   ├── layouts/Main.astro       # HTML común, AdSense y metadatos
│   ├── lib/games.ts              # Feed y normalización de GameMonetize
│   ├── pages/
│   │   ├── index.astro           # Inicio y búsqueda
│   │   ├── game/[name].astro     # Detalle y reproducción de un juego
│   │   └── games/[...page].astro # Catálogo paginado
│   └── styles/global.css         # Estilos globales
├── astro.config.mjs              # Sitio, sitemap y salida estática
└── package.json
```

## Requisitos

- Node.js `>= 22.12.0`.
- pnpm.
- Acceso a Internet durante el build para consultar el feed de GameMonetize.

## Instalación y desarrollo

Instala las dependencias desde la raíz del proyecto:

```sh
pnpm install
```

Inicia el servidor local:

```sh
pnpm dev
```

El sitio estará disponible normalmente en `http://localhost:4321`.

## Build y preview

Genera el sitio estático de producción:

```sh
pnpm build
```

El resultado queda en `dist/`. Para revisarlo localmente antes del despliegue:

```sh
pnpm preview
```

## Despliegue

El despliegue debe publicar el contenido de `dist/` como un sitio estático y conservar:

- las rutas generadas `/`, `/games` y `/game/...`;
- el archivo `/ads.txt` en la raíz del dominio;
- el dominio canónico configurado en `astro.config.mjs`;
- acceso del navegador al script de AdSense y a los juegos embebidos.

Después de desplegar, conviene comprobar la página principal, una página de juego, `https://www.xcade.org/ads.txt` y la consola del navegador para detectar bloqueos del `iframe` o de AdSense.

## Comandos disponibles

| Comando | Descripción |
| :------ | :---------- |
| `pnpm install` | Instala las dependencias. |
| `pnpm dev` | Inicia el servidor de desarrollo. |
| `pnpm build` | Genera el sitio estático en `dist/`. |
| `pnpm preview` | Sirve localmente la compilación de producción. |
| `pnpm astro ...` | Ejecuta comandos de la CLI de Astro. |

## Tecnologías

- Astro 7.
- TypeScript.
- Tailwind CSS mediante Vite.
- Sitemap de Astro.
- GameMonetize Feed API.
- Google AdSense.
