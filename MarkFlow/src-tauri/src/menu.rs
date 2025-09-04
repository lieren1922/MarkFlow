use tauri::menu::{MenuBuilder, MenuEvent, SubmenuBuilder};
use tauri::{AppHandle, Emitter, Wry};

pub fn create_main_menu(app: &tauri::App) -> tauri::Result<tauri::menu::Menu<Wry>> {
    // 创建 macOS 占位菜单
    let app_menu = SubmenuBuilder::new(app, "").build()?;

    // 创建 File 子菜单
    let file_menu = SubmenuBuilder::new(app, "File")
        .text("open", "Open")
        .text("save", "Save")
        .text("close", "Close")
        .build()?;

    // 构建主菜单
    MenuBuilder::new(app)
        .items(&[&app_menu, &file_menu])
        .build()
}

pub fn setup_menu_events(app: &tauri::App) {
    app.on_menu_event(move |app_handle: &AppHandle, event: MenuEvent| {
        let event_id = event.id().0.as_str();

        match event_id {
            "open" => emit_menu_event(app_handle, "open_file"),
            "save" => emit_menu_event(app_handle, "save_file"),
            "close" => handle_close_event(app_handle),
            _ => {}
        }
    });
}

fn emit_menu_event(app_handle: &AppHandle, event: &str) {
    if let Err(e) = app_handle.emit(event, ()) {
        eprintln!("Failed to emit {}: {}", event, e);
    }
}

fn handle_close_event(app_handle: &AppHandle) {
    if let Err(e) = app_handle.emit("save_and_close", ()) {
        eprintln!("保存失败: {}", e);
    }
}
