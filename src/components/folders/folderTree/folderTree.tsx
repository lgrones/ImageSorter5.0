import { memo, useDeferredValue } from "react";
import { Target } from "../../../contexts/imageSorterReducer";
import classes from "./folderTree.module.css";
import { useImageSorter } from "../../../contexts/imageSorterContext";

interface FolderTreeProps {
  targets: Target[];
}

export const FolderTree = ({ targets }: FolderTreeProps) => {
  const deferredTargets = useDeferredValue(targets);

  return (
    <div className={classes.list} id="folders">
      <Folders targets={deferredTargets} />
    </div>
  );
};

interface FoldersProps {
  targets: Target[];
}

const Folders = memo(({ targets }: FoldersProps) => {
  const { move } = useImageSorter();

  return targets.map((x) => (
    <button key={x.path} className={classes.item} onClick={() => move(x.path)}>
      <span>{x.name}</span>
      <span dir="rtl" title={x.path}>
        {x.path
          .substring(0, x.path.length - 1)
          .substring(0, x.path.lastIndexOf("/"))}
      </span>
    </button>
  ));
});
