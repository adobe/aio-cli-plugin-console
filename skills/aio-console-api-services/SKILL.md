---
name: aio-console-api-services
description: >-
  Add and list Adobe API services on Developer Console workspaces via aio-cli.
  Use when subscribing to Adobe APIs, configuring product profiles, license-config,
  or aio console api / workspace api commands.
---

# Console API Services

Subscribe Adobe API services to a workspace. Uses OAuth Server-to-Server credentials.

## List available org APIs

Shows APIs enabled for the current org:

```bash
aio console api list
# alias: aio console api ls

# With product profile metadata
aio console api list --json
```

Look for `Requires product profile: yes` — these need `--license-config` when adding.

## List workspace subscriptions

```bash
aio console workspace api list \
  --projectName myApp \
  --workspaceName Stage

# aliases: aio console ws api list, aio console ws api ls
```

## Add API services to a workspace

```bash
aio console workspace api add \
  --projectName myApp \
  --workspaceName Stage \
  --service-code AssetComputeSDK,AdobeAnalyticsSDK
```

Alias: `aio console ws api add`

### Services requiring product profiles

Some services (e.g. Frame.io) require a product profile. Discover profiles from `aio console api list --json` — look at `properties.licenseConfigs[]` for `name`, `id`, or `productId`.

```bash
aio console workspace api add \
  --projectName myApp \
  --workspaceName Stage \
  --service-code FrameioSDK \
  --license-config 'FrameioSDK=My Product Profile'
```

Multiple profiles for one service:

```bash
--license-config 'SomeSDK=Profile1,Profile2'
```

Multiple services with profiles (repeat flag):

```bash
--license-config 'SDK1=ProfileA' \
--license-config 'SDK2=ProfileB'
```

### Important behavior

- `--service-code` is comma-separated sdkCodes from `aio console api list`.
- `--license-config` keys must match codes in `--service-code`.
- Adding APIs **merges** with existing subscriptions — does not wipe previously added services.
- Check `--json` output for embedded errors; partial failures may appear in `errorDetails`.

## Typical App Builder setup

```bash
aio console org select
aio console project select myApp
aio console workspace select Stage

# See what's available
aio console api list

# Subscribe required APIs
aio console workspace api add \
  --projectName myApp \
  --workspaceName Stage \
  --service-code AdobeI/OEvents,AdobeI/OReactSpectrum

# Verify
aio console workspace api list \
  --projectName myApp \
  --workspaceName Stage
```

## Quick reference

| Task | Command |
|------|---------|
| Org-level API catalog | `aio console api list` |
| Workspace subscriptions | `aio console ws api list --projectName X --workspaceName Y` |
| Add services | `aio console ws api add --projectName X --workspaceName Y --service-code CODE` |
| JSON output | add `--json` or `--yml` |

## Troubleshooting

**"Service code(s) not found or not enabled"** — Run `aio console api list` to see valid codes for the org.

**"require one or more product profiles"** — Add `--license-config '<sdkCode>=<profileName>'`. Get profile names from `aio console api list --json`.

**"Failed to add API service(s)"** — Check `--json` output for `errorDetails`. Verify org has entitlements for the service.

For credential and config download, see **aio-console-credentials** skill.
