---
name: aio-console-projects
description: >-
  Create Adobe Developer Console projects and workspaces via aio-cli. Use when
  scaffolding new App Builder projects, creating Stage/Production workspaces,
  or running aio console project create / workspace create commands.
---

# Console Projects and Workspaces

Create Developer Console projects and workspaces from the CLI.

## Create a project

Requires a selected org (`aio console org select`).

```bash
aio console project create \
  --name myApp \
  --title "My App" \
  --description "App Builder project for ..."
```

### Validation rules

| Field | Rules |
|-------|-------|
| `name` | Alphanumeric only, 3–45 chars |
| `title` | Alphanumeric + spaces, 3–45 chars |
| `description` | Max 1000 chars |

Project names must be unique within the org.

```bash
# Structured output
aio console project create --name myApp --json
aio console project create --name myApp --yml
```

Alias: `aio console project init`

## Create a workspace

Requires org context. Specify project by name:

```bash
aio console workspace create \
  --projectName myApp \
  --name Stage \
  --title "Stage"
```

Typical workspaces: `Stage`, `Production`.

### Validation rules

| Field | Rules |
|-------|-------|
| `name` | Alphanumeric only, 3–45 chars |
| `title` | Alphanumeric + spaces, 3–45 chars |

Aliases: `aio console workspace init`, `aio console ws create`, `aio console ws init`

## Full scaffold workflow

```bash
# 1. Auth and org
aio login
aio console org select

# 2. Create project
aio console project create --name myApp --title "My App"

# 3. Select project
aio console project select myApp

# 4. Create workspaces
aio console workspace create --projectName myApp --name Stage
aio console workspace create --projectName myApp --name Production

# 5. Select workspace for development
aio console workspace select Stage

# 6. Verify and link local app
aio console where
aio app use -g --no-input --overwrite
```

## After creation

Add API services to the workspace (**aio-console-api-services** skill), then scaffold and deploy:

```bash
aio app init --standalone-app --yes
aio app deploy
```

## Troubleshooting

**"Project already exists"** — Choose a different `--name`.

**"Project not found"** — Verify org with `aio console org select` and list projects with `aio console project list`.

**"Workspace already exists"** — Choose a different workspace name or use `aio console workspace select` for the existing one.
