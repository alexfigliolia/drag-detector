# Drag Detector
Mouse and Touch driven drag detection for DOM elements. This package is great for driving swipe, drag, and movement animations driven by the end-user's pointer.

<video title="Mobile Demo" src="https://github.com/user-attachments/assets/282a6ad0-103d-43a8-9ecb-7ae80eb9e941" height="auto" width="auto"></video>

## Installation
```bash
npm i @figliolia/drag-detector
# or 
yarn add @figliolia/drag-detector
```

## Basic Usage
### Vanilla JavaScript
To use the `DragDetector` in your vanilla JS code, simply grab a reference to your DOM node and attach it to a `DragDetector` instance:
```typescript
import { DragDetector } from "@figliolia/drag-detector";

const node = document.getElementById("myElement");

const detector = new DragDetector({
  xThreshold: Infinity, // Max distance from the left of the target node to detect drag movements - by default the entire X Axis is draggable
  yThreshold: Infinity, // Max distance from the top of the target node to detect drag movements - by default the entire Y Axis is draggable
  callback: ({ 
    x, // pointer X
    y, // pointer Y
    exit, // is this event a touchend/mouseup event
    rect, // node.getBoundingClientRect()
    node, // your DOM element
    xDelta, // pointer x minus previous pointer x
    yDelta, // pointer y minus previous pointer y
    xDistance, // accumulated x distance since drag start 
    yDistance, // accumulated y distance since drag start
  }) => {
    // Logic to run on drag
    node.style.translate = `${x}px ${y}px`;
  }
});

detector.register(node);
const controller = new AbortController();
node.addEventListener("mousedown", detector.onMouseDown, { signal: controller.signal });
node.addEventListener("touchstart", detector.onMouseDown, { signal: controller.signal });

// to clean up
detector.destroy()
controller.abort();
```

### React
This module provides bindings for React users to simplify using the `DragDetector` inside components
```tsx
import { useDragDetector } from "@figliolia/drag-detector";

export const DraggableComponent = ({ children }) => {

  const options = useMemo(() => ({
    callback: ({ y, x, node }) => {
      node.style.translate = `${x}px ${y}px`;
    },
  }), []);

  const detector = useDragDetector(options);

  return (
    <div {...detector.bindings}>
      {children}
    </div>
  );
}
```

### Smoothing animations between points
To smooth animation or add easing to your drag detector's callbacks you may choose to `lerp` between the current and next states of your drag. To accomplish this you can wrap your callback logic in `requestAnimationFrame` and apply [Easing Functions](https://easings.net).

The event passed to your callback contains accumulated distances, current positions, as well as deltas which you can use to create more fine-grained animations:

```typscript
interface DragEvent { 
  x: number; // pointer X
  y: number; // pointer Y
  exit: boolean; // is this event a touchend/mouseup event
  rect: DOMRectReadOnly; // node.getBoundingClientRect()
  node: HTMLElement; // your DOM element
  xDelta: number; // pointer x minus previous pointer x
  yDelta: number; // pointer y minus previous pointer y
  xDistance: number; // accumulated x distance since drag start 
  yDistance: number; // accumulated y distance since drag start
}
```