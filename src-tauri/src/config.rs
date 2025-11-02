use serde::{Deserialize, Serialize};
use std::fmt::Display;
use std::fs;
use std::path::PathBuf;
use tauri::path::BaseDirectory;
use tauri::Manager;

#[derive(Serialize, Deserialize, Default)]
pub struct AppConfig {
    image_folder: Option<String>,
    target_folder: Option<String>,
}

impl Display for AppConfig {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "({}, {})",
            self.image_folder.clone().unwrap_or("none".to_string()),
            self.target_folder.clone().unwrap_or("none".to_string())
        )
    }
}

fn try_save_config(config: AppConfig, app: &tauri::AppHandle) -> Result<(), String> {
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

fn try_load_config(app: &tauri::AppHandle) -> Result<AppConfig, String> {
    let path = app
        .path()
        .resolve("config.json", BaseDirectory::AppConfig)
        .map_err(|e| e.to_string())?;

    if !path.exists() {
        return Err("config not found".to_string());
    }

    let data = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let mut config = serde_json::from_str::<AppConfig>(&data).map_err(|e| e.to_string())?;

    for folder in [&mut config.image_folder, &mut config.target_folder] {
        if let Some(p) = folder as &mut Option<String> {
            if !PathBuf::from(&p).exists() {
                *folder = None;
            }
        }
    }

    Ok(config)
}

#[tauri::command]
pub fn save_config(config: AppConfig, app: tauri::AppHandle) {
    try_save_config(config, &app).unwrap_or_default();
}

#[tauri::command]
pub fn load_config(app: tauri::AppHandle) -> AppConfig {
    try_load_config(&app).unwrap_or_default()
}
