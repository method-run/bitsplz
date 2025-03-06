import { Block } from "../../common/src/Block";
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
  isServerInSync: boolean;
};

type StateUpdater = ((prevState: FieldState) => FieldState) | FieldState;
type Listener = (state: FieldState) => void;

export class VanillaFieldContext {
  private state: FieldState;
  private listeners: Set<Listener>;
  private lastServerBlocks: Record<string, Block> = {};

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
      isServerInSync: true,
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

    this.state = {
      ...newState,
      isServerInSync: this.calculateIsServerInSync(),
    };

    this.notify();
  }

  calculateIsServerInSync(): boolean {
    const lastServerBits = Object.values(this.lastServerBlocks).flatMap(
      (block) => Object.values(block.bitInRangeById)
    );

    const clientBits = Array.from(this.state.bitInRangeById.values());

    if (lastServerBits.length !== clientBits.length) {
      return false;
    }

    for (const bit of clientBits) {
      if (
        !lastServerBits.find(
          (b) => b.id === bit.id && b.x === bit.x && b.y === bit.y
        )
      ) {
        return false;
      }
    }

    return true;
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

  getIsServerInSync(): boolean {
    return this.state.isServerInSync;
  }

  // Mutation methods
  setBounds(bounds: FieldState["bounds"]): void {
    this.setState({
      ...this.state,
      bounds,
    });
  }

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

  setLastServerState(lastServerBlocks: Record<string, Block>): void {
    this.lastServerBlocks = lastServerBlocks;

    const nextBitInRangeById = new Map(this.state.bitInRangeById);

    for (const block of Object.values(lastServerBlocks)) {
      for (const bit of Object.values(block.bitInRangeById)) {
        nextBitInRangeById.set(bit.id, {
          ...bit,
          created_at: new Date(bit.created_at),
        });
      }
    }

    this.setState({
      ...this.state,
      bitInRangeById: nextBitInRangeById,
    });
  }
}

// Create a singleton instance
export const vanillaFieldContext = new VanillaFieldContext();
