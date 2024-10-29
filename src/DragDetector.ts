import type { DragEvent, DragMoveEvent, IDragDetectorOptions } from "./types";

/**
 * DragDetector
 *
 * Given an x/y Threshold, detects mouse and touch driven
 * drags on the target element. An element is targeted by
 * calling:
 *
 * ```typescript
 * const node = document.getElementById("myElement");
 * const detector = new DragDetector({
 *   callback: ({ xDelta, rect, node }) => {
 *     const translate = parseInt(node.style.translate.slice(0, -2));
 *     const next = Math.max(0, Math.min(translate + xDelta, rect.width));
 *     node.style.translate = next;
 *   }
 * });
 * detector.register(node);
 * node.addEventListener("mousedown", detector.onMouseDown);
 * node.addEventListener("touchstart", detector.onMouseDown);
 * ```
 */
export class DragDetector<T extends HTMLElement> {
  public node?: T;
  public active = false;
  private startX = 0;
  private startY = 0;
  private xDelta = 0;
  private yDelta = 0;
  private currentX = 0;
  private currentY = 0;
  private lastRect?: Readonly<DOMRect>;
  public options: Required<IDragDetectorOptions<T>>;
  constructor(options: IDragDetectorOptions<T>) {
    this.options = DragDetector.mergeDefaultOptions(options);
  }

  public static defaultOptions: Omit<
    IDragDetectorOptions<HTMLElement>,
    "callback"
  > = {
    xThreshold: Infinity,
    yThreshold: Infinity,
  };

  /**
   * register
   *
   * Registers a DOM node to target for the `DragDetector`
   * instance
   */
  public register = (node: T) => {
    this.node = node;
  };

  /**
   * setOptions
   *
   * Allows users to update options on the fly
   */
  public setOptions(options: IDragDetectorOptions<T>) {
    this.options = DragDetector.mergeDefaultOptions(options);
  }

  /**
   * destroy
   *
   * Cleans up the `DragDetector` instance and event listeners
   */
  public destroy() {
    this.active = false;
    this.lastRect = undefined;
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
    document.removeEventListener("touchmove", this.onMouseMove);
    document.removeEventListener("touchend", this.onMouseUp);
  }

  public onMouseDown = <E extends DragEvent<T>>(e: E) => {
    this.yDelta = 0;
    this.xDelta = 0;
    this.currentX = 0;
    this.currentY = 0;
    if (!this.node) {
      return;
    }
    const [x, y] = this.mouseCoordinates(this.node, e);
    const { xThreshold, yThreshold } = this.options;
    if (x <= xThreshold && y <= yThreshold) {
      this.startX = x;
      this.startY = y;
      this.currentX = x;
      this.currentY = y;
      this.active = true;
      this.listen();
    }
  };

  private onMouseMove = <E extends DragMoveEvent>(e: E) => {
    if (!this.active || !this.node) {
      return;
    }
    const [x, y, rect] = this.mouseCoordinates(this.node, e);
    this.lastRect = rect;
    this.xDelta = x - this.currentX;
    this.yDelta = y - this.currentY;
    this.options.callback({
      x,
      y,
      rect,
      node: this.node,
      xDelta: this.xDelta,
      yDelta: this.yDelta,
      xDistance: x - this.startX,
      yDistance: y - this.startY,
    });
    this.currentX = x;
    this.currentY = y;
  };

  private onMouseUp = () => {
    this.options.callback({
      exit: true,
      node: this.node!,
      x: this.currentX,
      y: this.currentY,
      xDelta: this.yDelta,
      yDelta: this.xDelta,
      rect: this.lastRect!,
      xDistance: this.currentX - this.startX,
      yDistance: this.currentY - this.startY,
    });
    this.destroy();
  };

  /**
   * bindings
   *
   * Bindings for React users to attach their instances to DOM
   * elements
   * ```tsx
   * const Component = () => {
   *   const detector = useDragDetector(options);
   *   return (
   *     <div {...detector.bindings} />
   *   );
   * }
   * ```
   */
  public readonly bindings = {
    ref: this.register,
    onMouseDown: this.onMouseDown,
    onTouchStart: this.onMouseDown,
  };

  private mouseCoordinates<T extends HTMLElement>(
    node: T,
    e: DragEvent<T>,
  ): [number, number, Readonly<DOMRect>] {
    let clientX: number;
    let clientY: number;
    if ("touches" in e) {
      ({ clientX, clientY } = e.touches[0]);
    } else {
      ({ clientX, clientY } = e);
    }
    const rect = this.lastRect || node.getBoundingClientRect();
    return [clientX - rect.left, clientY - rect.top, rect];
  }

  private listen() {
    document.addEventListener("mousemove", this.onMouseMove, { passive: true });
    document.addEventListener("mouseup", this.onMouseUp, { passive: true });
    document.addEventListener("touchmove", this.onMouseMove, { passive: true });
    document.addEventListener("touchend", this.onMouseUp, { passive: true });
  }

  private static mergeDefaultOptions<T extends HTMLElement>(
    options: IDragDetectorOptions<T>,
  ) {
    return Object.assign({}, this.defaultOptions, options) as Required<
      IDragDetectorOptions<T>
    >;
  }
}
