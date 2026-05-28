---
name: aio-console-setup
description: >-
  Install and configure the Adobe Developer Console plugin for aio-cli. Use when
  setting up @adobe/aio-cli-plugin-console, IMS login, checking org/project/workspace
  context, or troubleshooting "no org selected" errors.
---

# Adobe Developer Console CLI Setup

This skill covers the **console plugin** (`aio console`). It manages Developer Console orgs, projects, workspaces, and API credentials — the context layer App Builder and Runtime commands depend on.

## Install the plugin

```bash
aio plugins:install -g @adobe/aio-cli-plugin-console
# or discover all Adobe plugins:
aio discover -i
```

Verify:

```bash
aio console --help
```

## Prerequisites

Console commands require an **IMS login**:

```bash
aio login
```

Auth uses the CLI context token (`@adobe/aio-lib-ims`). Without login, org/project/workspace commands fail.

## Context hierarchy

Console state is stored in aio config under `console.*`:

```
Org → Project → Workspace
```

Always verify before linking or deploying:

```bash
aio console where
# alias: aio where
```

JSON/YAML output:

```bash
aio console where --json
aio console where --yml
```

## Open Developer Console in browser

```bash
aio console open
# alias: aio open
```

Opens the selected org/project/workspace in the Developer Console UI (prod or stage based on CLI env).

## Aliases

| Long form | Short |
|-----------|-------|
| `aio console workspace` | `aio console ws` |
| `aio console org select` | `aio console org sel` |
| `aio console project select` | `aio console project sel` |
| `aio console workspace select` | `aio console ws sel` |

## Troubleshooting

**"You have not selected an Organization"** — Run `aio console org select` first.

**"You have not selected a Project"** — Select org, then `aio console project select`.

**"You have not selected a Workspace"** — Select org and project, then `aio console workspace select`.

**Wrong context after switching** — Always run `aio console where` before `aio app use` or deploy commands. Selecting a new org clears project and workspace; selecting a new project clears workspace.

For selecting orgs/projects/workspaces, see the **aio-console-context** skill.
