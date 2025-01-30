export class VanillaFieldContext {
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

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener); // Returns cleanup function
  }

  setState(updater) {
    const newState =
      typeof updater === "function" ? updater(this.state) : updater;

    this.state = newState;
    this.notify();
  }

  notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  // Convenience getters
  getBitsInRange() {
    return Array.from(this.state.bitInRangeById.values());
  }

  getBounds() {
    return this.state.bounds;
  }

  getOrigin() {
    return this.state.bounds.origin;
  }

  setBounds(bounds) {
    this.setState({
      ...this.state,
      bounds,
    });
  }

  // Mutation methods
  updateBit(bitId, bitData) {
    const nextBitInRangeById = new Map(this.state.bitInRangeById);
    nextBitInRangeById.set(bitId, bitData);

    this.setState({
      ...this.state,
      bitInRangeById: nextBitInRangeById,
    });
  }

  removeBit(bitId) {
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
