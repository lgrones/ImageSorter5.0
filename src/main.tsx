import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./components/app";
import "./main.css";
import {
  loadConfig,
  readImagePaths,
  readTargetPaths,
} from "./operations/operations";
import { ImageSorterProvider } from "./contexts/imageSorterContext";

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement!);

root.render(<span className="centered loader" />);

const config = await loadConfig();

const imagePaths = config.imageFolderPath
  ? await readImagePaths(config.imageFolderPath)
  : [];

const targetFolders = config.targetFolderPath
  ? await readTargetPaths(config.targetFolderPath)
  : [];

root.render(
  <React.StrictMode>
    <ImageSorterProvider
      imageFolderPath={config.imageFolderPath ?? ""}
      targetFolderPath={config.targetFolderPath ?? ""}
      imagePaths={imagePaths}
      targetFolders={targetFolders}
    >
      <App />
    </ImageSorterProvider>
  </React.StrictMode>
);
