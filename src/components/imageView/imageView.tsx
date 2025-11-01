import { convertFileSrc } from "@tauri-apps/api/core";
import { useImageSorter } from "../../contexts/imageSorterContext";
import classes from "./imageView.module.css";
import { PathSelector } from "../pathSelector/pathSelector";

export const ImageView = () => {
  const {
    index,
    selected,
    prev,
    next,
    toggleSelect,
    total,
    imagePath,
    imageFolderPath,
    setImageFolderPath,
  } = useImageSorter();

  return (
    <div className={classes.container} data-selected={selected.has(index)}>
      <div>
        <img src={convertFileSrc(imagePath)} alt="current" />
      </div>

      <div className={classes.info}>
        <div>
          {index + 1} / {total} &nbsp;•&nbsp; {selected.size} selected
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
