import { usePlayerBit } from "../player-bit";
import { useLayoutEffect, useRef } from "react";
import {
  VanillaFieldContext,
  vanillaFieldContext,
} from "../VanillaFieldContext";
import {
  bitToCanvasCoordinates,
  canvasToBitCoordinates,
  GRID_UNIT_PX,
} from "../bit-renderer/coordinates";

type DrawAllBitsParams = {
  canvas: HTMLCanvasElement;
  cols?: number;
  rows?: number;
  vanillaFieldContext: VanillaFieldContext;
};

function _drawBit(
  ctx: CanvasRenderingContext2D,
  bit: { x: number; y: number },
  canvas: HTMLCanvasElement,
  origin: { x: number; y: number }
): void {
  const { x: canvasX, y: canvasY } = bitToCanvasCoordinates({
    bitX: bit.x,
    bitY: bit.y,
    canvas,
    origin,
  });

  console.log({ canvasX, canvasY, bitX: bit.x, bitY: bit.y });
  ctx.fillStyle = "black";
  ctx.fillRect(canvasX, canvasY, GRID_UNIT_PX, GRID_UNIT_PX);
}

function _drawAllBits({
  canvas,
  vanillaFieldContext,
}: DrawAllBitsParams): void {
  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const bounds = vanillaFieldContext.getBounds();
  const bitsInRange = vanillaFieldContext.getBitsInRange();

  // Calculate offsets for the first grid lines
  // This ensures the origin (0,0) is exactly centered
  const firstColOffset = (canvas.width % GRID_UNIT_PX) / 2;
  const firstRowOffset = (canvas.height % GRID_UNIT_PX) / 2;

  const centerDotX = canvas.width / 2;
  const centerDotY = canvas.height / 2;

  console.log({
    firstColOffset,
    firstRowOffset,
    centerDotX,
    centerDotY,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
  });

  // Draw center dot
  ctx.beginPath();
  ctx.arc(centerDotX, centerDotY, 2, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();

  // Draw bits
  bitsInRange.forEach((bit) => {
    _drawBit(ctx, bit, canvas, bounds.origin);
  });

  // Draw debug grid aligned with our coordinate system
  ctx.strokeStyle = "rgba(0,0,0,0.1)";

  // Vertical lines
  for (let x = firstColOffset; x < canvas.width; x += GRID_UNIT_PX) {
    // Generate vertical grid lines between each potential bit position, and add bit coordinate labels at the top of each line
    const { x: bitX } = canvasToBitCoordinates({
      canvasX: x,
      canvasY: 0,
      canvas: canvas,
      origin: bounds.origin,
    });
    ctx.fillText(bitX.toString(), x, 10);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = firstRowOffset; y < canvas.height; y += GRID_UNIT_PX) {
    const { y: bitY } = canvasToBitCoordinates({
      canvasX: 0,
      canvasY: y,
      canvas: canvas,
      origin: bounds.origin,
    });
    ctx.fillText(bitY.toString(), 10, y);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

export function Field(): JSX.Element | null {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { bit } = usePlayerBit();

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set up canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.backgroundColor = "white";
    const origin = vanillaFieldContext.getOrigin();

    const rows = Math.floor(canvas.height / GRID_UNIT_PX);
    const cols = Math.floor(canvas.width / GRID_UNIT_PX);

    const nextBounds = {
      top: Math.floor(-rows / 2) + origin.y,
      right: Math.floor(cols / 2) + origin.x,
      bottom: Math.floor(rows / 2) + origin.y,
      left: Math.floor(-cols / 2) + origin.x,
      origin,
    };

    vanillaFieldContext.setBounds(nextBounds);

    _drawAllBits({ canvas, cols, rows, vanillaFieldContext });

    // Subscribe to changes and redraw
    const unsubscribe = vanillaFieldContext.subscribe(() => {
      _drawAllBits({ canvas, cols, rows, vanillaFieldContext });
    });

    return () => {
      console.log("unsubscribing");
      unsubscribe();
    };
  }, [bit]);

  return bit ? <canvas ref={canvasRef} /> : null;
}
