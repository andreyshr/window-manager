import { WindowBounds } from '../components/window';
import { BoundsProcessor } from './types';

export const enum PresetBound {
  Maximized = 'maximized',
  TopLeft = 'top-left',
  TopRight = 'top-right',
  BottomLeft = 'bottom-left',
  BottomRight = 'bottom-right',
  Left = 'left',
  Right = 'right',
}

const PRESET_BOUNDS_CTORS: Record<PresetBound, () => WindowBounds> = {
  [PresetBound.Maximized]: () => ({
    width: 100,
    height: 100,
    left: 0,
    top: 0,
  }),
  [PresetBound.TopLeft]: () => ({
    width: 50,
    height: 50,
    left: 0,
    top: 0,
  }),
  [PresetBound.TopRight]: () => ({
    width: 50,
    height: 50,
    left: 50,
    top: 0,
  }),
  [PresetBound.BottomLeft]: () => ({
    width: 50,
    height: 50,
    left: 0,
    top: 50,
  }),
  [PresetBound.BottomRight]: () => ({
    width: 50,
    height: 50,
    left: 50,
    top: 50,
  }),
  [PresetBound.Right]: () => ({
    width: 50,
    height: 100,
    left: 50,
    top: 0,
  }),
  [PresetBound.Left]: () => ({
    width: 50,
    height: 100,
    left: 0,
    top: 0,
  }),
} as const;

export class PresetBoundsProcessor implements BoundsProcessor {
  getBounds(type: PresetBound) {
    return { bounds: PRESET_BOUNDS_CTORS[type]() };
  }
}
