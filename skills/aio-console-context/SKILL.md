---
name: aio-console-context
description: >-
  Select and list Adobe Developer Console orgs, projects, and workspaces via
  aio-cli. Use when switching org/project/workspace context, listing console
  resources, or preparing to link an App Builder project with aio app use.
---

# Console Context (Org, Project, Workspace)

Navigate the Developer Console hierarchy. Selection is stored globally in aio config and drives all subsequent console, app, and runtime commands.

## Standard workflow

```bash
# 1. Select org (clears project + workspace)
aio console org select
# or by org code:
aio console org select <orgCode>

# 2. Select project (clears workspace)
aio console project select
# or by name/id:
aio console project select myApp

# 3. Select workspace
aio console workspace select Stage
# or:
aio console ws select Production

# 4. Verify
aio console where
```

## List resources

```bash
aio console org list
aio console project list
aio console workspace list
# or: aio console ws list
```

Add `--json` or `--yml` for structured output on list/select commands.

## Link App Builder project

After selecting the correct context, link the local app:

```bash
aio console where            # verify org/project/workspace first
aio app use -g --no-input --overwrite
```

`aio app use -g` links based on the **globally selected** project. If the wrong project is active, you silently link to the wrong workspace.

## Select with explicit IDs

Override global selection with flags:

```bash
aio console project select myApp --orgId <orgId>
aio console workspace select Stage --orgId <orgId> --projectId <projectId>
```

## Context side effects

| Action | Clears |
|--------|--------|
| `aio console org select` | project, workspace |
| `aio console project select` | workspace |
| `aio console workspace select` | (none) |

## Quick reference

| Task | Command |
|------|---------|
| Current context | `aio console where` |
| List orgs | `aio console org list` |
| List projects | `aio console project list` |
| List workspaces | `aio console workspace list` |
| Select org | `aio console org select [orgCode]` |
| Select project | `aio console project select [nameOrId]` |
| Select workspace | `aio console workspace select [nameOrId]` |

For creating new projects/workspaces, see the **aio-console-projects** skill.
