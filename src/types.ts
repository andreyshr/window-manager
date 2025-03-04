import { Window } from './components/window';

export type WindowSchema = {
  title: string;
  name: string;
  width: number;
  height: number;
  position: [number, number];
  isClosable: boolean;
  ctor?: ContentCtor;
  props?: Record<string, unknown>;
};

export type ContentCtor = (
  window: Window,
  container: HTMLElement,
  schema: WindowSchema
) => Promise<void> | void;

export interface Component {
  getElement: () => HTMLElement;
  destroy: () => void;
}
