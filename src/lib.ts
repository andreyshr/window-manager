import './styles/style.css';
import {
  WindowManager,
  type WindowManagerOptions,
} from './components/window-manager';
import { WmWindow, type WindowOptions } from './components/window';
import { Events } from './event-emitter/events';
import { type WindowSchema } from './types';

export {
  WindowManager,
  WmWindow,
  Events,
  type WindowManagerOptions,
  type WindowOptions,
  type WindowSchema,
};
