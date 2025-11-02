use serde::{Deserialize, Serialize};
use std::path::Path;
use std::{fs, io};

#[derive(Serialize, Deserialize, Default)]
pub struct Target {
    name: String,
    path: String,
}

fn visit_folders(dir: &Path, targets: &mut Vec<Target>) -> io::Result<()> {
    if dir.is_file() {
        return Ok(());
    }

    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();

        if path.is_file() {
            continue;
        }

        if let Some(name) = path.file_name().and_then(|s| s.to_str()) {
            targets.push(Target {
                name: name.to_string(),
                path: path.to_string_lossy().to_string(),
            });
        }

        visit_folders(&path, targets)?;
    }

    Ok(())
}

#[tauri::command]
pub fn read_targets_from_folder(folder: String) -> Vec<Target> {
    let mut targets = Vec::new();

    visit_folders(Path::new(&folder), &mut targets).unwrap_or_default();

    targets.sort_by_key(|t| t.name.clone());
    targets
}

#[tauri::command]
pub fn read_images_from_folder(folder: String) -> Vec<String> {
    let mut images = Vec::new();

    if let Ok(entries) = fs::read_dir(&folder) {
        for entry in entries.flatten() {
            let path = entry.path();

            if !path.is_file() {
                continue;
            }

            if let Some(ext) = path.extension().and_then(|s| s.to_str()) {
                if matches!(
                    ext.to_lowercase().as_str(),
                    "png" | "jpg" | "jpeg" | "gif" | "bmp" | "webp" | "jfif" | "webm" | "mp4"
                ) {
                    images.push(path.to_string_lossy().to_string());
                }
            }
        }
    }

    images
}
