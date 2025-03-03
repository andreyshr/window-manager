import { Window } from './components/window';

export type ItemSchema = {
  title: string;
  width: number;
  height: number;
  position: [number, number];
  isClosable: boolean;
  ctor: (window: Window) => HTMLElement;
  props?: Record<string, unknown>;
};

export interface Component {
  getElement: () => HTMLElement;
  destroy: () => void;
}
