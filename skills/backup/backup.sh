#!/bin/bash
# openclaw-backup.sh - Comprehensive openclaw backup tool

set -e

# Configuration
BACKUP_ROOT="${openclaw_BACKUP_DIR:-$HOME/openclaw-backups}"
CLAUDE_DIR="$HOME/.openclaw"
MAX_BACKUPS=10
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if openclaw directory exists
check_claude_dir() {
    if [ ! -d "$CLAUDE_DIR" ]; then
        log_error "openclaw directory not found: $CLAUDE_DIR"
        exit 1
    fi
}

# Create backup
create_backup() {
    local backup_type="${1:-full}"
    local backup_name="openclaw_${backup_type}_${TIMESTAMP}"
    local backup_path="$BACKUP_ROOT/$backup_name.tar.gz"
    
    mkdir -p "$BACKUP_ROOT"
    
    log_info "Creating $backup_type backup..."
    
    case $backup_type in
        full)
            tar -czvf "$backup_path" \
                -C "$HOME" \
                .openclaw/workspace/skills \
                .openclaw/openclaw.json \
                .openclaw/openclaw.json.bak \
                .openclaw/.env \
                .openclaw/memory \
                2>/dev/null || true
            ;;
        skills)
            tar -czvf "$backup_path" \
                -C "$HOME" \
                .openclaw/workspace/skills \
                2>/dev/null || true
            ;;
        settings)
            tar -czvf "$backup_path" \
                -C "$HOME" \
                .openclaw/openclaw.json \
                .openclaw/.env \
                2>/dev/null || true
            ;;
        *)
            log_error "Unknown backup type: $backup_type"
            exit 1
            ;;
    esac
    
    if [ -f "$backup_path" ]; then
        local size=$(du -h "$backup_path" | cut -f1)
        log_info "Backup created: $backup_path ($size)"
    else
        log_error "Backup failed!"
        exit 1
    fi
}

# List backups
list_backups() {
    log_info "Available backups in $BACKUP_ROOT:"
    echo ""
    
    if [ -d "$BACKUP_ROOT" ]; then
        ls -lh "$BACKUP_ROOT"/*.tar.gz 2>/dev/null | \
            awk '{print $9, $5, $6, $7, $8}' || \
            echo "No backups found."
    else
        echo "Backup directory doesn't exist."
    fi
}

# Restore backup
restore_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        log_error "Please specify backup file"
        list_backups
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        backup_file="$BACKUP_ROOT/$backup_file"
    fi
    
    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    log_warn "This will overwrite existing configuration!"
    read -p "Continue? (y/N) " confirm
    
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        log_info "Restore cancelled."
        exit 0
    fi
    
    log_info "Restoring from: $backup_file"
    tar -xzvf "$backup_file" -C "$HOME"
    log_info "Restore complete!"
}

# Clean old backups
cleanup_backups() {
    log_info "Cleaning old backups (keeping last $MAX_BACKUPS)..."
    
    cd "$BACKUP_ROOT" 2>/dev/null || return
    
    local count=$(ls -1 *.tar.gz 2>/dev/null | wc -l)
    
    if [ "$count" -gt "$MAX_BACKUPS" ]; then
        local to_delete=$((count - MAX_BACKUPS))
        ls -1t *.tar.gz | tail -n "$to_delete" | xargs rm -v
        log_info "Removed $to_delete old backup(s)"
    else
        log_info "No cleanup needed ($count backups)"
    fi
}

# Show backup stats
show_stats() {
    log_info "openclaw Backup Statistics"
    echo ""
    
    echo "=== Directory Sizes ==="
    du -sh "$CLAUDE_DIR"/workspace/skills 2>/dev/null || echo "Skills: N/A"
    du -sh "$CLAUDE_DIR" 2>/dev/null || echo "Total: N/A"
    
    echo ""
    echo "=== Skills Count ==="
    find "$CLAUDE_DIR/workspace/skills" -name "SKILL.md" 2>/dev/null | wc -l | xargs echo "Skills:"
    
    echo ""
    echo "=== Backup Directory ==="
    if [ -d "$BACKUP_ROOT" ]; then
        du -sh "$BACKUP_ROOT"
        ls -1 "$BACKUP_ROOT"/*.tar.gz 2>/dev/null | wc -l | xargs echo "Backup files:"
    else
        echo "No backups yet"
    fi
}

# Usage
usage() {
    cat << EOF
openclaw Backup Tool

Usage: $(basename $0) <command> [options]

Commands:
    backup [type]   Create backup (types: full, skills, settings)
    restore <file>  Restore from backup file
    list            List available backups
    cleanup         Remove old backups (keep last $MAX_BACKUPS)
    stats           Show backup statistics
    help            Show this help

Examples:
    $(basename $0) backup              # Full backup
    $(basename $0) backup skills       # Skills only
    $(basename $0) restore latest.tar.gz
    $(basename $0) list
    $(basename $0) cleanup

Environment:
    openclaw_BACKUP_DIR    Backup directory (default: ~/openclaw-backups)

EOF
}

# Main
main() {
    check_claude_dir
    
    case "${1:-help}" in
        backup)
            create_backup "${2:-full}"
            ;;
        restore)
            restore_backup "$2"
            ;;
        list)
            list_backups
            ;;
        cleanup)
            cleanup_backups
            ;;
        stats)
            show_stats
            ;;
        help|--help|-h)
            usage
            ;;
        *)
            log_error "Unknown command: $1"
            usage
            exit 1
            ;;
    esac
}

main "$@"
