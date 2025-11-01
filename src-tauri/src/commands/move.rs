use std::{
    fs, io,
    path::PathBuf,
    sync::{Arc, Mutex},
};

use crate::commands::command::Command;

pub struct MoveFiles {
    moved_files: Mutex<Vec<(PathBuf, PathBuf)>>, // (source, destination)
    files: Vec<PathBuf>,
    destination: PathBuf,
}

impl MoveFiles {
    pub fn new(files: Vec<PathBuf>, destination: PathBuf) -> Arc<Self> {
        Arc::new(Self {
            moved_files: Mutex::new(Vec::new()),
            files,
            destination,
        })
    }
}

impl Command for MoveFiles {
    fn execute(&self) {
        for file in &self.files {
            let original_path = PathBuf::from(file);

            let file_name = match original_path.file_name() {
                Some(name) => name,
                None => continue,
            };

            let destination_path = self.destination.join(file_name);

            let result = fs::rename(&original_path, &destination_path);

            if let Err(e) = result {
                if e.kind() == io::ErrorKind::CrossesDevices {
                    fs::copy(&original_path, &destination_path).unwrap();
                    fs::remove_file(&original_path).unwrap();
                } else {
                    panic!("Error moving file: {}", e);
                }
            }

            self.moved_files
                .lock()
                .unwrap()
                .push((original_path, destination_path));
        }
    }

    fn rollback(&self) -> Vec<String> {
        let mut moved = self.moved_files.lock().unwrap();
        let mut rolled_back = vec![];

        while let Some((original_path, destination_path)) = moved.pop() {
            if !destination_path.exists() || original_path.exists() {
                continue;
            }

            let result = fs::rename(&destination_path, &original_path);

            if let Err(e) = result {
                if e.kind() == io::ErrorKind::CrossesDevices {
                    fs::copy(&destination_path, &original_path).unwrap();
                    fs::remove_file(&destination_path).unwrap();
                } else {
                    panic!("Error rolling back file: {}", e);
                }
            }

            rolled_back.push(original_path.to_str().unwrap().to_string())
        }

        moved.clear();

        rolled_back
    }
}
