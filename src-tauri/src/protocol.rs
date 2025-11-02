use mime_guess::from_path;
use percent_encoding::percent_decode_str;
use std::{fs, path::PathBuf};
use tauri::http::{Request, Response, StatusCode};

pub fn handle_fs_protocol(request: Request<Vec<u8>>) -> Response<Vec<u8>> {
    let uri = request.uri().to_string();
    let path_str = &uri["fs://localhost/".len()..];
    let path = PathBuf::from(
        percent_decode_str(path_str)
            .decode_utf8()
            .unwrap_or_default()
            .to_string(),
    );

    if let Ok(bytes) = fs::read(&path) {
        Response::builder()
            .status(StatusCode::OK)
            .header(
                "Content-Type",
                from_path(&path).first_or_octet_stream().as_ref(),
            )
            .header("Access-Control-Allow-Origin", "*")
            .header("Access-Control-Allow-Methods", "GET, OPTIONS")
            .body(bytes)
            .unwrap()
    } else {
        Response::builder()
            .status(StatusCode::NOT_FOUND)
            .header("Access-Control-Allow-Origin", "*")
            .body(Vec::new())
            .unwrap()
    }
}
