import type { CanvasKit } from '@rollerbird/canvaskit-wasm-pdf/types';
import type { Container } from 'pixi.js-legacy';
import { attachPixiStageLogging } from './events/PixiEventLogger';
import { SkiaInteraction } from './events/SkiaInteraction';
import { PixiApplication } from './pixi/PixiApplication';
import {
  addRandomShape,
  createDemoScene,
  createShapesScene,
  createSpriteScene,
  SCENE_HEIGHT,
  SCENE_WIDTH,
} from './pixi/sceneFactory';
import { initCanvasKit } from './skia/canvasKitInit';
import { downloadPdf, exportContainerToPdf } from './skia/pdfExporter';
import { PixiToSkiaRenderer } from './skia/PixiToSkiaRenderer';

type SceneFactory = () => Container | Promise<Container>;

export class App {
  private ck: CanvasKit | null = null;
  private skiaRenderer: PixiToSkiaRenderer | null = null;
  private pixiApp: PixiApplication | null = null;
  private currentScene: Container | null = null;

  private readonly scenes: { name: string; factory: SceneFactory }[] = [
    { name: 'Демо (из задания)', factory: createDemoScene },
    { name: 'Фигуры', factory: createShapesScene },
    { name: 'Спрайт PNG', factory: createSpriteScene },
  ];
  private sceneIndex = 0;

  constructor(
    private readonly pixiHost: HTMLElement,
    private readonly skiaCanvas: HTMLCanvasElement,
    private readonly statusEl: HTMLElement,
    private readonly logEl: HTMLElement,
  ) {}

  async init(): Promise<void> {
    this.setStatus('Загрузка CanvasKit (Skia WASM + PDF)...');
    this.ck = await initCanvasKit();
    this.skiaRenderer = new PixiToSkiaRenderer(this.ck);

    this.pixiApp = new PixiApplication(this.pixiHost);
    attachPixiStageLogging(this.pixiApp.app, (msg) => this.appendLog(msg));
    this.appendLog('Кликните по красному эллипсу или синему прямоугольнику на любом canvas');
    await this.loadScene(0);

    new SkiaInteraction(
      this.skiaCanvas,
      () => this.currentScene!,
      (msg) => this.appendLog(msg),
    );

    this.setStatus('Готово');
  }

  async loadScene(index: number): Promise<void> {
    this.sceneIndex = ((index % this.scenes.length) + this.scenes.length) % this.scenes.length;
    const sceneDef = this.scenes[this.sceneIndex];

    this.setStatus(`Загрузка: ${sceneDef.name}...`);
    const scene = await sceneDef.factory();
    this.currentScene = scene;

    this.pixiApp!.setScene(scene);
    this.syncSkia();
    this.setStatus(`Сцена: ${sceneDef.name}`);
  }

  nextScene(): void {
    void this.loadScene(this.sceneIndex + 1);
  }

  prevScene(): void {
    void this.loadScene(this.sceneIndex - 1);
  }

  addRandomShape(): void {
    if (!this.currentScene) {
      return;
    }
    addRandomShape(this.currentScene);
    this.syncSkia();
    this.setStatus('Добавлена случайная фигура');
  }

  exportPdf(): void {
    if (!this.ck || !this.currentScene) {
      return;
    }

    try {
      this.setStatus('Экспорт PDF...');
      const bytes = exportContainerToPdf(this.ck, this.currentScene, {
        width: SCENE_WIDTH,
        height: SCENE_HEIGHT,
        title: `Scene-${this.scenes[this.sceneIndex].name}`,
      });
      downloadPdf(bytes, `pixi-skia-scene-${this.sceneIndex + 1}.pdf`);
      this.setStatus(`PDF сохранён (${bytes.length} байт)`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.setStatus(`Ошибка PDF: ${message}`);
    }
  }

  private syncSkia(): void {
    if (!this.skiaRenderer || !this.currentScene) {
      return;
    }
    this.skiaRenderer.renderToCanvasElement(this.skiaCanvas, this.currentScene, {
      width: SCENE_WIDTH,
      height: SCENE_HEIGHT,
    });
  }

  private setStatus(text: string): void {
    this.statusEl.textContent = text;
  }

  private appendLog(message: string): void {
    const time = new Date().toLocaleTimeString();
    this.logEl.textContent = `${time} ${message}\n` + this.logEl.textContent;
  }
}
