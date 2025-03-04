# Window Manager

A lightweight and flexible window management library for organizing draggable and resizable windows in a web application.

## 🚀 Features

- ✥ **Drag & Resize** – Easily move and resize windows.
- 🔄 **Sticky Mode** – Suggest predefined sizes when snapping to corners.
- 💾 **Save & Restore Configuration** – Save window states and restore them later.
- ⚡ **Optimized for Performance** – Minimal overhead.

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
  if (typeof schema.props?.myProp === 'string') = schema.props.myProp;
  container.appendChild(element);
});

wm.init();
```
