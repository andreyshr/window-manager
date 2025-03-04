import { PresetBound } from './preset-bounds';
import { Snap } from './types';

export type SnapProcessorOptions = {
  snapThreshold: number;
};

export class SnapProcessor {
  constructor(
    private root: HTMLElement,
    private options: SnapProcessorOptions
  ) {}

  getSnap(event: MouseEvent): Snap | undefined {
    let snap: Snap | undefined = undefined;

    if (this.isRightSnap(event)) snap = PresetBound.Right;
    else if (this.isLeftSnap(event)) snap = PresetBound.Left;
    else if (this.isTopRightSnap(event)) snap = PresetBound.TopRight;
    else if (this.isTopLeftSnap(event)) snap = PresetBound.TopLeft;
    else if (this.isBottomRightSnap(event)) snap = PresetBound.BottomRight;
    else if (this.isBottomLeftSnap(event)) snap = PresetBound.BottomLeft;

    return snap;
  }

  private isRightSnap(event: MouseEvent) {
    return (
      this.root.offsetWidth + this.root.offsetLeft - event.clientX <
        this.options.snapThreshold &&
      event.clientY - this.root.offsetTop > this.options.snapThreshold &&
      this.root.offsetHeight + this.root.offsetTop - event.clientY >
        this.options.snapThreshold
    );
  }

  private isLeftSnap(event: MouseEvent) {
    return (
      event.clientX - this.root.offsetLeft < this.options.snapThreshold &&
      event.clientY - this.root.offsetTop > this.options.snapThreshold &&
      this.root.offsetHeight + this.root.offsetTop - event.clientY >
        this.options.snapThreshold
    );
  }

  private isTopRightSnap(event: MouseEvent) {
    return (
      this.root.offsetWidth + this.root.offsetLeft - event.clientX <
        this.options.snapThreshold &&
      event.clientY - this.root.offsetTop < this.options.snapThreshold
    );
  }

  private isTopLeftSnap(event: MouseEvent) {
    return (
      event.clientX - this.root.offsetLeft < this.options.snapThreshold &&
      event.clientY - this.root.offsetTop < this.options.snapThreshold
    );
  }

  private isBottomRightSnap(event: MouseEvent) {
    return (
      this.root.offsetWidth + this.root.offsetLeft - event.clientX <
        this.options.snapThreshold &&
      this.root.offsetHeight - event.clientY < this.options.snapThreshold
    );
  }

  private isBottomLeftSnap(event: MouseEvent) {
    return (
      event.clientX - this.root.offsetLeft < this.options.snapThreshold &&
      this.root.offsetHeight - event.clientY < this.options.snapThreshold
    );
  }
}
