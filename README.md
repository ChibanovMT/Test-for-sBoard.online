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

## Деплой на GitHub Pages

Сайт: https://chibanovmt.github.io/Test-for-sBoard.online/

**Важно:** на Pages нужно публиковать **сборку** (`dist/`), а не исходники.  
Если в консоли 404 на `main.ts` — значит задеплоен корень репозитория, а не `dist`.

### Автодеплой (рекомендуется)

1. Запушьте репозиторий с файлом `.github/workflows/deploy.yml`
2. На GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**
3. После push в `main` workflow соберёт проект и опубликует `dist/`

### Ручной деплой

```bash
npm run build
# загрузите **только содержимое** папки dist/ (не весь проект!)
```

В `vite.config.ts` для production задан `base: '/Test-for-sBoard.online/'`.

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
