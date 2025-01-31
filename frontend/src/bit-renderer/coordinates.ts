export const GRID_UNIT_PX = 16;

/**
 * Converts canvas pixel coordinates to bit coordinates
 */
export function canvasToBitCoordinates({
  canvasX,
  canvasY,
  canvas,
  origin,
}: {
  /** The x coordinate in canvas pixels */
  canvasX: number;
  /** The y coordinate in canvas pixels */
  canvasY: number;
  /** The canvas element to convert coordinates for */
  canvas: HTMLCanvasElement;
  /** The origin point in bit coordinates */
  origin: { x: number; y: number };
}): {
  /** The x coordinate in bit coordinates */
  x: number;
  /** The y coordinate in bit coordinates */
  y: number;
} {
  const canvasCenterX = canvas.width / 2;
  const canvasCenterY = canvas.height / 2;

  // Subtract center offset and divide by grid unit to get bit coordinates
  // Round to nearest integer since bits are discrete units
  return {
    x: Math.round((canvasX - canvasCenterX) / GRID_UNIT_PX) + origin.x,
    y: Math.round((canvasY - canvasCenterY) / GRID_UNIT_PX) + origin.y,
  };
}

/**
 * Converts bit coordinates to canvas pixel coordinates
 */
export function bitToCanvasCoordinates({
  bitX,
  bitY,
  canvas,
  origin,
}: {
  /** The x coordinate in the bit coordinate system (integer) */
  bitX: number;
  /** The y coordinate in the bit coordinate system (integer) */
  bitY: number;
  /** The canvas element to convert coordinates for */
  canvas: HTMLCanvasElement;
  /** The origin point in bit coordinates */
  origin: { x: number; y: number };
}): {
  /** The x coordinate in canvas pixels */
  x: number;
  /** The y coordinate in canvas pixels */
  y: number;
} {
  const canvasCenterX = canvas.width / 2;
  const canvasCenterY = canvas.height / 2;

  return {
    x: canvasCenterX + (bitX - origin.x) * GRID_UNIT_PX,
    y: canvasCenterY + (bitY - origin.y) * GRID_UNIT_PX,
  };
}
