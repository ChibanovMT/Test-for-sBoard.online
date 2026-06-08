import type { CanvasKit } from '@rollerbird/canvaskit-wasm-pdf/types';
import type { Container } from 'pixi.js-legacy';
import { PixiToSkiaRenderer } from './PixiToSkiaRenderer';

export interface PdfExportOptions {
  width: number;
  height: number;
  title?: string;
  author?: string;
}

/**
 * Экспорт сцены в векторный PDF через Skia PDF backend.
 * Graphics отрисовываются как векторные пути, Sprite — как встроенные bitmap.
 */
export function exportContainerToPdf(
  ck: CanvasKit,
  container: Container,
  options: PdfExportOptions,
): Uint8Array {
  if (!ck.MakePDFDocument) {
    throw new Error('CanvasKit собран без поддержки PDF. Используйте canvaskit-pdf.wasm');
  }

  container.updateTransform();

  // rootTag обязателен для этой WASM-сборки (без него WASM требует поле _rootTag)
  const doc = ck.MakePDFDocument({
    title: options.title ?? 'Pixi Skia Export',
    author: options.author ?? 'Pixi+Skia Demo',
    subject: 'Vector PDF export',
    creator: 'pixi-skia-pdf-demo',
    producer: 'Skia PDF backend (CanvasKit)',
    language: 'ru-RU',
    rootTag: {
      id: 0,
      type: 'Document',
      children: [],
    },
    compressionLevel: ck.PDFCompressionLevel?.None ?? 0,
  });

  const pageCanvas = doc.beginPage(options.width, options.height);

  const renderer = new PixiToSkiaRenderer(ck);
  renderer.renderToPdfPage(pageCanvas, container, {
    width: options.width,
    height: options.height,
    backgroundColor: [1, 1, 1, 1],
  });

  doc.endPage();
  const pdfBytes = doc.close();
  doc.delete();

  return pdfBytes;
}

/** Скачивает PDF-байты как файл в браузере. */
export function downloadPdf(bytes: Uint8Array, filename = 'scene.pdf'): void {
  const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
