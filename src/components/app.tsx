import classes from "./app.module.css";
import { Folders } from "./folders/folders";
import { ImageView } from "./imageView/imageView";
import { ImageSorterProvider } from "../contexts/imageSorterContext";

export const App = () => {
  return (
    <main className={classes.container}>
      <ImageSorterProvider>
        <ImageView />
        <Folders />
      </ImageSorterProvider>
    </main>
  );
};
