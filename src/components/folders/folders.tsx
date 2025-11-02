import { useFuzzySearchList } from "@nozbe/microfuzz/react";
import { useCallback, useState } from "react";
import { useImageSorter } from "../../contexts/imageSorterContext";
import { PathSelector } from "../pathSelector/pathSelector";
import { FolderList } from "./folderList/folderList";
import classes from "./folders.module.css";
import { Target } from "../../contexts/imageSorterReducer";

String.prototype.toLocaleLowerCase = String.prototype.toLowerCase;

export const Folders = () => {
  const [query, setQuery] = useState("");
  const { targetFolders, targetFolderPath, setTargetFolderPath } =
    useImageSorter();

  const targets = useFuzzySearchList({
    list: targetFolders,
    queryText: query,
    getText: useCallback((item: Target) => [item.name], []),
    mapResultItem: useCallback(({ item }: { item: Target }) => item, []),
  });

  return (
    <div className={classes.container}>
      <input
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        type="search"
        placeholder="Search folder..."
        id="folder-search"
        className={classes.search}
      />

      <FolderList targets={targets} />

      <PathSelector
        title="Select a target folder"
        folderPath={targetFolderPath}
        setFolderPath={setTargetFolderPath}
      />
    </div>
  );
};
