use serde::{Deserialize, Serialize};
use std::path::Path;
use std::{fs, io};
use tauri::path::BaseDirectory;
use tauri::Manager;

#[derive(Serialize, Deserialize, Default)]
struct AppConfig {
    image_folder: Option<String>,
    target_folder: Option<String>,
}

#[tauri::command]
fn save_config(config: AppConfig, app: tauri::AppHandle) -> Result<(), String> {
    let path = app
        .path()
        .resolve("config.json", BaseDirectory::AppConfig)
        .map_err(|e| e.to_string())?;

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    let data = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    fs::write(&path, data).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn load_config(app: tauri::AppHandle) -> Result<AppConfig, String> {
    let path = app
        .path()
        .resolve("config.json", BaseDirectory::AppConfig)
        .map_err(|e| e.to_string())?;

    if !path.exists() {
        return Ok(AppConfig::default());
    }

    let data = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let config: AppConfig = serde_json::from_str(&data).map_err(|e| e.to_string())?;
    Ok(config)
}

#[tauri::command]
fn read_images_from_folder(folder: String) -> Vec<String> {
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
                    "png" | "jpg" | "jpeg" | "gif" | "bmp" | "webm" | "webp"
                ) {
                    images.push(path.to_string_lossy().to_string());
                }
            }
        }
    }

    images
}

#[derive(Serialize, Deserialize, Default)]
struct Target {
    name: String,
    path: String,
}

fn visit_dirs(dir: &Path, targets: &mut Vec<Target>) -> io::Result<()> {
    if !dir.is_dir() {
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

        visit_dirs(&path, targets)?;
    }

    Ok(())
}

#[tauri::command]
fn read_targets_from_folder(folder: String) -> Vec<Target> {
    let mut targets = Vec::new();

    if let Err(_) = visit_dirs(Path::new(&folder), &mut targets) {
        return Vec::new();
    }

    targets.sort_by_key(|t| t.name.clone());
    targets
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            read_images_from_folder,
            read_targets_from_folder,
            save_config,
            load_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
