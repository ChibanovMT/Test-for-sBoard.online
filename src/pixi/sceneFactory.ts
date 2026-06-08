import { Assets, Container, Graphics, Rectangle, Sprite, Texture } from 'pixi.js-legacy';

export const SCENE_WIDTH = 640;
export const SCENE_HEIGHT = 480;

/** Создаёт демо-сцену из тестового задания. */
export function createDemoScene(): Container {
  const mainContainer = new Container();

  const subContainer = new Container();
  const g1 = new Graphics();
  const g2 = new Graphics();
  const g3 = new Graphics();
  const g4 = new Graphics();

  g1.beginFill(0xff0000).drawEllipse(0, 0, 200, 100).endFill();
  g1.position.set(200, 100);
  g1.angle = 30;
  makeInteractive(g1, 'g1');

  g2.beginFill(0x0000ff).drawRect(-50, -75, 100, 150).endFill();
  g2.position.set(120, 60);
  g2.angle = 15;
  g2.scale.set(1.5, 1.7);
  makeInteractive(g2, 'g2');

  g3.lineStyle(10, 0xffffff, 1).moveTo(0, 0).lineTo(150, 100);
  g3.angle = -20;

  g4.lineStyle(10, 0xffff00, 1).moveTo(0, 70).lineTo(150, -30);
  g4.angle = 20;

  subContainer.position.set(75, 50);
  subContainer.addChild(g3, g4);
  mainContainer.addChild(subContainer, g1, g2);

  return mainContainer;
}

/** Альтернативная сцена с геометрическими фигурами. */
export function createShapesScene(): Container {
  const root = new Container();

  const star = new Graphics();
  star.beginFill(0x22c55e);
  drawStarShape(star, 0, 0, 5, 80, 40);
  star.endFill();
  star.position.set(180, 200);
  star.angle = 18;
  makeInteractive(star, 'star');

  const ring = new Graphics();
  ring.lineStyle(12, 0xf97316, 1).drawCircle(0, 0, 90);
  ring.position.set(420, 160);

  const poly = new Graphics();
  poly.beginFill(0xa855f7, 0.85)
    .drawPolygon([-60, 40, 0, -70, 80, 20, 40, 90, -80, 60])
    .endFill();
  poly.position.set(320, 300);
  poly.scale.set(1.2);
  makeInteractive(poly, 'polygon');

  root.addChild(star, ring, poly);
  return root;
}

/** Сцена со спрайтом (PNG). */
export async function createSpriteScene(): Promise<Container> {
  const root = new Container();

  const texture = await loadLogoTexture();
  const sprite = new Sprite(texture);
  sprite.anchor.set(0.5);
  sprite.position.set(200, 240);
  sprite.scale.set(0.5);
  makeInteractive(sprite, 'logo-sprite');

  const frame = new Graphics();
  frame.lineStyle(4, 0x38bdf8, 1).drawRoundedRect(-120, -90, 240, 180, 16);
  frame.position.set(200, 240);

  const label = new Graphics();
  label.beginFill(0x1e293b).drawRect(0, 0, 180, 36).endFill();
  label.position.set(360, 40);

  const line = new Graphics();
  line.lineStyle(6, 0xef4444, 1).moveTo(360, 120).lineTo(580, 380);
  line.angle = -5;

  root.addChild(frame, sprite, label, line);
  return root;
}

function makeInteractive(object: Graphics | Sprite, name: string): void {
  object.eventMode = 'static';
  object.cursor = 'pointer';
  object.name = name;

  // Явная hitArea — иначе Pixi (Canvas) может не ловить клики по Graphics
  if (object instanceof Graphics) {
    const bounds = object.getLocalBounds();
    object.hitArea = new Rectangle(bounds.x, bounds.y, bounds.width, bounds.height);
  }

  object.on('pointerdown', () => {
    console.log(`${name} pointerdown!`);
  });
  object.on('pointerup', () => {
    console.log(`${name} pointerup!`);
  });
}

async function loadLogoTexture(): Promise<Texture> {
  return Assets.load('/assets/logo.png');
}

/** Добавляет случайную фигуру или линию в контейнер. */
export function addRandomShape(container: Container): void {
  const g = new Graphics();
  const hue = Math.floor(Math.random() * 360);
  const color = hslToHex(hue, 70, 55);
  const x = 80 + Math.random() * (SCENE_WIDTH - 160);
  const y = 80 + Math.random() * (SCENE_HEIGHT - 160);

  if (Math.random() > 0.5) {
    const w = 40 + Math.random() * 100;
    const h = 40 + Math.random() * 100;
    g.beginFill(color, 0.9).drawRect(-w / 2, -h / 2, w, h).endFill();
  } else {
    const len = 80 + Math.random() * 120;
    const angle = Math.random() * Math.PI * 2;
    g.lineStyle(4 + Math.random() * 8, color, 1)
      .moveTo(0, 0)
      .lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
  }

  g.position.set(x, y);
  g.angle = Math.random() * 60 - 30;
  g.name = `random-${Date.now()}`;
  makeInteractive(g, g.name);

  container.addChild(g);
}

function drawStarShape(
  g: Graphics,
  x: number,
  y: number,
  points: number,
  outer: number,
  inner: number,
): void {
  const step = Math.PI / points;
  let rotation = -Math.PI / 2;
  g.moveTo(x + Math.cos(rotation) * outer, y + Math.sin(rotation) * outer);
  for (let i = 0; i < points; i++) {
    rotation += step;
    g.lineTo(x + Math.cos(rotation) * inner, y + Math.sin(rotation) * inner);
    rotation += step;
    g.lineTo(x + Math.cos(rotation) * outer, y + Math.sin(rotation) * outer);
  }
}

function hslToHex(h: number, s: number, l: number): number {
  const a = (s * Math.min(l / 100, 1 - l / 100)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color);
  };
  return (f(0) << 16) + (f(8) << 8) + f(4);
}
