import { WindowBounds } from '../components/window';
import { BoundsProcessor } from './types';

export type DragBoundsProcessorOptions = {
  snapThreshold: number;
};

export class DragBoundsProcessor implements BoundsProcessor {
  private root: HTMLElement;
  private element: HTMLElement;
  private options: DragBoundsProcessorOptions;

  constructor(
    root: HTMLElement,
    element: HTMLElement,
    options: DragBoundsProcessorOptions
  ) {
    this.root = root;
    this.element = element;
    this.options = options;
  }

  getBounds(event: MouseEvent, bounds: WindowBounds): { bounds: WindowBounds } {
    let { left, top } = bounds;

    left =
      ((this.element.offsetLeft + event.movementX) * 100) /
      this.root.offsetWidth;
    top =
      ((this.element.offsetTop + event.movementY) * 100) /
      this.root.offsetHeight;

    return {
      bounds: { width: bounds.width, height: bounds.height, left, top },
    };
  }
}
