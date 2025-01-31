import {
  canvasToBitCoordinates,
  bitToCanvasCoordinates,
  GRID_UNIT_PX,
} from "./coordinates";
import "@testing-library/jest-dom";

describe("coordinates", () => {
  let mockCanvas: HTMLCanvasElement;
  let bounds: { origin: { x: number; y: number } };

  beforeEach(() => {
    // Setup mock canvas with 400x300 dimensions
    mockCanvas = {
      width: 400,
      height: 300,
    } as HTMLCanvasElement;

    // Setup default bounds with origin at (0,0)
    bounds = {
      origin: { x: 0, y: 0 },
    };
  });

  describe("canvasToBitCoordinates", () => {
    it("should convert center of canvas to origin bit coordinates", () => {
      const result = canvasToBitCoordinates({
        canvasX: 200,
        canvasY: 150,
        canvas: mockCanvas,
        origin: bounds.origin,
      });
      expect(result).toEqual({ x: 0, y: 0 });
    });

    it("should convert top-left canvas coordinates to negative bit coordinates", () => {
      const result = canvasToBitCoordinates({
        canvasX: 0,
        canvasY: 0,
        canvas: mockCanvas,
        origin: bounds.origin,
      });
      expect(result).toEqual({ x: -12, y: -9 }); // -200/16 rounded, -150/16 rounded
    });

    it("should convert bottom-right canvas coordinates to positive bit coordinates", () => {
      const result = canvasToBitCoordinates({
        canvasX: 400,
        canvasY: 300,
        canvas: mockCanvas,
        origin: bounds.origin,
      });
      expect(result).toEqual({ x: 13, y: 9 }); // 200/16 rounded, 150/16 rounded
    });

    it("should account for non-zero origin in bounds", () => {
      bounds.origin = { x: 5, y: -3 };
      const result = canvasToBitCoordinates({
        canvasX: 200,
        canvasY: 150,
        canvas: mockCanvas,
        origin: bounds.origin,
      });
      expect(result).toEqual({ x: 5, y: -3 });
    });

    it("should round to nearest grid unit", () => {
      // Test a point that's slightly off center
      const result = canvasToBitCoordinates({
        canvasX: 208,
        canvasY: 158,
        canvas: mockCanvas,
        origin: bounds.origin,
      });
      expect(result).toEqual({ x: 1, y: 1 });
    });
  });

  describe("bitToCanvasCoordinates", () => {
    it("should convert origin bit coordinates to center of canvas", () => {
      const result = bitToCanvasCoordinates({
        bitX: 0,
        bitY: 0,
        canvas: mockCanvas,
        origin: bounds.origin,
      });
      expect(result).toEqual({ x: 200, y: 150 });
    });

    it("should convert negative bit coordinates to left/up on canvas", () => {
      const result = bitToCanvasCoordinates({
        bitX: -1,
        bitY: -1,
        canvas: mockCanvas,
        origin: bounds.origin,
      });
      expect(result).toEqual({ x: 200 - GRID_UNIT_PX, y: 150 - GRID_UNIT_PX });
    });

    it("should convert positive bit coordinates to right/down on canvas", () => {
      const result = bitToCanvasCoordinates({
        bitX: 1,
        bitY: 1,
        canvas: mockCanvas,
        origin: bounds.origin,
      });
      expect(result).toEqual({ x: 200 + GRID_UNIT_PX, y: 150 + GRID_UNIT_PX });
    });

    it("should account for non-zero origin in bounds", () => {
      bounds.origin = { x: 5, y: -3 };
      const result = bitToCanvasCoordinates({
        bitX: 5,
        bitY: -3,
        canvas: mockCanvas,
        origin: bounds.origin,
      });
      expect(result).toEqual({ x: 200, y: 150 });
    });
  });

  describe("coordinate reversibility tests", () => {
    const canvasConfigs = [
      {
        width: 3 * GRID_UNIT_PX,
        height: 3 * GRID_UNIT_PX,
        description: "3x3 grid units",
      },
      {
        width: 2 * GRID_UNIT_PX,
        height: 2 * GRID_UNIT_PX,
        description: "2x2 grid units",
      },
      {
        width: 3 * GRID_UNIT_PX + 8,
        height: 3 * GRID_UNIT_PX + 8,
        description: "3.5x3.5 grid units",
      },
    ];

    canvasConfigs.forEach(({ width, height, description }) => {
      describe(`Canvas ${description} (${width}x${height}px)`, () => {
        let testCanvas: HTMLCanvasElement;
        let bounds: { origin: { x: number; y: number } };

        beforeEach(() => {
          testCanvas = {
            width,
            height,
          } as HTMLCanvasElement;

          bounds = {
            origin: { x: 0, y: 0 },
          };
        });

        // Test horizontal coordinates (x varies, y=0)
        const maxX = Math.floor(width / (2 * GRID_UNIT_PX));
        for (let x = 0; x <= maxX; x++) {
          it(`should correctly reverse bit coordinates (${x}, 0)`, () => {
            // Convert from bit to canvas coordinates
            const canvasCoords = bitToCanvasCoordinates({
              bitX: x,
              bitY: 0,
              canvas: testCanvas,
              origin: bounds.origin,
            });

            // Convert back to bit coordinates
            const bitCoords = canvasToBitCoordinates({
              canvasX: canvasCoords.x,
              canvasY: canvasCoords.y,
              canvas: testCanvas,
              origin: bounds.origin,
            });

            // Verify the round trip
            expect(bitCoords).toEqual({ x, y: 0 });
          });
        }

        // Test vertical coordinates (x=0, y varies)
        const maxY = Math.floor(height / (2 * GRID_UNIT_PX));
        for (let y = 0; y <= maxY; y++) {
          it(`should correctly reverse bit coordinates (0, ${y})`, () => {
            // Convert from bit to canvas coordinates
            const canvasCoords = bitToCanvasCoordinates({
              bitX: 0,
              bitY: y,
              canvas: testCanvas,
              origin: bounds.origin,
            });

            // Convert back to bit coordinates
            const bitCoords = canvasToBitCoordinates({
              canvasX: canvasCoords.x,
              canvasY: canvasCoords.y,
              canvas: testCanvas,
              origin: bounds.origin,
            });

            // Verify the round trip
            expect(bitCoords).toEqual({ x: 0, y });
          });
        }

        // Test negative coordinates too
        [-1, -maxX].forEach((x) => {
          it(`should correctly reverse negative bit coordinates (${x}, 0)`, () => {
            const canvasCoords = bitToCanvasCoordinates({
              bitX: x,
              bitY: 0,
              canvas: testCanvas,
              origin: bounds.origin,
            });
            const bitCoords = canvasToBitCoordinates({
              canvasX: canvasCoords.x,
              canvasY: canvasCoords.y,
              canvas: testCanvas,
              origin: bounds.origin,
            });
            expect(bitCoords).toEqual({ x, y: 0 });
          });
        });

        [-1, -maxY].forEach((y) => {
          it(`should correctly reverse negative bit coordinates (0, ${y})`, () => {
            const canvasCoords = bitToCanvasCoordinates({
              bitX: 0,
              bitY: y,
              canvas: testCanvas,
              origin: bounds.origin,
            });
            const bitCoords = canvasToBitCoordinates({
              canvasX: canvasCoords.x,
              canvasY: canvasCoords.y,
              canvas: testCanvas,
              origin: bounds.origin,
            });
            expect(bitCoords).toEqual({ x: 0, y });
          });
        });
      });
    });
  });
});
