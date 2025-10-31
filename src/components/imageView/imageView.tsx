import { convertFileSrc } from "@tauri-apps/api/core";
import { useImageSorter } from "../../contexts/imageSorterContext";
import classes from "./imageView.module.css";
import { PathSelector } from "../pathSelector/pathSelector";

export const ImageView = () => {
  const { index, selected, total, imagePath } = useImageSorter();

  return (
    <div className={classes.container} data-selected={selected.has(index)}>
      <div>
        <img src={convertFileSrc(imagePath)} alt="current" />
      </div>

      <div className={classes.info}>
        <div>
          <span>
            {index + 1} / {total}
          </span>

          <span>{selected.size} selected</span>
        </div>

        <div className={classes.controls}>
          <div>
            <kbd>&larr;</kbd>
            <span>Prev</span>
          </div>
          <div>
            <kbd>_</kbd>
            <span>Select</span>
          </div>
          <div>
            <kbd>&rarr;</kbd>
            <span>Next</span>
          </div>
        </div>

        <div>
          <PathSelector />
        </div>
      </div>
    </div>
  );
};
