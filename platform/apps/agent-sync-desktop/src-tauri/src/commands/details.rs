use agent_sync_core::SyncEngine;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;

use crate::{
    build_platform_context, collect_subagent_target_statuses, find_skill, find_subagent,
    normalize_os_name, open_path, read_preview, read_skill_dir_tree, resolve_main_skill_file,
    resolve_skill_root_dir, PlatformContext, SkillDetails, SubagentDetails,
    MAX_MAIN_FILE_PREVIEW_CHARS, MAX_TREE_ENTRIES,
};

#[tauri::command]
pub fn get_skill_details(skill_key: String) -> Result<SkillDetails, String> {
    let engine = SyncEngine::current();
    let skill = find_skill(&engine, &skill_key, None)?;
    let main_file = resolve_main_skill_file(&skill);
    let skill_root = resolve_skill_root_dir(&skill, &main_file);
    let main_file_exists = main_file.exists();
    let (main_file_body_preview, main_file_body_preview_truncated) =
        read_preview(&main_file, MAX_MAIN_FILE_PREVIEW_CHARS);
    let (skill_dir_tree_preview, skill_dir_tree_preview_truncated) =
        read_skill_dir_tree(&skill_root, MAX_TREE_ENTRIES);
    let last_modified_unix_seconds = fs::metadata(&main_file)
        .ok()
        .and_then(|meta| meta.modified().ok())
        .and_then(|ts| ts.duration_since(UNIX_EPOCH).ok())
        .map(|duration| duration.as_secs());

    Ok(SkillDetails {
        skill,
        main_file_path: main_file.display().to_string(),
        main_file_exists,
        main_file_body_preview,
        main_file_body_preview_truncated,
        skill_dir_tree_preview,
        skill_dir_tree_preview_truncated,
        last_modified_unix_seconds,
    })
}

#[tauri::command]
pub fn get_subagent_details(subagent_id: String) -> Result<SubagentDetails, String> {
    let engine = SyncEngine::current();
    let subagent = find_subagent(&engine, &subagent_id)?;
    let main_file = PathBuf::from(&subagent.canonical_source_path);
    let canonical_source = fs::canonicalize(&main_file).ok();
    let subagent_root = main_file
        .parent()
        .map(Path::to_path_buf)
        .unwrap_or_else(|| PathBuf::from(&subagent.canonical_source_path));
    let main_file_exists = main_file.exists();
    let (main_file_body_preview, main_file_body_preview_truncated) =
        read_preview(&main_file, MAX_MAIN_FILE_PREVIEW_CHARS);
    let (subagent_dir_tree_preview, subagent_dir_tree_preview_truncated) =
        read_skill_dir_tree(&subagent_root, MAX_TREE_ENTRIES);
    let last_modified_unix_seconds = fs::metadata(&main_file)
        .ok()
        .and_then(|meta| meta.modified().ok())
        .and_then(|ts| ts.duration_since(UNIX_EPOCH).ok())
        .map(|duration| duration.as_secs());
    let target_statuses = collect_subagent_target_statuses(
        &subagent.target_paths,
        main_file.parent(),
        canonical_source.as_deref(),
    );

    Ok(SubagentDetails {
        subagent,
        main_file_path: main_file.display().to_string(),
        main_file_exists,
        main_file_body_preview,
        main_file_body_preview_truncated,
        subagent_dir_tree_preview,
        subagent_dir_tree_preview_truncated,
        last_modified_unix_seconds,
        target_statuses,
    })
}

#[tauri::command]
pub fn open_skill_path(skill_key: String, target: Option<String>) -> Result<(), String> {
    let engine = SyncEngine::current();
    let skill = find_skill(&engine, &skill_key, None)?;
    let selected_target = target.unwrap_or_else(|| String::from("folder"));
    let path = match selected_target.as_str() {
        "folder" => PathBuf::from(&skill.canonical_source_path),
        "file" => resolve_main_skill_file(&skill),
        other => {
            return Err(format!(
                "unsupported target: {other} (allowed: folder|file)"
            ));
        }
    };
    open_path(&path)
}

#[tauri::command]
pub fn open_subagent_path(subagent_id: String, target: Option<String>) -> Result<(), String> {
    let engine = SyncEngine::current();
    let subagent = find_subagent(&engine, &subagent_id)?;
    let selected_target = target.unwrap_or_else(|| String::from("folder"));
    let path = match selected_target.as_str() {
        "folder" => PathBuf::from(&subagent.canonical_source_path)
            .parent()
            .map(Path::to_path_buf)
            .unwrap_or_else(|| PathBuf::from(&subagent.canonical_source_path)),
        "file" => PathBuf::from(&subagent.canonical_source_path),
        other => {
            return Err(format!(
                "unsupported target: {other} (allowed: folder|file)"
            ));
        }
    };
    open_path(&path)
}

#[tauri::command]
pub fn get_platform_context() -> PlatformContext {
    let linux_desktop_raw = if normalize_os_name(std::env::consts::OS) == "linux" {
        std::env::var("XDG_CURRENT_DESKTOP").ok()
    } else {
        None
    };
    build_platform_context(std::env::consts::OS, linux_desktop_raw.as_deref())
}
