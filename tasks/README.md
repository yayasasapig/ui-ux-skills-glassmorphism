# Task Board

## Overview
Multi-agent task tracking system based on Agent Team Orchestration skill.

## Task States
```
Inbox → Assigned → In Progress → Review → Done | Failed
```

## Directory Structure
```
tasks/
├── inbox/          # New tasks (to be assigned)
├── assigned/       # Tasks assigned to agents
├── in-progress/    # Tasks currently being worked on
├── review/         # Tasks completed, awaiting review
├── done/           # Completed tasks
├── failed/         # Failed tasks
└── task-board.json # Central task registry
```

## Task Record Format
```json
{
  "id": "task-001",
  "title": "Task title",
  "description": "Detailed description",
  "assigned_to": "agent-id",
  "state": "inbox|assigned|in_progress|review|done|failed",
  "created_at": "2026-03-28T12:00:00+08:00",
  "updated_at": "2026-03-28T12:00:00+08:00",
  "created_by": "main",
  "priority": "high|medium|low",
  "artifacts": ["path/to/output"],
  "handoff_notes": "Notes for next agent",
  "comments": [
    {
      "agent": "agent-id",
      "action": "created|assigned|started|handoff|reviewed|completed|failed",
      "note": "Comment text",
      "timestamp": "2026-03-28T12:00:00+08:00"
    }
  ]
}
```

## Agent Roles
| Agent | Role | Specialty |
|-------|------|----------|
| main | Orchestrator | Routing, prioritization |
| coding | Builder | Code, technical |
| translator | Reviewer | Translation, writing |
| tutor | Reviewer | Learning, education |
| inventor | Builder | Creative, inventions |
| jemmy | Ops | Scheduling, automation |
| dankoe | Ops | Maintenance, monitoring |
| image | Builder | Image, design |
| qimen | Specialist | 玄學, divination |

## Handoff Protocol
When passing work between agents, include:
1. What was done
2. Where artifacts are (exact paths)
3. How to verify
4. Known issues
5. What's next

## Usage
- List tasks: `ls tasks/<state>/`
- View task: `cat tasks/<state>/<task-id>.json`
- Update state: Move file to new state directory
