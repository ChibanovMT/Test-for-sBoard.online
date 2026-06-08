import { App } from './app';

async function bootstrap(): Promise<void> {
  const pixiHost = document.getElementById('pixi-host');
  const skiaCanvas = document.getElementById('skia-canvas') as HTMLCanvasElement | null;
  const statusEl = document.getElementById('status');
  const logEl = document.getElementById('event-log');

  if (!pixiHost || !skiaCanvas || !statusEl || !logEl) {
    throw new Error('Не найдены элементы DOM');
  }

  const app = new App(pixiHost, skiaCanvas, statusEl, logEl);
  await app.init();

  document.getElementById('btn-random')?.addEventListener('click', () => app.addRandomShape());
  document.getElementById('btn-scene-prev')?.addEventListener('click', () => app.prevScene());
  document.getElementById('btn-scene-next')?.addEventListener('click', () => app.nextScene());
  document.getElementById('btn-export-pdf')?.addEventListener('click', () => app.exportPdf());
}

bootstrap().catch((error) => {
  console.error(error);
  const status = document.getElementById('status');
  if (status) {
    status.textContent = `Ошибка запуска: ${error instanceof Error ? error.message : String(error)}`;
  }
});
