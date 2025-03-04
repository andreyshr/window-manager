import {
  DragBoundsProcessor,
  DragBoundsProcessorOptions,
} from '../src/processors/drag-bounds-processor';
import { WindowBounds } from '../src/components/window';
import { beforeEach, describe, expect, it } from 'vitest';

describe('DragBoundsProcessor', () => {
  let root: HTMLElement;
  let element: HTMLElement;
  let options: DragBoundsProcessorOptions;
  let processor: DragBoundsProcessor;

  beforeEach(() => {
    // Mock root and element elements
    root = document.createElement('div');
    element = document.createElement('div');

    // Mock root offsets
    Object.defineProperty(root, 'offsetWidth', { get: () => 1000 });
    Object.defineProperty(root, 'offsetHeight', { get: () => 800 });

    // Mock element offsets
    Object.defineProperty(element, 'offsetLeft', { get: () => 200 });
    Object.defineProperty(element, 'offsetTop', { get: () => 150 });

    // Define the options
    options = { snapThreshold: 10 };

    // Create an instance of DragBoundsProcessor
    processor = new DragBoundsProcessor(root, element, options);
  });

  it('should calculate the bounds correctly based on mouse movement', () => {
    const event = {
      movementX: 50, // move 50 pixels horizontally
      movementY: 30, // move 30 pixels vertically
    } as MouseEvent;

    const bounds: WindowBounds = {
      width: 300,
      height: 200,
      left: 0,
      top: 0,
    };

    const result = processor.getBounds(event, bounds);

    expect(result.bounds.left).toBeCloseTo(
      ((element.offsetLeft + event.movementX) * 100) / root.offsetWidth
    );
    expect(result.bounds.top).toBeCloseTo(
      ((element.offsetTop + event.movementY) * 100) / root.offsetHeight
    );
    expect(result.bounds.width).toBe(bounds.width);
    expect(result.bounds.height).toBe(bounds.height);
  });

  it('should calculate new bounds when the element moves beyond the root boundaries', () => {
    const event = {
      movementX: 1200, // move 1200 pixels horizontally
      movementY: 900, // move 900 pixels vertically
    } as MouseEvent;

    const bounds: WindowBounds = {
      width: 300,
      height: 200,
      left: 0,
      top: 0,
    };

    const result = processor.getBounds(event, bounds);

    // Since movementX and movementY are large, the new left and top values should still be calculated
    expect(result.bounds.left).toBeCloseTo(
      ((element.offsetLeft + event.movementX) * 100) / root.offsetWidth
    );
    expect(result.bounds.top).toBeCloseTo(
      ((element.offsetTop + event.movementY) * 100) / root.offsetHeight
    );
  });

  it('should keep the width and height from the original bounds', () => {
    const event = {
      movementX: 50,
      movementY: 30,
    } as MouseEvent;

    const bounds: WindowBounds = {
      width: 500,
      height: 400,
      left: 0,
      top: 0,
    };

    const result = processor.getBounds(event, bounds);

    expect(result.bounds.width).toBe(bounds.width);
    expect(result.bounds.height).toBe(bounds.height);
  });

  //

  it('should update left and top based on movementX and movementY', () => {
    const bounds: WindowBounds = {
      width: 50,
      height: 50,
      left: 20,
      top: 18.75,
    };
    const event = { movementX: 10, movementY: 20 } as MouseEvent;

    const result = processor.getBounds(event, bounds);

    expect(result.bounds.left).toBe(21);
    expect(result.bounds.top).toBe(21.25);
  });

  it('should not change left if movementX is 0', () => {
    const bounds: WindowBounds = {
      width: 50,
      height: 50,
      left: 20,
      top: 18.75,
    };
    const event = { movementX: 0, movementY: 20 } as MouseEvent;

    const result = processor.getBounds(event, bounds);

    expect(result.bounds.left).toBe(20);
  });

  it('should not change top if movementY is 0', () => {
    const bounds: WindowBounds = {
      width: 50,
      height: 50,
      left: 20,
      top: 18.75,
    };
    const event = { movementX: 10, movementY: 0 } as MouseEvent;

    const result = processor.getBounds(event, bounds);

    expect(result.bounds.top).toBe(18.75);
  });

  it('should return NaN if movementX or movementY is NaN', () => {
    const bounds: WindowBounds = { width: 50, height: 50, left: 20, top: 30 };
    const event = { movementX: NaN, movementY: NaN } as MouseEvent;

    const result = processor.getBounds(event, bounds);

    expect(result.bounds.left).toBeNaN();
    expect(result.bounds.top).toBeNaN();
  });

  //   it('should throw an error if bounds are empty', () => {
  //     const bounds = {} as WindowBounds;
  //     const event = { movementX: 10, movementY: 20 } as MouseEvent;

  //     expect(() => processor.getBounds(event, bounds)).toThrow();
  //   });
});
