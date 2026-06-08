import type { Container, DisplayObject, FederatedPointerEvent } from 'pixi.js-legacy';
import { Point } from 'pixi.js-legacy';

export type PointerLogFn = (message: string) => void;

/**
 * Обработка pointerDown/pointerUp на Skia-canvas через hit-test по дереву Pixi.
 * Координаты совпадают с Pixi-сценой (одинаковый размер canvas).
 */
export class SkiaInteraction {
  private activeTarget: DisplayObject | null = null;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly getScene: () => Container,
    private readonly log: PointerLogFn,
  ) {
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
    this.canvas.addEventListener('pointerleave', this.onPointerUp);
  }

  destroy(): void {
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointerleave', this.onPointerUp);
  }

  private onPointerDown = (event: PointerEvent): void => {
    const point = this.toScenePoint(event);
    const target = this.hitTest(this.getScene(), point);
    if (!target) {
      return;
    }

    this.activeTarget = target;
    const pixiEvent = this.createPixiEvent('pointerdown', point, target);
    target.emit('pointerdown', pixiEvent);
    this.log(`[Skia] pointerdown → ${target.name || target.constructor.name}`);
  };

  private onPointerUp = (event: PointerEvent): void => {
    if (!this.activeTarget) {
      return;
    }

    const point = this.toScenePoint(event);
    const pixiEvent = this.createPixiEvent('pointerup', point, this.activeTarget);
    this.activeTarget.emit('pointerup', pixiEvent);
    this.log(`[Skia] pointerup → ${this.activeTarget.name || this.activeTarget.constructor.name}`);
    this.activeTarget = null;
  };

  private toScenePoint(event: PointerEvent): Point {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return new Point(
      (event.clientX - rect.left) * scaleX,
      (event.clientY - rect.top) * scaleY,
    );
  }

  private hitTest(root: Container, point: Point): DisplayObject | null {
    root.updateTransform();
    return this.hitTestRecursive(root, point);
  }

  private hitTestRecursive(object: DisplayObject, point: Point): DisplayObject | null {
    if (!object.visible) {
      return null;
    }

    const container = object as Container;
    if (container.children?.length && container.interactiveChildren !== false) {
      for (let i = container.children.length - 1; i >= 0; i--) {
        const hit = this.hitTestRecursive(container.children[i], point);
        if (hit) {
          return hit;
        }
      }
    }

    if (object.eventMode === 'static' || object.eventMode === 'dynamic' || object.interactive) {
      if (this.containsPoint(object, point)) {
        return object;
      }
    }

    return null;
  }

  private containsPoint(object: DisplayObject, globalPoint: Point): boolean {
    const bounds = object.getBounds();
    return (
      globalPoint.x >= bounds.x &&
      globalPoint.x <= bounds.x + bounds.width &&
      globalPoint.y >= bounds.y &&
      globalPoint.y <= bounds.y + bounds.height
    );
  }

  private createPixiEvent(
    type: 'pointerdown' | 'pointerup',
    point: Point,
    target: DisplayObject,
  ): FederatedPointerEvent {
    return {
      type,
      pointerType: 'mouse',
      global: point.clone(),
      getLocalPosition: () => point.clone(),
      target,
      currentTarget: target,
      stopPropagation: () => undefined,
    } as unknown as FederatedPointerEvent;
  }
}
