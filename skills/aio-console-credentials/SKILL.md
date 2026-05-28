---
name: aio-console-credentials
description: >-
  Manage Adobe Developer Console workspace credentials via aio-cli. Use when
  uploading public key certificates, listing/deleting keys, downloading workspace
  config, or aio console publickey / workspace download commands.
---

# Console Credentials and Workspace Config

Manage public key certificates and download workspace configuration for local development.

## Download workspace config

Downloads the full workspace configuration (credentials, services, runtime namespace) as JSON:

```bash
aio console workspace download
# aliases: aio console workspace dl, aio console ws download, aio console ws dl

# Custom path
aio console workspace download ./config/console.json
aio console workspace download ./config/   # directory — writes default filename
```

Requires org, project, and workspace to be selected. Default filename: `<orgId>-<projectName>-<workspaceName>.json`.

Override selection with flags:

```bash
aio console workspace download \
  --orgId <orgId> \
  --projectId <projectId> \
  --workspaceId <workspaceId> \
  ./my-config.json
```

Use downloaded config to inspect credentials or integrate with tooling outside `aio app use`.

## Public key certificates

Upload PEM certificates to bind JWT credentials to the selected workspace.

### Upload

```bash
aio console publickey upload ./public.key.pem
```

Requires org, project, and workspace selected. Skips upload if fingerprint already bound.

```bash
aio console publickey upload ./public.key.pem --json
```

### List bindings

```bash
aio console publickey list
```

### Delete binding

```bash
aio console publickey delete <idOrFingerprint>
```

## Typical JWT credential workflow

```bash
# 1. Select context
aio console org select
aio console project select myApp
aio console workspace select Stage

# 2. Generate key pair (example)
openssl genrsa -out private.key 2048
openssl rsa -in private.key -pubout -out public.key.pem

# 3. Upload public key to workspace
aio console publickey upload ./public.key.pem

# 4. Download config to verify binding
aio console workspace download ./console.json
```

Never commit private keys or downloaded config files containing secrets to source control.

## Quick reference

| Task | Command |
|------|---------|
| Download workspace config | `aio console workspace download [path]` |
| Upload public key | `aio console publickey upload <file.pem>` |
| List key bindings | `aio console publickey list` |
| Delete key binding | `aio console publickey delete <idOrFingerprint>` |

## Troubleshooting

**"Invalid publicKey file"** — File must exist and be a valid PEM certificate.

**"You have not selected a Workspace"** — Run the org → project → workspace select flow first.

**Existing binding skipped** — Upload detects matching fingerprint and reuses the existing binding (not an error).

For context selection, see **aio-console-context** skill.
