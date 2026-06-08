import type { Matrix } from 'pixi.js-legacy';

/** Конвертирует матрицу Pixi в 9-элементный массив Skia (3x3). */
export function pixiMatrixToSkia(matrix: Matrix): number[] {
  return [matrix.a, matrix.c, matrix.tx, matrix.b, matrix.d, matrix.ty, 0, 0, 1];
}
