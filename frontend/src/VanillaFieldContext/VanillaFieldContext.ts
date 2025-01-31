import { Bit } from "../player-bit/storage";

type FieldState = {
  bitInRangeById: Map<string, Bit>;
  bounds: {
    top: number;
    right: number;
    bottom: number;
    left: number;
    origin: {
      x: number;
      y: number;
    };
  };
};

type StateUpdater = ((prevState: FieldState) => FieldState) | FieldState;
type Listener = (state: FieldState) => void;

export class VanillaFieldContext {
  private state: FieldState;
  private listeners: Set<Listener>;

  constructor() {
    this.state = {
      /**
       * @type {Map<string, Bit>}
       */
      bitInRangeById: new Map(),
      /**
       * The top, right, bottom, left are grid coordinates of the dimensions we expect to be visible,
       * in terms unit squares from the origin.
       * The origin is the center of the canvas.
       * @type {{top: number, right: number, bottom: number, left: number, origin: {x: number, y: number}}}
       */
      bounds: {
        top: -16,
        right: 16,
        bottom: 16,
        left: 16,
        origin: { x: 0, y: 0 },
      },
    };

    this.listeners = new Set();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener); // Returns cleanup function
  }

  setState(updater: StateUpdater): void {
    const newState =
      typeof updater === "function" ? updater(this.state) : updater;

    this.state = newState;
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }

  // Convenience getters
  getBitsInRange(): Bit[] {
    return Array.from(this.state.bitInRangeById.values());
  }

  getBounds(): FieldState["bounds"] {
    return this.state.bounds;
  }

  getOrigin(): FieldState["bounds"]["origin"] {
    return this.state.bounds.origin;
  }

  setBounds(bounds: FieldState["bounds"]): void {
    this.setState({
      ...this.state,
      bounds,
    });
  }

  // Mutation methods
  updateBit(bitId: string, bitData: Bit): void {
    const nextBitInRangeById = new Map(this.state.bitInRangeById);
    nextBitInRangeById.set(bitId, bitData);

    this.setState({
      ...this.state,
      bitInRangeById: nextBitInRangeById,
    });
  }

  removeBit(bitId: string): void {
    const nextBitInRangeById = new Map(this.state.bitInRangeById);
    nextBitInRangeById.delete(bitId);

    this.setState({
      ...this.state,
      bitInRangeById: nextBitInRangeById,
    });
  }
}

// Create a singleton instance
export const vanillaFieldContext = new VanillaFieldContext();
