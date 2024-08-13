import type {
  MouseEvent as ReactMouseEvent,
  TouchEvent as ReactTouchEvent,
} from "react";

export type Callback<A extends any[] = never[], V = void> = (...args: A) => V;

export interface IDragDetectorOptions<T extends Element> {
  xThreshold?: number;
  yThreshold?: number;
  callback: Callback<[dragEvent: IDDEvent<T>]>;
}

export interface IDDEvent<T extends Element> {
  node: T;
  x: number;
  y: number;
  exit?: boolean;
  xDelta: number;
  yDelta: number;
  xDistance: number;
  yDistance: number;
  rect: Readonly<DOMRect>;
}

export type DragEvent<T extends HTMLElement = HTMLElement> =
  | DragMoveEvent
  | ReactMouseEvent<T>
  | ReactTouchEvent<T>;

export type DragMoveEvent = MouseEvent | TouchEvent;
