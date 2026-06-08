import { Application, Container } from 'pixi.js-legacy';
import { SCENE_HEIGHT, SCENE_WIDTH } from './sceneFactory';

export class PixiApplication {
  readonly app: Application;
  readonly stage: Container;

  constructor(host: HTMLElement) {
    this.app = new Application({
      width: SCENE_WIDTH,
      height: SCENE_HEIGHT,
      backgroundColor: 0x1a2230,
      forceCanvas: true,
      antialias: true,
      resolution: 1,
    });

    host.appendChild(this.app.view as HTMLCanvasElement);
    this.stage = this.app.stage;
  }

  setScene(scene: Container): void {
    this.stage.removeChildren();
    this.stage.addChild(scene);
  }

  resize(): void {
    this.app.renderer.resize(SCENE_WIDTH, SCENE_HEIGHT);
  }

  destroy(): void {
    this.app.destroy(true, { children: true });
  }
}
