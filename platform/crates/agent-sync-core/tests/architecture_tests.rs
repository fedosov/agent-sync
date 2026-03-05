//! Structural tests that enforce layer dependency direction.
//!
//! Layer ordering (top to bottom):
//!   Types & Models  (models.rs, error.rs)
//!   Paths & Config  (paths.rs, settings.rs, managed_block.rs)
//!   Registries      (codex_registry, codex_subagent_registry, mcp_registry)
//!   Adapters        (dotagents_adapter, dotagents_runtime, agents_context)
//!   Engine          (engine.rs)
//!   Persistence     (state_store, audit_store)
//!   Watch           (watch.rs)
//!
//! Leaf modules (models, paths, managed_block) must NOT import upper layers.

use std::collections::HashMap;
use std::fs;
use std::path::Path;

/// Parse `use crate::` imports from a source file and return the imported module names.
fn crate_imports(src_path: &Path) -> Vec<String> {
    let content = fs::read_to_string(src_path).unwrap_or_default();
    content
        .lines()
        .filter(|line| {
            let trimmed = line.trim();
            trimmed.starts_with("use crate::")
        })
        .filter_map(|line| {
            // Extract module name from `use crate::module_name` or `use crate::module_name::{...}`
            let after_crate = line.trim().strip_prefix("use crate::")?;
            let module = after_crate
                .split("::")
                .next()?
                .split('{')
                .next()?
                .trim_end_matches(';')
                .trim();
            Some(module.to_string())
        })
        .collect()
}

fn core_src_dir() -> std::path::PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("src")
}

/// Leaf modules must not import from upper layers.
#[test]
fn leaf_modules_have_no_upward_imports() {
    let forbidden_targets = [
        "engine",
        "codex_registry",
        "codex_subagent_registry",
        "mcp_registry",
        "dotagents_adapter",
        "dotagents_runtime",
        "agents_context",
        "state_store",
        "audit_store",
        "watch",
        "settings",
    ];

    let leaf_modules = ["models.rs", "paths.rs", "managed_block.rs"];
    let src = core_src_dir();

    for leaf in &leaf_modules {
        let imports = crate_imports(&src.join(leaf));
        for imp in &imports {
            assert!(
                !forbidden_targets.contains(&imp.as_str()),
                "{leaf} imports `{imp}` — leaf modules must not depend on upper layers. \
                 Move shared types to models.rs or error.rs instead."
            );
        }
    }
}

/// models.rs must have zero crate imports (pure data types).
#[test]
fn models_has_no_crate_imports() {
    let imports = crate_imports(&core_src_dir().join("models.rs"));
    assert!(
        imports.is_empty(),
        "models.rs should have no crate imports but found: {:?}. \
         Models must be self-contained data types.",
        imports
    );
}

/// error.rs may import models but nothing else above the Paths layer.
#[test]
fn error_imports_only_models() {
    let allowed = ["models"];
    let imports = crate_imports(&core_src_dir().join("error.rs"));
    for imp in &imports {
        assert!(
            allowed.contains(&imp.as_str()),
            "error.rs imports `{imp}` — only models imports are allowed. \
             Keep error types close to the bottom of the dependency graph."
        );
    }
}

/// settings.rs may import error and paths but not engine/registries/adapters.
#[test]
fn settings_no_upper_layer_imports() {
    let forbidden = [
        "engine",
        "codex_registry",
        "codex_subagent_registry",
        "mcp_registry",
        "dotagents_adapter",
        "dotagents_runtime",
        "agents_context",
        "state_store",
        "audit_store",
        "watch",
    ];

    let imports = crate_imports(&core_src_dir().join("settings.rs"));
    for imp in &imports {
        assert!(
            !forbidden.contains(&imp.as_str()),
            "settings.rs imports `{imp}` — settings must not depend on upper layers. \
             Extract shared types to models.rs if needed."
        );
    }
}

/// Verify no circular dependency: engine must not be imported by registries.
#[test]
fn registries_do_not_import_engine() {
    let registry_files = [
        "codex_registry.rs",
        "codex_subagent_registry.rs",
        "mcp_registry.rs",
    ];
    let src = core_src_dir();

    for file in &registry_files {
        let imports = crate_imports(&src.join(file));
        assert!(
            !imports.contains(&"engine".to_string()),
            "{file} imports `engine` — registries must not depend on the engine. \
             This would create a circular dependency."
        );
    }
}

/// Print a dependency summary for debugging (always passes).
#[test]
fn dependency_summary() {
    let src = core_src_dir();
    let mut summary: HashMap<String, Vec<String>> = HashMap::new();

    let files: Vec<_> = fs::read_dir(&src)
        .unwrap()
        .filter_map(|e| e.ok())
        .filter(|e| e.path().extension().is_some_and(|ext| ext == "rs"))
        .filter(|e| e.file_name() != "lib.rs")
        .collect();

    for entry in &files {
        let name = entry.file_name().to_string_lossy().to_string();
        let imports = crate_imports(&entry.path());
        if !imports.is_empty() {
            summary.insert(name, imports);
        }
    }

    // This test always passes — it prints the dependency map for inspection.
    for (module, deps) in &summary {
        eprintln!("  {module} -> {}", deps.join(", "));
    }
}
