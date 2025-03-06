import { ResizerPosition } from '../components/resizer';
import { Snap } from '../processors/types';

export const Events = {
  CloseWindow: 'window:close',
  SelectWindow: 'window:select',
  UnselectWindow: 'window:unselect',
  ExpandWindow: 'window:expand',
  DragStart: 'drag:start',
  Drag: 'drag',
  DragEnd: 'drag:end',
  ResizeStart: 'resize:start',
  Resize: 'resize',
  ResizeEnd: 'resize:end',
} as const;

export type CloseButtonEvent = {
  [Events.CloseWindow]: undefined;
};

export type ExpandButtonEvent = {
  [Events.ExpandWindow]: { isMaximized: boolean };
};

export type ControlsEvent = {
  [Events.CloseWindow]: undefined;
  [Events.ExpandWindow]: { isMaximized: boolean };
};

export type HeaderEvent = {
  [Events.CloseWindow]: undefined;
  [Events.ExpandWindow]: { isMaximized: boolean };
  [Events.DragStart]: { event: MouseEvent };
  [Events.Drag]: { event: MouseEvent };
  [Events.DragEnd]: { event: MouseEvent };
};

export type ResizerEvent = {
  [Events.ResizeStart]: { event: MouseEvent; resizerPosition: ResizerPosition };
  [Events.Resize]: {
    event: MouseEvent;
    resizerPosition: ResizerPosition | null;
  };
  [Events.ResizeEnd]: {
    event: MouseEvent;
    resizerPosition: ResizerPosition | null;
  };
};

export type WindowEvent = {
  [Events.CloseWindow]: { id: string };
  [Events.SelectWindow]: { id: string };
  [Events.UnselectWindow]: { id: string };
  [Events.ExpandWindow]: { isMaximized: boolean };
  [Events.DragStart]: { event: MouseEvent };
  [Events.Drag]: { event: MouseEvent; snap: Snap | undefined };
  [Events.DragEnd]: { event: MouseEvent };
  [Events.ResizeStart]: { event: MouseEvent; resizerPosition: ResizerPosition };
  [Events.Resize]: {
    event: MouseEvent;
    resizerPosition: ResizerPosition | null;
  };
  [Events.ResizeEnd]: {
    event: MouseEvent;
    resizerPosition: ResizerPosition | null;
  };
};

export type WindowManagerEvent = {
  [Events.CloseWindow]: { id: string };
  [Events.SelectWindow]: { id: string };
  [Events.UnselectWindow]: { id: string };
  [Events.ExpandWindow]: { isMaximized: boolean };
  [Events.DragStart]: { event: MouseEvent };
  [Events.Drag]: { event: MouseEvent; snap: Snap | undefined };
  [Events.DragEnd]: { event: MouseEvent };
  [Events.ResizeStart]: { event: MouseEvent; resizerPosition: ResizerPosition };
  [Events.Resize]: {
    event: MouseEvent;
    resizerPosition: ResizerPosition | null;
  };
  [Events.ResizeEnd]: {
    event: MouseEvent;
    resizerPosition: ResizerPosition | null;
  };
};

// export type EventMap = {
//   [K in keyof WindowManagerEvent]: (data: WindowManagerEvent[K]) => void;
// };
