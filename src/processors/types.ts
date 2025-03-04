import { WindowBounds } from '../components/window';
import { PresetBound } from './preset-bounds';

export interface BoundsProcessor {
  getBounds(...args: unknown[]): {
    bounds: WindowBounds;
  };
}

export type Snap =
  | PresetBound.Left
  | PresetBound.Right
  | PresetBound.TopLeft
  | PresetBound.TopRight
  | PresetBound.BottomLeft
  | PresetBound.BottomRight;
