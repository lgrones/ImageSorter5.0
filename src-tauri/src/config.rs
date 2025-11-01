use serde::{Deserialize, Serialize};
use std::fs;
use tauri::path::BaseDirectory;
use tauri::Manager;

#[derive(Serialize, Deserialize, Default)]
pub struct AppConfig {
    image_folder: Option<String>,
    target_folder: Option<String>,
}

#[tauri::command]
pub fn save_config(config: AppConfig, app: tauri::AppHandle) -> Result<(), String> {
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
pub fn load_config(app: tauri::AppHandle) -> Result<AppConfig, String> {
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
