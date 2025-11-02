import { convertFileSrc } from "@tauri-apps/api/core";
import { useImageSorter } from "../../contexts/imageSorterContext";
import classes from "./imageView.module.css";
import { PathSelector } from "../pathSelector/pathSelector";

export const ImageView = () => {
  const {
    currentIndex,
    selectedImagePaths,
    totalImages,
    currentImagePath,
    isVideo,
    prev,
    next,
    toggleSelect,
    imageFolderPath,
    setImageFolderPath,
  } = useImageSorter();

  return (
    <div
      className={classes.container}
      data-selected={selectedImagePaths.has(currentImagePath ?? "")}
    >
      <div>
        {currentImagePath ? (
          <>
            {isVideo ? (
              <video
                controls
                loop
                src={convertFileSrc(currentImagePath, "fs")}
              />
            ) : (
              <img src={convertFileSrc(currentImagePath, "fs")} alt="current" />
            )}
          </>
        ) : (
          <span style={{ color: "var(--dimmed)" }}>No images found</span>
        )}
      </div>

      <div className={classes.info}>
        <div>
          {currentIndex + 1} / {totalImages} &nbsp;•&nbsp;{" "}
          {selectedImagePaths.size} selected
        </div>

        <div className={classes.controls}>
          <button onClick={prev}>
            <span>Prev</span>
            <kbd>&larr;</kbd>
          </button>
          <button onClick={toggleSelect}>
            <span>Select</span>
            <kbd>_</kbd>
          </button>
          <button onClick={next}>
            <span>Next</span>
            <kbd>&rarr;</kbd>
          </button>
        </div>

        <div>
          <PathSelector
            title="Select an image folder"
            folderPath={imageFolderPath}
            setFolderPath={setImageFolderPath}
          />
        </div>
      </div>
    </div>
  );
};
