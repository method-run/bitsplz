import { usePlayerBit } from "../player-bit";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  VanillaFieldContext,
  vanillaFieldContext,
} from "../VanillaFieldContext";
import {
  bitToCanvasCoordinates,
  GRID_UNIT_PX,
} from "../bit-renderer/coordinates";
import { Bit, getWebSocket } from "../player-bit/storage";
import { MoveMessage } from "../../common/dist/MoveMessage";

type Direction = "up" | "down" | "left" | "right";
type DirectionEvent = "press" | "release";

type DrawAllBitsParams = {
  bit: Bit;
  canvas: HTMLCanvasElement;
  vanillaFieldContext: VanillaFieldContext;
};

const _MOVEMENT_MAP: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const _DIRECTION_BY_KEY: { [key: string]: Direction } = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

function _drawBit(
  ctx: CanvasRenderingContext2D,
  bit: { x: number; y: number },
  canvas: HTMLCanvasElement,
  origin: { x: number; y: number },
  isSessionBit: boolean,
  isServerInSync: boolean
): void {
  const { x: canvasX, y: canvasY } = bitToCanvasCoordinates({
    bitX: bit.x,
    bitY: bit.y,
    canvas,
    origin,
  });

  ctx.fillStyle = isSessionBit ? (isServerInSync ? "black" : "red") : "#444";
  ctx.fillRect(canvasX, canvasY, GRID_UNIT_PX, GRID_UNIT_PX);
}

function _drawAllBits({
  bit: sessionBit,
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
    _drawBit(ctx, bit, canvas, bounds.origin, sessionBit.id === bit.id, true);
  });

  _drawBit(
    ctx,
    sessionBit,
    canvas,
    bounds.origin,
    true,
    vanillaFieldContext.getIsServerInSync()
  );

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

/** Mutates pendingTickMovements and leaves it empty */
function _renderPendingTicks({
  _setBit,
  pendingTickMovements,
}: {
  _setBit: Dispatch<SetStateAction<Bit | null>>;
  pendingTickMovements: Direction[];
}) {
  for (let i = 0; i < pendingTickMovements.length; i++) {
    const moveDirection = pendingTickMovements.shift();
    if (!moveDirection) continue;
    const movement = _MOVEMENT_MAP[moveDirection];

    _setBit((prevBit) => {
      if (!prevBit) return null;

      const nextBit = {
        ...prevBit,
        x: prevBit.x + movement.x,
        y: prevBit.y + movement.y,
      };

      return nextBit;
    });
  }
}

const _TICK_MS = 300;

export function Field(): JSX.Element | null {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * Keep track of all directions for which keys are being pressed,
   * in the order in which they were pressed.
   */
  const directionEventsActiveRef = useRef<
    Array<{ direction: Direction; event: DirectionEvent }>
  >([]);

  const setDirectionEventsActiveRef = useRef(
    (next: Array<{ direction: Direction; event: DirectionEvent }>) => {
      directionEventsActiveRef.current = next;
    }
  );

  // Add movement loop using useEffect
  // Ok, instead of using setInterval, set the next loop to be at the
  // top of the next interval of _TICK_MS.
  // This will allow us to have a more accurate movement loop. In the
  // per-tick resolution, we'll set the position of the bit/s.
  // The actual rendering should happen in a requestAnimationFrame.
  // In the requestAnimationFrame, we'll check if the bit/s have moved,
  // and if so, we'll rerender them.

  const pendingTickMovementsRef = useRef<Direction[]>([]);
  const tickLoopTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const tickLoopAnimationFrameRef = useRef<number | undefined>(undefined);

  // Add to an ordered list of movements that should be processed for each tick.
  // Ticks are the game clock, but not necessarily the same thing as the animation frame.
  // We can build up a backlog of tick movements, and they'll need to be applied to the
  // bits in order whenever we get an animation frame.
  const resolveTickRef = useRef(() => {
    const directionEventsActive = directionEventsActiveRef.current;

    const moveDirection = directionEventsActive.find(
      (de) => de.event === "press"
    )?.direction;

    if (!moveDirection) return;

    pendingTickMovementsRef.current = [
      ...pendingTickMovementsRef.current,
      moveDirection,
    ];

    const directionsReleasedSet = directionEventsActive.reduce<Set<Direction>>(
      (acc, directionEvent) =>
        directionEvent.event === "release"
          ? new Set([...acc, directionEvent.direction])
          : acc,
      new Set<Direction>()
    );

    const nextDirectionEventsActive = directionEventsActive.filter(
      (de) => !directionsReleasedSet.has(de.direction)
    );

    setDirectionEventsActiveRef.current(nextDirectionEventsActive);
  });

  // Just keep asking for the new animation frame at the top of each tick interval.
  // The only thing this actually _does_ is call resolveTick.
  const tickLoopRef = useRef(
    (_setBit: Dispatch<SetStateAction<Bit | null>>) => {
      const now = Date.now();
      const topOfNextTick = Math.floor(now / _TICK_MS) * _TICK_MS + _TICK_MS;
      const timeUntilNextTick = topOfNextTick - now;
      resolveTickRef.current();

      if (pendingTickMovementsRef.current.length > 0) {
        tickLoopAnimationFrameRef.current = requestAnimationFrame(() =>
          _renderPendingTicks({
            _setBit,
            pendingTickMovements: pendingTickMovementsRef.current,
          })
        );
      }

      tickLoopTimeoutRef.current = setTimeout(() => {
        tickLoopRef.current(_setBit);
      }, timeUntilNextTick);
    }
  );

  const { bit, setBit } = usePlayerBit();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const direction = _DIRECTION_BY_KEY[event.key];

    if (direction) {
      const directionEventsActive = directionEventsActiveRef.current;

      const nextDirectionEventsActive = directionEventsActive.some(
        (de) => de.direction === direction && de.event === "press"
      )
        ? directionEventsActive
        : [
            { direction: direction, event: "press" as DirectionEvent },
            ...directionEventsActive,
          ];

      setDirectionEventsActiveRef.current(nextDirectionEventsActive);
    }
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const direction = _DIRECTION_BY_KEY[event.key];

    if (direction) {
      const directionEventsActive = directionEventsActiveRef.current;

      const nextDirectionEventsActive = directionEventsActive.some(
        (de) => de.direction === direction && de.event === "release"
      )
        ? directionEventsActive
        : [
            { direction: direction, event: "release" as DirectionEvent },
            ...directionEventsActive,
          ];

      setDirectionEventsActiveRef.current(nextDirectionEventsActive);
    }
  }, []);

  // Send websocket messages on bit movement
  useEffect(() => {
    const websocket = getWebSocket();

    if (!bit || !websocket || websocket.readyState !== WebSocket.OPEN) {
      return;
    }

    const moveMessage: MoveMessage = {
      type: "move",
      payload: {
        bitId: bit.id,
        x: bit.x,
        y: bit.y,
        time: Date.now().valueOf(),
      },
    };

    websocket.send(JSON.stringify(moveMessage));
  }, [bit]);

  // Send initial websocket message on mount
  useLayoutEffect(() => {
    const websocket = getWebSocket();

    if (!bit || !websocket || websocket.readyState !== WebSocket.OPEN) {
      return;
    }

    const moveMessage: MoveMessage = {
      type: "move",
      payload: {
        bitId: bit.id,
        x: bit.x,
        y: bit.y,
        time: Date.now().valueOf(),
      },
    };

    websocket.send(JSON.stringify(moveMessage));
  }, []);

  // Initialize the movement loop at the top of the next interval of _TICK_MS.
  useLayoutEffect(() => {
    tickLoopRef.current(setBit);

    return () => {
      if (tickLoopAnimationFrameRef.current) {
        cancelAnimationFrame(tickLoopAnimationFrameRef.current);
      }

      if (tickLoopTimeoutRef.current) {
        clearTimeout(tickLoopTimeoutRef.current);
      }
    };
  }, []);

  // Update useLayoutEffect to remove handleKeyPress
  useLayoutEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Send websocket messages on bit moves
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

      if (bit) {
        _drawAllBits({ bit, canvas, vanillaFieldContext });
      }
    });

    // Initial setup
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const origin = vanillaFieldContext.getOrigin();
    const nextBounds = _calculateBounds(canvas, origin);
    vanillaFieldContext.setBounds(nextBounds);

    if (bit) {
      _drawAllBits({ bit, canvas, vanillaFieldContext });
    }

    // Start observing
    resizeObserver.observe(globalThis.document.body);

    // Subscribe to changes and redraw
    const unsubscribe = vanillaFieldContext.subscribe(() => {
      if (bit) {
        _drawAllBits({ bit, canvas, vanillaFieldContext });
      }
    });

    return () => {
      resizeObserver.disconnect();
      unsubscribe();
    };
  }, [bit]);

  return bit ? <canvas ref={canvasRef} /> : null;
}
