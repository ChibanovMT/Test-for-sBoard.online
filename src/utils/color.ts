/** Преобразует цвет Pixi (число или строка #rrggbb) в Color4f для CanvasKit. */
export function parsePixiColor(color: number | string): { r: number; g: number; b: number } {
  if (typeof color === 'string') {
    const hex = color.startsWith('#') ? color.slice(1) : color;
    const value = parseInt(hex, 16);
    return {
      r: ((value >> 16) & 0xff) / 255,
      g: ((value >> 8) & 0xff) / 255,
      b: (value & 0xff) / 255,
    };
  }

  return {
    r: ((color >> 16) & 0xff) / 255,
    g: ((color >> 8) & 0xff) / 255,
    b: (color & 0xff) / 255,
  };
}
