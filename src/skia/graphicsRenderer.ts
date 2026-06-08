import type { Canvas, CanvasKit, Paint, Path } from '@rollerbird/canvaskit-wasm-pdf/types';
import type { Graphics, GraphicsData, SHAPES } from 'pixi.js-legacy';
import { Matrix, SHAPES as ShapeType } from 'pixi.js-legacy';
import type { Matrix as PixiMatrix } from 'pixi.js-legacy';
import { parsePixiColor } from '../utils/color';
import { pixiMatrixToSkia } from '../utils/matrix';

type Disposable = { delete(): void };

/** Рисует PIXI.Graphics на Skia Canvas с учётом локальной матрицы геометрии. */
export function renderGraphics(
  ck: CanvasKit,
  canvas: Canvas,
  graphics: Graphics,
  worldMatrix: PixiMatrix,
): void {
  const geometry = graphics.geometry;
  geometry.updateBatches();

  for (const data of geometry.graphicsData) {
    renderGraphicsData(ck, canvas, data, worldMatrix);
  }
}

function renderGraphicsData(
  ck: CanvasKit,
  canvas: Canvas,
  data: GraphicsData,
  worldMatrix: PixiMatrix,
): void {
  const localMatrix = data.matrix ? worldMatrix.clone().append(data.matrix) : worldMatrix;
  const skMatrix = pixiMatrixToSkia(localMatrix);

  canvas.save();
  canvas.concat(skMatrix);

  const path = buildPathFromGraphicsData(ck, data);
  if (!path) {
    canvas.restore();
    return;
  }

  const disposables: Disposable[] = [path];

  try {
    if (data.fillStyle.visible && data.fillStyle.alpha > 0) {
      const fillPaint = createFillPaint(ck, data);
      if (fillPaint) {
        disposables.push(fillPaint);
        canvas.drawPath(path, fillPaint);
      }
    }

    if (data.lineStyle.visible && data.lineStyle.width > 0 && data.lineStyle.alpha > 0) {
      const strokePaint = createStrokePaint(ck, data);
      if (strokePaint) {
        disposables.push(strokePaint);
        canvas.drawPath(path, strokePaint);
      }
    }

    for (const hole of data.holes) {
      renderGraphicsData(ck, canvas, hole, new Matrix());
    }
  } finally {
    for (const item of disposables) {
      item.delete();
    }
    canvas.restore();
  }
}

function createFillPaint(ck: CanvasKit, data: GraphicsData): Paint | null {
  const { r, g, b } = parsePixiColor(data.fillStyle.color);
  const paint = new ck.Paint();
  paint.setStyle(ck.PaintStyle.Fill);
  paint.setColor(ck.Color4f(r, g, b, data.fillStyle.alpha));
  paint.setAntiAlias(true);
  return paint;
}

function createStrokePaint(ck: CanvasKit, data: GraphicsData): Paint | null {
  const { r, g, b } = parsePixiColor(data.lineStyle.color);
  const paint = new ck.Paint();
  paint.setStyle(ck.PaintStyle.Stroke);
  paint.setColor(ck.Color4f(r, g, b, data.lineStyle.alpha));
  paint.setStrokeWidth(data.lineStyle.width);
  paint.setAntiAlias(true);
  return paint;
}

function buildPathFromGraphicsData(ck: CanvasKit, data: GraphicsData): Path | null {
  const path = new ck.Path();
  const shapeType = data.type as SHAPES;

  switch (shapeType) {
    case ShapeType.RECT: {
      const rect = data.shape as { x: number; y: number; width: number; height: number };
      path.addRect(ck.LTRBRect(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height));
      break;
    }
    case ShapeType.CIRC: {
      const circle = data.shape as { x: number; y: number; radius: number };
      path.addCircle(circle.x, circle.y, circle.radius);
      break;
    }
    case ShapeType.ELIP: {
      const ellipse = data.shape as { x: number; y: number; width: number; height: number };
      path.addOval(
        ck.LTRBRect(
          ellipse.x - ellipse.width,
          ellipse.y - ellipse.height,
          ellipse.x + ellipse.width,
          ellipse.y + ellipse.height,
        ),
      );
      break;
    }
    case ShapeType.RREC: {
      const rr = data.shape as {
        x: number;
        y: number;
        width: number;
        height: number;
        radius: number;
      };
      path.addRRect(
        ck.RRectXY(
          ck.LTRBRect(rr.x, rr.y, rr.x + rr.width, rr.y + rr.height),
          rr.radius,
          rr.radius,
        ),
      );
      break;
    }
    case ShapeType.POLY:
    default: {
      const points = data.points.length > 0 ? data.points : (data.shape as { points: number[] }).points;
      if (!points || points.length < 4) {
        path.delete();
        return null;
      }

      path.moveTo(points[0], points[1]);
      for (let i = 2; i < points.length; i += 2) {
        path.lineTo(points[i], points[i + 1]);
      }

      const isLine = data.lineStyle.visible && !data.fillStyle.visible;
      if (!isLine) {
        path.close();
      }
      break;
    }
  }

  return path;
}
