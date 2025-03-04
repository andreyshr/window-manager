# Window Manager

A lightweight and flexible window management library for organizing draggable and resizable windows in a web application.

## 🚀 Features

- 🖱️ **Drag & Resize** – Easily move and resize windows.
- 🔄 **Sticky Mode** – Suggest predefined sizes when snapping to corners.
- ⚡ **Optimized for Performance** – Minimal overhead.

## 📦 Installation

```sh
npm install window-manager
# or
yarn add window-manager
```

## 🚀 Usage

### 1️⃣ Basic Setup

Import and initialize the **WindowManager**:

```html
<div id="wm"></div>
```

```ts
import { WindowManager } from 'window-manager';
import 'window-manager/dist/styles.css';

const root = document.querySelector('#wm');
const schema = [
  {
    title: 'My window',
    width: 50,
    height: 50,
    position: [20, 20],
    isClosable: true,
    ctor: (window, container) => {
      const element = document.createElement('div');
      container.appendChild(element);
    },
  },
];
const wm = new WindowManager(root, schema);
```
