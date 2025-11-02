import { memo, useDeferredValue } from "react";
import { Target } from "../../../contexts/imageSorterReducer";
import classes from "./folderList.module.css";
import { useImageSorter } from "../../../contexts/imageSorterContext";

interface FolderListProps {
  targets: Target[];
}

export const FolderList = ({ targets }: FolderListProps) => {
  const deferredTargets = useDeferredValue(targets);

  return (
    <div className={classes.list} id="folders">
      {deferredTargets.length ? (
        <Folders targets={deferredTargets} />
      ) : (
        <span className={classes.empty}>No folders found</span>
      )}
    </div>
  );
};

interface FoldersProps {
  targets: Target[];
}

const Folders = memo(({ targets }: FoldersProps) => {
  const { moveImages } = useImageSorter();

  return targets.map((x) => (
    <button
      key={x.path}
      className={classes.item}
      onClick={() => moveImages(x.path)}
    >
      <span>{x.name}</span>
      <span dir="rtl" title={x.path}>
        {x.path.replace(new RegExp(`${x.name}/*$`), "")}
      </span>
    </button>
  ));
});
