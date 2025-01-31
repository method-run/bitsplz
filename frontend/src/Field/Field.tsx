import { usePlayerBit } from "../player-bit";
import { useCallback, useLayoutEffect, useRef } from "react";
import {
  VanillaFieldContext,
  vanillaFieldContext,
} from "../VanillaFieldContext";
import {
  bitToCanvasCoordinates,
  GRID_UNIT_PX,
} from "../bit-renderer/coordinates";

type DrawAllBitsParams = {
  canvas: HTMLCanvasElement;
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

  //   // Draw center dot
  //   const centerDotX = canvas.width / 2;
  //   const centerDotY = canvas.height / 2;
  //   ctx.beginPath();
  //   ctx.arc(centerDotX, centerDotY, 2, 0, Math.PI * 2);
  //   ctx.fillStyle = "red";
  //   ctx.fill();

  // Draw bits
  bitsInRange.forEach((bit) => {
    _drawBit(ctx, bit, canvas, bounds.origin);
  });

  // Draw debug grid aligned with our coordinate system
  ctx.strokeStyle = "rgba(0,0,0,0.05)";

  // Vertical lines
  for (let bitX = bounds.left; bitX <= bounds.right; bitX++) {
    const { x: canvasX } = bitToCanvasCoordinates({
      bitX,
      bitY: 0,
      canvas: canvas,
      origin: bounds.origin,
    });

    // if (bitX % 5 === 0) {
    //   ctx.fillText(bitX.toString(), canvasX, 10);
    // }

    ctx.beginPath();
    ctx.moveTo(canvasX, 0);
    ctx.lineTo(canvasX, canvas.height);
    ctx.stroke();
  }

  // Horizontal lines
  for (let bitY = bounds.top; bitY <= bounds.bottom; bitY++) {
    const { y: canvasY } = bitToCanvasCoordinates({
      bitX: 0,
      bitY,
      canvas: canvas,
      origin: bounds.origin,
    });

    // if (bitY % 5 === 0) {
    //   ctx.fillText(bitY.toString(), 10, canvasY);
    // }

    ctx.beginPath();
    ctx.moveTo(0, canvasY);
    ctx.lineTo(canvas.width, canvasY);
    ctx.stroke();
  }
}

function _calculateBounds(
  canvas: HTMLCanvasElement,
  origin: { x: number; y: number }
) {
  const rows = Math.floor(canvas.height / GRID_UNIT_PX);
  const cols = Math.floor(canvas.width / GRID_UNIT_PX);

  return {
    top: Math.floor(-rows / 2) + origin.y,
    right: Math.floor(cols / 2) + origin.x,
    bottom: Math.floor(rows / 2) + origin.y,
    left: Math.floor(-cols / 2) + origin.x,
    origin,
  };
}

export function Field(): JSX.Element | null {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { bit, setBit } = usePlayerBit();

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!bit) return;

      const keyMap: { [key: string]: { x: number; y: number } } = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 },
        s: { x: 0, y: 1 },
        a: { x: -1, y: 0 },
        d: { x: 1, y: 0 },
      };

      const movement = keyMap[event.key];

      if (movement) {
        setBit((prevBit) => {
          const nextBit = prevBit
            ? {
                ...prevBit,
                x: prevBit.x + movement.x,
                y: prevBit.y + movement.y,
              }
            : null;

          return nextBit;
        });
      }
    },
    [bit, setBit]
  );

  // Add keyboard handler
  useLayoutEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.style.backgroundColor = "white";

    const resizeObserver = new ResizeObserver(() => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const origin = vanillaFieldContext.getOrigin();
      const nextBounds = _calculateBounds(canvas, origin);
      vanillaFieldContext.setBounds(nextBounds);
      _drawAllBits({ canvas, vanillaFieldContext });
    });

    // Initial setup
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const origin = vanillaFieldContext.getOrigin();
    const nextBounds = _calculateBounds(canvas, origin);
    vanillaFieldContext.setBounds(nextBounds);
    _drawAllBits({ canvas, vanillaFieldContext });

    // Start observing
    resizeObserver.observe(globalThis.document.body);

    // Subscribe to changes and redraw
    const unsubscribe = vanillaFieldContext.subscribe(() => {
      _drawAllBits({ canvas, vanillaFieldContext });
    });

    return () => {
      resizeObserver.disconnect();
      unsubscribe();
    };
  }, [bit]);

  return bit ? <canvas ref={canvasRef} /> : null;
}
