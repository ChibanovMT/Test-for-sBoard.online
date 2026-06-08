import { loadCanvasKit } from 'html2pdf-skia';
import type { CanvasKit } from '@rollerbird/canvaskit-wasm-pdf/types';

let canvasKitPromise: Promise<CanvasKit> | null = null;

/**
 * Загружает CanvasKit WASM с PDF backend.
 * Используется loadCanvasKit из html2pdf-skia — он корректно инициализирует CJS-модуль canvaskit-pdf.
 */
export function initCanvasKit(): Promise<CanvasKit> {
  if (!canvasKitPromise) {
    canvasKitPromise = loadCanvasKit({
      wasmBinaryUrl: `${import.meta.env.BASE_URL}canvaskit-pdf.wasm`,
    });
  }
  return canvasKitPromise;
}
