import type { Application, DisplayObject, FederatedPointerEvent } from 'pixi.js-legacy';

/** Логирует pointerDown/pointerUp с Pixi-canvas через всплытие событий на stage. */
export function attachPixiStageLogging(
  app: Application,
  log: (message: string) => void,
): void {
  app.stage.eventMode = 'passive';
  app.stage.interactiveChildren = true;

  const onPointer = (type: 'pointerdown' | 'pointerup') => (event: FederatedPointerEvent) => {
    const target = event.target as DisplayObject;
    if (!target || target === app.stage) {
      return;
    }
    if (target.eventMode !== 'static' && target.eventMode !== 'dynamic' && !target.interactive) {
      return;
    }
    log(`[Pixi] ${type} → ${target.name || target.constructor.name}`);
  };

  app.stage.on('pointerdown', onPointer('pointerdown'));
  app.stage.on('pointerup', onPointer('pointerup'));
}
