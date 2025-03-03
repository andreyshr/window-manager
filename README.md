# Window Manager

A lightweight and flexible window management library for organizing draggable and resizable windows in a web application.

## 🚀 Features

- 🖱️ **Drag & Resize** – Easily move and resize windows.
- 🔄 **Sticky Mode** – Suggest predefined sizes when snapping to corners.
- 🏗 **Modular Design** – Use only what you need.
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

```ts
import { WindowManager } from 'window-manager';

const root = document.querySelector('#wm-container');
const schema = [
  {
    title: 'My window',
    width: 50,
    height: 50,
    position: [20, 20],
    isClosable: true,
    ctor: () => document.createElement('div'),
  },
];
const wm = new WindowManager(root, schema);
```
