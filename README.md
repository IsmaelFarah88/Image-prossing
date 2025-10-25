# Image Analysis Tool

This is a web-based application that performs fundamental image analysis and reconstruction directly in the browser. It allows users to upload an image and see a detailed breakdown of its properties, color distribution, and dominant colors. The tool also features several artistic reconstruction algorithms that rebuild the image visually, demonstrating core concepts of digital image processing without relying on any AI models.

## Features

- **Drag & Drop / Click to Upload**: Easy and intuitive image uploading.
- **Client-Side Analysis**: All processing is done in the user's browser, ensuring privacy and speed. No data is sent to a server.
- **Image Properties**: Displays basic information like dimensions (width, height) and total pixel count.
- **Dominant Color Palette**: Extracts the top 10 most prominent colors from the image.
- **Color Distribution Histogram**: Visualizes the intensity of Red, Green, and Blue color channels across the image using a bar chart.
- **Animated Visual Reconstruction**: Rebuilds the image using different algorithms, with the process animated in real-time.
  - **Mosaic**: Reconstructs the image as a grid of colored blocks, where each block is the average color of the corresponding area.
  - **Circles (Pointillism)**: Recreates the image using thousands of circles, where the color is sampled from the original image and the size is based on pixel brightness.
  - **Palette Quantization**: Redraws the image using only the 10 dominant colors previously extracted.
- **Interactive Controls**: Users can adjust parameters for each reconstruction style (e.g., block size, number of circles) and see the results instantly.
- **Responsive Design**: A clean and modern UI that works on both desktop and mobile devices.

## How It Works: Technical Explanation

The application uses the HTML5 Canvas API to read and manipulate pixel data from the user's uploaded image.

1.  **Initial Analysis (`analyzeImage`)**:
    - The uploaded image is drawn onto a hidden canvas.
    - `CanvasRenderingContext2D.getImageData()` is called to get a `Uint8ClampedArray` containing the RGBA value for every pixel.
    - **Properties**: Width and height are read directly from the image element.
    - **Histogram**: The code iterates through the pixel data array, counting the occurrences of each intensity value (0-255) for the R, G, and B channels.
    - **Dominant Colors**: To efficiently find dominant colors, the image's colors are "quantized" (color depth is reduced) by shifting bits (`>> 4`). This groups similar colors together. The occurrences of these quantized colors are counted, sorted, and the top 10 are selected as the palette.

2.  **Image Reconstruction**:
    - **Mosaic (`reconstructAsMosaic`)**:
        - The image is conceptually divided into a grid.
        - For each cell in the grid, the code reads the pixel data for that region from the hidden canvas.
        - It calculates the average R, G, and B values for all pixels within that cell.
        - A solid rectangle is drawn on the visible canvas at that position using the calculated average color.
    - **Circles (`reconstructAsCircles`)**:
        - This technique is inspired by Pointillism.
        - The code loops a user-defined number of times (e.g., 15,000).
        - In each iteration, it picks a random (x, y) coordinate in the image.
        - It samples the color of the single pixel at that coordinate.
        - It calculates the "brightness" (luminance) of that pixel.
        - A circle is drawn on the visible canvas at the random (x, y) position. The circle's color is the sampled color, and its radius is proportional to the calculated brightness.
    - **Palette Quantization (`reconstructWithPalette`)**:
        - This method uses the 10 dominant colors extracted during the initial analysis.
        - It iterates through every single pixel of the original image.
        - For each pixel, it calculates which of the 10 palette colors is the "closest" match. The closeness is determined by calculating the Euclidean distance in the 3D RGB color space.
        - It then replaces the original pixel's color with the closest color from the palette on the visible canvas.

## Technology Stack

- **Frontend**: React.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charting**: Recharts
- **Build Tool**: Vite (in a standard setup)

## Project Structure

```
/
├── public/
└── src/
    ├── components/         # React components (Uploader, Display, Charts, etc.)
    ├── services/           # Core logic (imageAnalyzer.ts)
    ├── types/              # TypeScript type definitions
    ├── App.tsx             # Main application component
    └── index.tsx           # Entry point
```

## Getting Started

To run this project locally:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd <project-directory>
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Start the development server:**
    ```bash
    npm run dev
    ```
5.  Open your browser and navigate to `http://localhost:5173` (or the address provided by Vite).
