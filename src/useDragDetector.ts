import { useEffect } from "react";
import { useController } from "@figliolia/react-hooks";
import { DragDetector } from "./DragDetector";
import type { IDragDetectorOptions } from "./types";

/**
 * useDragDetector
 *
 * Sets up a `DragDetector` instance with the specified options
 * and returns it. When the hook unmounts, the `DragDetector`
 * instance is automatically destroyed
 *
 * To attach your drag detector instance to a DOM node:
 * ```tsx
 * const detector = useDragDetector(options);
 *
 * <div className='my-element' {...detector.bindings} />
 * ```
 */
export const useDragDetector = <T extends HTMLElement>(
  options: IDragDetectorOptions<T>,
): DragDetector<T> => {
  const detector = useController(new DragDetector<T>(options));

  useEffect(() => {
    detector.setOptions(options);
    return () => {
      detector.destroy();
    };
  }, [options, detector]);

  return detector;
};
