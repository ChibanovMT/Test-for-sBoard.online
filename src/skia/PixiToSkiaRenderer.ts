import type { Canvas, CanvasKit, Image, Surface } from '@rollerbird/canvaskit-wasm-pdf/types';
import type { Container, DisplayObject, Matrix, Sprite } from 'pixi.js-legacy';
import { Graphics as PixiGraphics, Sprite as PixiSprite, Texture } from 'pixi.js-legacy';
import { renderGraphics } from './graphicsRenderer';
import { pixiMatrixToSkia } from '../utils/matrix';

export interface RenderOptions {
  width: number;
  height: number;
  /** Цвет фона (по умолчанию тёмно-серый). */
  backgroundColor?: [number, number, number, number];
}

const imageCache = new WeakMap<Texture, Image>();

/**
 * Обертка для отрисовки PIXI.Container через Skia (CanvasKit).
 * Поддерживает Graphics (фигуры, линии) и Sprite (растровые изображения).
 */
export class PixiToSkiaRenderer {
  constructor(private readonly ck: CanvasKit) {}

  /** Рендерит Pixi-контейнер на Skia Canvas. */
  renderContainer(canvas: Canvas, container: Container, options: RenderOptions): void {
    const bg = options.backgroundColor ?? [0.1, 0.13, 0.18, 1];
    canvas.clear(this.ck.Color4f(...bg));

    container.updateTransform();
    this.walkContainer(canvas, container);
  }

  /** Рендерит Pixi-контейнер на HTML canvas через Skia Surface. */
  renderToCanvasElement(htmlCanvas: HTMLCanvasElement, container: Container, options: RenderOptions): void {
    htmlCanvas.width = options.width;
    htmlCanvas.height = options.height;

    const surface = this.ck.MakeSWCanvasSurface(htmlCanvas);
    if (!surface) {
      throw new Error('Не удалось создать Skia surface');
    }

    const canvas = surface.getCanvas();
    this.renderContainer(canvas, container, options);
    surface.flush();
    surface.dispose();
  }

  /** Рендерит Pixi-контейнер в PDF-страницу (векторная графика + bitmap для Sprite). */
  renderToPdfPage(canvas: Canvas, container: Container, options: RenderOptions): void {
    this.renderContainer(canvas, container, options);
  }

  private walkContainer(canvas: Canvas, displayObject: DisplayObject): void {
    if (!displayObject.visible || displayObject.worldAlpha <= 0) {
      return;
    }

    if (displayObject instanceof PixiGraphics) {
      renderGraphics(this.ck, canvas, displayObject, displayObject.worldTransform);
    } else if (displayObject instanceof PixiSprite) {
      this.renderSprite(canvas, displayObject, displayObject.worldTransform);
    }

    const container = displayObject as Container;
    if (container.children?.length) {
      for (const child of container.children) {
        this.walkContainer(canvas, child);
      }
    }
  }

  private renderSprite(canvas: Canvas, sprite: Sprite, worldMatrix: Matrix): void {
    const texture = sprite.texture;
    if (!texture || texture === Texture.EMPTY) {
      return;
    }

    const image = this.getOrCreateImage(texture);
    if (!image) {
      return;
    }

    const skMatrix = pixiMatrixToSkia(worldMatrix);
    const paint = new this.ck.Paint();
    paint.setAntiAlias(true);
    paint.setAlphaf(sprite.worldAlpha);

    canvas.save();
    canvas.concat(skMatrix);

    const frame = sprite.texture.frame;
    const source = this.ck.XYWHRect(frame.x, frame.y, frame.width, frame.height);
    const dest = this.ck.XYWHRect(0, 0, sprite.width, sprite.height);

    canvas.drawImageRect(image, source, dest, paint, false);

    paint.delete();
    canvas.restore();
  }

  private getOrCreateImage(texture: Texture): Image | null {
    const cached = imageCache.get(texture);
    if (cached) {
      return cached;
    }

    const resource = texture.baseTexture.resource as { source?: CanvasImageSource } | undefined;
    const source = resource?.source;
    if (!source) {
      return null;
    }

    const image = this.ck.MakeImageFromCanvasImageSource(source);
    if (image) {
      imageCache.set(texture, image);
    }
    return image;
  }
}

/** Утилита из задания: конвертация Pixi-контейнера в Skia-отрисовку. */
export function convertPixiContainerToSkia(
  ck: CanvasKit,
  canvas: Canvas,
  container: Container,
  width: number,
  height: number,
): void {
  container.updateTransform();
  const renderer = new PixiToSkiaRenderer(ck);
  renderer.renderContainer(canvas, container, { width, height });
}

export type { Surface };
