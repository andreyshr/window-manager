import { WindowBounds } from '../components/window';
import { BoundsProcessor } from './types';

export type DragBoundsProcessorOptions = {
  snapThreshold: number;
};

export class DragBoundsProcessor implements BoundsProcessor {
  constructor(
    private root: HTMLElement,
    private element: HTMLElement,
    private options: DragBoundsProcessorOptions
  ) {}

  getBounds(event: MouseEvent, bounds: WindowBounds): { bounds: WindowBounds } {
    const left =
      ((this.element.offsetLeft + event.movementX) * 100) /
      this.root.offsetWidth;
    const top =
      ((this.element.offsetTop + event.movementY) * 100) /
      this.root.offsetHeight;

    return {
      bounds: { width: bounds.width, height: bounds.height, left, top },
    };
  }
}
