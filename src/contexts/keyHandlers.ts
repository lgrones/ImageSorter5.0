import { Action } from "./imageSorterReducer";
import { deleteFiles, undo } from "../operations/operations";

export const handleGlobalKeys = (e: KeyboardEvent) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return false;

  if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Enter")
    return false;

  e.preventDefault();

  const folders = document.getElementById("folders") as HTMLDivElement;

  let activeItem: HTMLButtonElement | null = null;

  if (folders.contains(document.activeElement)) {
    activeItem = document.activeElement as HTMLButtonElement;
  }

  switch (e.key) {
    case "ArrowDown":
      (
        (activeItem?.nextElementSibling as HTMLButtonElement | null) ??
        (folders.firstElementChild as HTMLButtonElement | null)
      )?.focus();
      return true;
    case "ArrowUp":
      (
        (activeItem?.previousElementSibling as HTMLButtonElement | null) ??
        (folders.lastElementChild as HTMLButtonElement | null)
      )?.focus();
      return true;
    case "Enter":
      activeItem?.click();
      return true;
  }
};

export const handleControlKeys = async (
  e: KeyboardEvent,
  dispatch: (action: Action) => void,
  paths: string[]
) => {
  if (e.isComposing) return false;

  if (document.activeElement?.id === "folder-search") return false;

  if ((e.ctrlKey || e.metaKey) && e.key === "z") {
    e.preventDefault();

    const paths = await undo();
    if (paths.length) dispatch({ type: "addImages", payload: paths });

    return true;
  }

  if (e.ctrlKey || e.metaKey || e.altKey) return false;

  switch (e.key) {
    case "ArrowLeft":
      dispatch({ type: "prevImage" });
      return true;
    case "ArrowRight":
      dispatch({ type: "nextImage" });
      return true;
    case " ":
      e.preventDefault();
      dispatch({ type: "toggleImageSelect" });
      return true;
    case "Delete":
      deleteFiles(paths);
      dispatch({ type: "removeImages", payload: paths });
      return true;
  }

  return false;
};

export const handleSearchKeys = (e: KeyboardEvent) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return false;

  const searchInput = document.getElementById(
    "folder-search"
  ) as HTMLInputElement;

  if (document.activeElement?.id === "folder-search") {
    if (e.key === "Escape") {
      e.preventDefault();
      searchInput?.blur();
    }

    return;
  }

  searchInput?.focus();
  searchInput.select();
};
