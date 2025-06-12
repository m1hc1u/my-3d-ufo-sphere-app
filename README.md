# 3D Sphere Image Gallery

This application is an interactive 3D image gallery built with [Three.js](https://threejs.org/). Images are arranged evenly on the surface of a virtual sphere, which can be rotated by dragging with the mouse. Clicking on an image opens it in a fullscreen modal view.

## Features

- **3D Sphere Visualization:** Images are distributed evenly on a transparent, wireframe sphere using the Fibonacci sphere algorithm.
- **Interactive Rotation:** Drag the mouse to rotate the sphere and view images from different angles.
- **Auto-Rotation:** The sphere rotates slowly by default, pausing during user interaction or when the modal is open.
- **Fullscreen Modal:** Click any image to view it in a circular, fullscreen modal with a fade-in/out animation.
- **Responsive Design:** The sphere and images automatically resize to fit the window.

## Usage

1. **Install dependencies** (if required, e.g., via npm or yarn).
2. **Place your images** in the `/images` directory, named as `kosmita1.png`, `kosmita2.png`, etc.
3. **Open the app** in your browser. The images will appear on the 3D sphere.
4. **Rotate the sphere** by dragging with the mouse.
5. **Click an image** to view it in fullscreen. Click outside the image to close the modal.

## Technologies

- [Three.js](https://threejs.org/) for 3D rendering
- TypeScript for application logic

## Customization

- To add or change images, update the `imageFiles` array in `src/main.ts` and place your images in the `/images` folder.
- Adjust the sphere's size or rotation speed by modifying the relevant constants in `src/main.ts`.

## License

MIT License
