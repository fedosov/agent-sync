//! Shared managed-block manipulation helpers for TOML config files.

pub fn strip_first_managed_block(current: &str, begin_marker: &str, end_marker: &str) -> String {
    let normalized = current.replace("\r\n", "\n");
    let Some(begin_index) = normalized.find(begin_marker) else {
        return normalized;
    };
    let Some(end_index) = normalized[begin_index..].find(end_marker) else {
        return normalized;
    };
    let end_absolute = begin_index + end_index + end_marker.len();
    let prefix = normalized[..begin_index].trim_matches('\n');
    let suffix = normalized[end_absolute..].trim_matches('\n');
    match (prefix.is_empty(), suffix.is_empty()) {
        (true, true) => String::new(),
        (true, false) => format!("{suffix}\n"),
        (false, true) => format!("{prefix}\n"),
        (false, false) => format!("{prefix}\n\n{suffix}\n"),
    }
}

pub fn strip_managed_blocks(current: &str, marker_pairs: &[(&str, &str)]) -> String {
    let mut normalized = current.replace("\r\n", "\n");
    loop {
        let mut changed = false;
        for &(begin_marker, end_marker) in marker_pairs {
            let next = strip_first_managed_block(&normalized, begin_marker, end_marker);
            if next != normalized {
                normalized = next;
                changed = true;
            }
        }
        if !changed {
            break;
        }
    }
    normalized
}

pub fn upsert_managed_block(
    current: &str,
    begin_marker: &str,
    end_marker: &str,
    body: &str,
) -> String {
    let block = format!("{begin_marker}\n{body}\n{end_marker}");
    if current.trim().is_empty() {
        return format!("{block}\n");
    }

    let normalized = current.replace("\r\n", "\n");
    if let Some(begin_index) = normalized.find(begin_marker) {
        if let Some(end_index) = normalized[begin_index..].find(end_marker) {
            let end_absolute = begin_index + end_index + end_marker.len();
            let prefix = normalized[..begin_index].trim_matches('\n');
            let suffix = normalized[end_absolute..].trim_matches('\n');
            return match (prefix.is_empty(), suffix.is_empty()) {
                (true, true) => format!("{block}\n"),
                (true, false) => format!("{block}\n\n{suffix}\n"),
                (false, true) => format!("{prefix}\n\n{block}\n"),
                (false, false) => format!("{prefix}\n\n{block}\n\n{suffix}\n"),
            };
        }
    }

    let trimmed = normalized.trim_matches('\n');
    format!("{trimmed}\n\n{block}\n")
}
