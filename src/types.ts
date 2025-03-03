import { Window } from './components/window';

export type ItemSchema = {
  title: string;
  width: number;
  height: number;
  position: [number, number];
  isClosable: boolean;
  ctor: ContentCtor;
  props?: Record<string, unknown>;
};

export type ContentCtor = (window: Window) => HTMLElement;

export interface Component {
  getElement: () => HTMLElement;
  destroy: () => void;
}
