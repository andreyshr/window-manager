import { ResizerPosition } from '../components/resizer';
import { BoundsProcessor } from './types';
import { WindowBounds } from '../components/window';

export class ResizeProcessor implements BoundsProcessor {
  private root: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  getBounds(
    event: MouseEvent,
    bounds: WindowBounds,
    resizerPosition: ResizerPosition
  ): { bounds: WindowBounds } {
    let { width, height, left, top } = bounds;

    switch (resizerPosition) {
      case 'left':
        width -= (event.movementX * 100) / this.root.offsetWidth;
        left += (event.movementX * 100) / this.root.offsetWidth;
        break;
      case 'right':
        width += (event.movementX * 100) / this.root.offsetWidth;
        break;
      case 'top':
        height -= (event.movementY * 100) / this.root.offsetHeight;
        top += (event.movementY * 100) / this.root.offsetHeight;
        break;
      case 'bottom':
        height += (event.movementY * 100) / this.root.offsetHeight;
        break;
      case 'top-left':
        width -= (event.movementX * 100) / this.root.offsetWidth;
        left += (event.movementX * 100) / this.root.offsetWidth;
        height -= (event.movementY * 100) / this.root.offsetHeight;
        top += (event.movementY * 100) / this.root.offsetHeight;
        break;
      case 'top-right':
        width += (event.movementX * 100) / this.root.offsetWidth;
        height -= (event.movementY * 100) / this.root.offsetHeight;
        top += (event.movementY * 100) / this.root.offsetHeight;
        break;
      case 'bottom-left':
        width -= (event.movementX * 100) / this.root.offsetWidth;
        left += (event.movementX * 100) / this.root.offsetWidth;
        height += (event.movementY * 100) / this.root.offsetHeight;
        break;
      case 'bottom-right':
        width += (event.movementX * 100) / this.root.offsetWidth;
        height += (event.movementY * 100) / this.root.offsetHeight;
        break;
      default:
        resizerPosition satisfies never;
        throw new Error('Unhandled resizer position type');
    }

    return { bounds: { width, height, left, top } };
  }
}
