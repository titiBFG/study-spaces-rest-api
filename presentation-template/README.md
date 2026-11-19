# Template portable · Study Spaces

Base editable inspirada en la presentación Copa América: fondo animado de línea
de producción, pickups procedurales, paleta oscura, índice, fragmentos y pantalla
completa. Es un nuevo deck reutilizable, no una copia exacta de la presentación
original. La presentación existente en `../presentation/` sigue disponible.

## En la otra computadora

Cloná el repositorio o actualizá la rama `feat/presentation-revealjs`. Abrí la raíz
del proyecto en VS Code/Copilot. El agente está versionado en
`.github/agents/reveal-presenter.agent.md`; seleccioná **reveal-presenter** en el
selector de agentes (recargá la ventana si no aparece). Para instalarlo globalmente
en Copilot CLI, copiá ese archivo a `~/.copilot/agents/`.

Desde la raíz del repositorio, con Python 3.11+:

```sh
python presentation-template/serve.py
```

Abrí **http://127.0.0.1:8010/**. Si el puerto está ocupado, agregá `--port 8011`.
No requiere npm, backend, credenciales ni internet. Requiere un navegador moderno.

### Pedido sugerido al agente

> Adaptá presentation-template/ a la presentación académica de Study Spaces.
> Revisá README.md, ROADMAP.md y el código relevante. Conservá el fondo procedural
> de fábrica, las transiciones y el índice. Usá la presentación de presentation/
> como referencia de contenido y verificá sus afirmaciones contra el código actual.
> No inventes métricas ni resultados de tests. Preguntame duración, integrantes y
> recorrido de demo antes de decidir el contenido final. Trabajá en
> presentation-template/.

## Edición y controles

- `index.html`: contenido, orden, fragmentos y notas del orador en `aside.notes`.
- `styles.css`: tipografía, paleta y layout responsive.
- `main.js`: navegación Reveal y ciclo de vida del fondo.
- `scene/factory.js`: geometría procedural original, sin modelos descargados.
- `vendor/reveal/`: runtime local fijado en Reveal.js 6.0.2 y licencia MIT.
- Flechas / Espacio: avanzar por fragmentos y slides; izquierda: volver.
- **I**: índice. **F** o botón superior: pantalla completa. **Esc**: salir/cerrar.
- `?static`: fondo quieto. También respeta la preferencia de movimiento reducido.
- Notas disponibles como contenido de autor; no se incluye el plugin speaker view.
- Imprimir desde el navegador muestra las slides y todos los fragmentos.

Las consignas del deck son placeholders, no una validación del estado del proyecto.
La demo de Study Spaces todavía debe integrarse: no hay iframe ni backend incluido.

## Procedencia y alcance

El fondo usa la alternativa Canvas con proyección 3D de la presentación Copa América:
vehículos genéricos, operarios, pórticos y cinta en movimiento. No es el renderer
WebGL con el modelo detallado Ranger. La fábrica es una ilustración decorativa,
no representa datos ni una relación funcional con Study Spaces.

No se distribuyen `ranger.glb`, Three.js, imágenes/video, marcas, capturas, datos,
geometrías de planta ni la aplicación interna de Ford. El agente se copia del
perfil local de Copilot del autor (`author-alias: titi`). No necesita MCP ni un
modelo específico. Esta carpeta contiene solamente recursos locales del template.

Reveal.js: Copyright (C) 2011-2026 Hakim El Hattab; licencia MIT incluida en
`vendor/reveal/LICENSE`. Sitio del proyecto: https://revealjs.com/.
