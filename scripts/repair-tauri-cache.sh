#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
TARGET_DIR="$ROOT_DIR/platform/target"
BUILD_DIR="$TARGET_DIR/debug/build"

if [[ ! -d "$BUILD_DIR" ]]; then
  exit 0
fi

shopt -s nullglob
stale_cache_detected=0

for permission_index in "$BUILD_DIR"/tauri-*/out/tauri-core-app-permission-files; do
  [[ -f "$permission_index" ]] || continue

  # The file stores a JSON array of absolute permission file paths.
  first_path="$(sed -E 's/^\["([^"]+)".*/\1/' "$permission_index")"
  if [[ "$first_path" == /* && "$first_path" != "$TARGET_DIR/"* ]]; then
    stale_cache_detected=1
    break
  fi
done

shopt -u nullglob

if [[ "$stale_cache_detected" -eq 1 ]]; then
  echo "Detected stale Tauri permission cache paths; running cargo clean -p tauri..."
  (cd "$ROOT_DIR/platform" && cargo clean -p tauri)
fi
