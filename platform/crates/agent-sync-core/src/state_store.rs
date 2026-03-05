use crate::error::{load_json_or_default, write_json_pretty, SyncEngineError};
use crate::models::SyncState;
use crate::paths::SyncPaths;

#[derive(Debug, Clone)]
pub struct SyncStateStore {
    paths: SyncPaths,
}

impl Default for SyncStateStore {
    fn default() -> Self {
        Self {
            paths: SyncPaths::detect(),
        }
    }
}

impl SyncStateStore {
    pub fn new(paths: SyncPaths) -> Self {
        Self { paths }
    }

    pub fn load_state(&self) -> SyncState {
        load_json_or_default(&self.paths.state_path, "state file")
    }

    pub fn save_state(&self, state: &SyncState) -> Result<(), SyncEngineError> {
        self.paths
            .ensure_runtime_dir()
            .map_err(|e| SyncEngineError::io(&self.paths.runtime_directory, e))?;
        write_json_pretty(&self.paths.state_path, state)
    }

    pub fn paths(&self) -> &SyncPaths {
        &self.paths
    }
}
