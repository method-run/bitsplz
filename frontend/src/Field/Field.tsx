import { usePlayerBit } from '../player-bit';
import { useLayoutEffect, useRef } from 'react';
import { vanillaFieldContext } from '../VanillaFieldContext';

const GRID_UNIT_PX = 16;

export function Field() {
  /** @type {React.MutableRefObject<HTMLCanvasElement>} */
  const canvasRef = useRef(null);

  const { bit } = usePlayerBit();

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set up canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.backgroundColor = "yellow";
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

    _drawAllBits({canvas, cols, rows, vanillaFieldContext});

    // Subscribe to changes and redraw
    const unsubscribe = vanillaFieldContext.subscribe(() => {
        // Clear canvas
        _drawAllBits({canvas, cols, rows, vanillaFieldContext});
    });

    return () => {
        console.log('unsubscribing');
        unsubscribe();
    };
  }, [bit]);

  return bit && (
    <canvas ref={canvasRef} />
  );
}

function _drawAllBits({canvas, cols, rows, vanillaFieldContext}) {
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const bounds = vanillaFieldContext.getBounds();
    const bitsInRange = vanillaFieldContext.getBitsInRange();

    // Calculate the center of the canvas in pixels
    const canvasCenterX = canvas.width / 2;
    const canvasCenterY = canvas.height / 2;

    // Calculate offsets for the first grid lines
    // This ensures the origin (0,0) is exactly centered
    const firstColOffset = (canvas.width % GRID_UNIT_PX) / 2;
    const firstRowOffset = (canvas.height % GRID_UNIT_PX) / 2;

    // Draw bits
    bitsInRange.forEach((bit) => {
        const pixelX = canvasCenterX + (bit.x - bounds.origin.x) * GRID_UNIT_PX;
        const pixelY = canvasCenterY + (bit.y - bounds.origin.y) * GRID_UNIT_PX;

        ctx.fillStyle = 'black';
        ctx.fillRect(
            pixelX - GRID_UNIT_PX/2,
            pixelY - GRID_UNIT_PX/2,
            GRID_UNIT_PX,
            GRID_UNIT_PX
        );
    });

    // Draw debug grid aligned with our coordinate system
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    // Vertical lines
    for(let x = firstColOffset; x < canvas.width; x += GRID_UNIT_PX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    // Horizontal lines
    for(let y = firstRowOffset; y < canvas.height; y += GRID_UNIT_PX) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}