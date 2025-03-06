# Window Manager

A lightweight and flexible window management library for organizing draggable and resizable windows in a web application.

## 🚀 Features

- ✥ **Drag & Resize** – Easily move and resize windows.
- 🔄 **Sticky Mode** – Suggest predefined sizes when snapping to corners.
- 💾 **Save & Restore Configuration** – Save window states and restore them later.
- ⚡ **Optimized for Performance** – Minimal overhead.

[Simple Example Demo](https://glittery-selkie-e5f375.netlify.app)  
 A basic demonstration of the library's functionality.

[Demo with iframe widgets](https://cute-sopapillas-01fd90.netlify.app/)  
 A more advanced demo showcasing iframe-based widgets.

## 📦 Installation

```sh
npm install window-manager
# or
yarn add window-manager
```

## 🚀 Usage

### 1️⃣ Basic Setup

Create **root** element:

```html
<div id="wm"></div>
```

Import and initialize the **WindowManager**:

```ts
import { WindowManager } from 'window-manager';
import 'window-manager/style.css';

const root = document.querySelector('#wm') as HTMLElement;
const schema = [
  {
    title: 'My window',
    name: 'myWindow',
    width: 50,
    height: 50,
    position: [20, 20],
    isClosable: true,
    ctor: (window, container, schema) => {
      const element = document.createElement('div');
      container.appendChild(element);
    },
  },
];

const wm = new WindowManager(root, schema);

wm.init();
```

### 2️⃣ Advanced Setup

Create **root** element:

```html
<div id="wm"></div>
```

Import and initialize the **WindowManager**:

```ts
import { WindowManager } from 'window-manager';
import 'window-manager/style.css';

const root = document.querySelector('#wm') as HTMLElement;
const schema = [
  {
    title: 'My window',
    name: 'myWindow',
    width: 50,
    height: 50,
    position: [20, 20],
    isClosable: true,
    props: {
      myProp: 'My first window',
    },
  },
];

const wm = new WindowManager(root, schema);

wm.registerConstructor('myWindow', (window, container, schema) => {
  const element = document.createElement('div');
  if (typeof schema.props?.myProp === 'string') {
    element.innerText = schema.props.myProp;
  }
  container.appendChild(element);
});

wm.init();
```

## ⚙️ Configuration Options

### WindowManagerOptions

You can customize `WindowManager` behavior by passing an options object when initializing it.

```ts
{
  snapThreshold?: number;
  minWindowWidth?: number;
  minWindowHeight?: number;
}
```

| Option            | Type     | Default | Description                                                                                            |
| ----------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------ |
| `snapThreshold`   | `number` | `20`    | Defines the distance (in pixels) within which a window will snap to predefined positions when dragged. |
| `minWindowWidth`  | `number` | `10`    | The minimum allowed width for a window (in percent).                                                   |
| `minWindowHeight` | `number` | `10`    | The minimum allowed height for a window (in percent).                                                  |

### WindowSchema

Each window is represented as an object following this schema:

```ts
{
  title: string;
  name: string;
  width: number;
  height: number;
  position: [number, number];
  isClosable?: boolean;
  isExpandable?: boolean;
  ctor?: ContentCtor;
  props?: Record<string, unknown>;
}
```

| Property       | Type                                 | Default | Description                                                              |
| -------------- | ------------------------------------ | ------- | ------------------------------------------------------------------------ |
| `title`        | `string`                             |         | The display title of the window.                                         |
| `name`         | `string`                             |         | A unique identifier for the window.                                      |
| `width`        | `number`                             |         | The initial width of the window (in percent).                            |
| `height`       | `number`                             |         | The initial height of the window (in percent).                           |
| `position`     | `[number, number]`                   |         | The `[x, y]` coordinates for the window's initial position (in percent). |
| `isClosable`   | `boolean` (optional)                 | `true`  | If `true`, the window can be closed by the user.                         |
| `isExpandable` | `boolean` (optional)                 | `true`  | If `true`, the window can be maximized.                                  |
| `ctor`         | `ContentCtor` (optional)             |         | A constructor for the window content component.                          |
| `props`        | `Record<string, unknown>` (optional) |         | Custom properties passed to the content component.                       |

## 📢 Event Listeners

You can subscribe to the following events for `WindowManager` and `WmWindow` to handle user interactions dynamically.

### 🏠 Window Events

- **`window:close`** – Triggered when a window is closed.
- **`window:select`** – Fired when a window is selected.
- **`window:expand`** – Emitted when a window is expanded.

### 🎯 Drag Events

- **`drag:start`** – Fires when dragging starts.
- **`drag`** – Continuously emitted while dragging.
- **`drag:end`** – Fires when dragging ends.

### 📏 Resize Events

- **`resize:start`** – Fires when resizing starts.
- **`resize`** – Continuously emitted while resizing.
- **`resize:end`** – Fires when resizing ends.

### 📌 Usage Example

To listen for an event, use:

```ts
wm.on(Events.DragStart, (event) => {
  console.log('Dragging started:', event);
});

// OR

wm.registerConstructor('myWindow', (window, container, schema) => {
  const element = document.createElement('div');
  window.on(Events.DragStart, (event) => {
    console.log('Dragging started:', event);
  });
  container.appendChild(element);
});
```
