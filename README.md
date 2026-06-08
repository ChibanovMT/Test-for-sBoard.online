# Pixi.js + Skia (CanvasKit) — тестовое задание

Приложение на TypeScript, которое:

- рендерит `PIXI.Container` в **Pixi.js** (`forceCanvas: true`, `pixi.js-legacy@7.2.4`);
- дублирует сцену через обёртку **Skia (CanvasKit)**;
- экспортирует результат в **векторный PDF** (Skia PDF backend, кастомная WASM-сборка `canvaskit-pdf`);
- поддерживает `pointerDown` / `pointerUp` на обоих canvas.

## Быстрый старт

```bash
npm install
npm run dev
```

Откройте http://localhost:3000

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер Vite |
| `npm run build` | Проверка TypeScript + production-сборка |
| `npm run preview` | Просмотр production-сборки |

## Структура проекта

```
src/
  pixi/           — Pixi Application и фабрики сцен
  skia/           — обёртка Pixi → Skia, PDF-экспорт
  events/         — события на Pixi и Skia canvas
  app.ts          — связывание UI и рендеров
public/
  canvaskit-pdf.wasm  — WASM с PDF backend (копируется при postinstall)
```

## Ключевые модули

- `src/skia/PixiToSkiaRenderer.ts` — обёртка `convertPixiContainerToSkia`
- `src/skia/graphicsRenderer.ts` — Graphics (rect, ellipse, lines, polygons)
- `src/skia/pdfExporter.ts` — векторный PDF через `MakePDFDocument`

## UI

- **Случайная фигура** — добавляет `PIXI.Graphics` в текущую сцену
- **← / → Сцена** — переключение между 3 подготовленными контейнерами
- **Экспорт PDF** — скачивание векторного PDF

## Технологии

- TypeScript, Vite
- `pixi.js-legacy@7.2.4` + `forceCanvas: true`
- `html2pdf-skia` — поставляет Skia WASM с PDF backend (`@rollerbird/canvaskit-wasm-pdf` как вложенная зависимость, не публикуется отдельно в npm)

## PDF

Graphics (заливки, линии, фигуры) экспортируются как **векторные пути**.  
`PIXI.Sprite` встраивается как **bitmap** (по требованию задания).
