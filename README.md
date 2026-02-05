<!--
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
-->
[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@adobe/aio-cli-plugin-console.svg)](https://npmjs.org/package/@adobe/aio-cli-plugin-console)
[![Downloads/week](https://img.shields.io/npm/dw/@adobe/aio-cli-plugin-console.svg)](https://npmjs.org/package/@adobe/aio-cli-plugin-console)
[![Build Status](https://travis-ci.com/adobe/aio-cli-plugin-console.svg?branch=master)](https://travis-ci.com/adobe/aio-cli-plugin-console)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0) 
[![Codecov Coverage](https://img.shields.io/codecov/c/github/adobe/aio-cli-plugin-console/master.svg?style=flat-square)](https://codecov.io/gh/adobe/aio-cli-plugin-console/)


aio-cli-plugin-console
======================

Console Integration Plugin for the Adobe I/O CLI

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage
```sh-session
$ aio plugins:install -g @adobe/aio-cli-plugin-console
$ # OR
$ aio discover -i
$ aio console --help
```

# Commands
<!-- commands -->
* [`aio console`](#aio-console)
* [`aio console open`](#aio-console-open)
* [`aio console org`](#aio-console-org)
* [`aio console org list`](#aio-console-org-list)
* [`aio console org ls`](#aio-console-org-ls)
* [`aio console org sel [ORGCODE]`](#aio-console-org-sel-orgcode)
* [`aio console org select [ORGCODE]`](#aio-console-org-select-orgcode)
* [`aio console project`](#aio-console-project)
* [`aio console project list`](#aio-console-project-list)
* [`aio console project ls`](#aio-console-project-ls)
* [`aio console project sel [PROJECTIDORNAME]`](#aio-console-project-sel-projectidorname)
* [`aio console project select [PROJECTIDORNAME]`](#aio-console-project-select-projectidorname)
* [`aio console publickey`](#aio-console-publickey)
* [`aio console publickey delete IDORFINGERPRINT`](#aio-console-publickey-delete-idorfingerprint)
* [`aio console publickey list`](#aio-console-publickey-list)
* [`aio console publickey upload FILE`](#aio-console-publickey-upload-file)
* [`aio console where`](#aio-console-where)
* [`aio console workspace`](#aio-console-workspace)
* [`aio console workspace dl [DESTINATION]`](#aio-console-workspace-dl-destination)
* [`aio console workspace download [DESTINATION]`](#aio-console-workspace-download-destination)
* [`aio console workspace list`](#aio-console-workspace-list)
* [`aio console workspace ls`](#aio-console-workspace-ls)
* [`aio console workspace sel [WORKSPACEIDORNAME]`](#aio-console-workspace-sel-workspaceidorname)
* [`aio console workspace select [WORKSPACEIDORNAME]`](#aio-console-workspace-select-workspaceidorname)
* [`aio console ws`](#aio-console-ws)
* [`aio console ws dl [DESTINATION]`](#aio-console-ws-dl-destination)
* [`aio console ws download [DESTINATION]`](#aio-console-ws-download-destination)
* [`aio console ws list`](#aio-console-ws-list)
* [`aio console ws ls`](#aio-console-ws-ls)
* [`aio console ws sel [WORKSPACEIDORNAME]`](#aio-console-ws-sel-workspaceidorname)
* [`aio console ws select [WORKSPACEIDORNAME]`](#aio-console-ws-select-workspaceidorname)
* [`aio open`](#aio-open)
* [`aio where`](#aio-where)

## `aio console`

Console plugin for the Adobe I/O CLI

```
USAGE
  $ aio console [--help]

FLAGS
  --help  Show help

DESCRIPTION
  Console plugin for the Adobe I/O CLI
```

_See code: [src/commands/console/index.js](https://github.com/adobe/aio-cli-plugin-console/blob/5.1.0/src/commands/console/index.js)_

## `aio console open`

Open the developer console for the selected Organization, Project and Workspace

```
USAGE
  $ aio console open [--help]

FLAGS
  --help  Show help

DESCRIPTION
  Open the developer console for the selected Organization, Project and Workspace

ALIASES
  $ aio open
```

_See code: [src/commands/console/open.js](https://github.com/adobe/aio-cli-plugin-console/blob/5.1.0/src/commands/console/open.js)_

## `aio console org`

Manage your Adobe I/O Console Organizations

```
USAGE
  $ aio console org [--help]

FLAGS
  --help  Show help

DESCRIPTION
  Manage your Adobe I/O Console Organizations
```

_See code: [src/commands/console/org/index.js](https://github.com/adobe/aio-cli-plugin-console/blob/5.1.0/src/commands/console/org/index.js)_

## `aio console org list`

List your Organizations

```
USAGE
  $ aio console org list [--help] [-j | -y]

FLAGS
  -j, --json  Output json
  -y, --yml   Output yml
      --help  Show help

DESCRIPTION
  List your Organizations

ALIASES
  $ aio console org ls
```

_See code: [src/commands/console/org/list.js](https://github.com/adobe/aio-cli-plugin-console/blob/5.1.0/src/commands/console/org/list.js)_

## `aio console org ls`

List your Organizations

```
USAGE
  $ aio console org ls [--help] [-j | -y]

FLAGS
  -j, --json  Output json
  -y, --yml   Output yml
      --help  Show help

DESCRIPTION
  List your Organizations

ALIASES
  $ aio console org ls
```

## `aio console org sel [ORGCODE]`

Select an Organization

```
USAGE
  $ aio console org sel [ORGCODE] [--help]

ARGUMENTS
  [ORGCODE]  Adobe Developer Console Org code

FLAGS
  --help  Show help

DESCRIPTION
  Select an Organization

ALIASES
  $ aio console org sel
```

## `aio console org select [ORGCODE]`

Select an Organization

```
USAGE
  $ aio console org select [ORGCODE] [--help]

ARGUMENTS
  [ORGCODE]  Adobe Developer Console Org code

FLAGS
  --help  Show help

DESCRIPTION
  Select an Organization

ALIASES
  $ aio console org sel
```

_See code: [src/commands/console/org/select.js](https://github.com/adobe/aio-cli-plugin-console/blob/5.1.0/src/commands/console/org/select.js)_

## `aio console project`

Manage your Adobe I/O Console Projects

```
USAGE
  $ aio console project [--help]

FLAGS
  --help  Show help

DESCRIPTION
  Manage your Adobe I/O Console Projects
```

_See code: [src/commands/console/project/index.js](https://github.com/adobe/aio-cli-plugin-console/blob/5.1.0/src/commands/console/project/index.js)_

## `aio console project list`

List your Projects for the selected Organization

```
USAGE
  $ aio console project list [--help] [--orgId <value>] [-j | -y]

FLAGS
  -j, --json           Output json
  -y, --yml            Output yml
      --help           Show help
      --orgId=<value>  OrgID for listing projects

DESCRIPTION
  List your Projects for the selected Organization

ALIASES
  $ aio console project ls
```

_See code: [src/commands/console/project/list.js](https://github.com/adobe/aio-cli-plugin-console/blob/5.1.0/src/commands/console/project/list.js)_

## `aio console project ls`

List your Projects for the selected Organization

```
USAGE
  $ aio console project ls [--help] [--orgId <value>] [-j | -y]

FLAGS
  -j, --json           Output json
  -y, --yml            Output yml
      --help           Show help
      --orgId=<value>  OrgID for listing projects

DESCRIPTION
  List your Projects for the selected Organization

ALIASES
  $ aio console project ls
```

## `aio console project sel [PROJECTIDORNAME]`

Select a Project for the selected Organization

```
USAGE
  $ aio console project sel [PROJECTIDORNAME] [--help] [--orgId <value>]

ARGUMENTS
  [PROJECTIDORNAME]  Adobe Developer Console Project id or Project name

FLAGS
  --help           Show help
  --orgId=<value>  Organization id of the Console Project to select

DESCRIPTION
  Select a Project for the selected Organization

ALIASES
  $ aio console project sel
```

## `aio console project select [PROJECTIDORNAME]`

Select a Project for the selected Organization

```
USAGE
  $ aio console project select [PROJECTIDORNAME] [--help] [--orgId <value>]

ARGUMENTS
  [PROJECTIDORNAME]  Adobe Developer Console Project id or Project name

FLAGS
  --help           Show help
  --orgId=<value>  Organization id of the Console Project to select

DESCRIPTION
  Select a Project for the selected Organization

ALIASES
  $ aio console project sel
```

_See code: [src/commands/console/project/select.js](https://github.com/adobe/aio-cli-plugin-console/blob/5.1.0/src/commands/console/project/select.js)_

## `aio console publickey`

Manage Public Key Bindings for your Adobe I/O Console Workspaces

```
USAGE
  $ aio console publickey [--help]

FLAGS
  --help  Show help

DESCRIPTION
  Manage Public Key Bindings for your Adobe I/O Console Workspaces
```

_See code: [src/commands/console/publickey/index.js](https://github.com/adobe/aio-cli-plugin-console/blob/5.1.0/src/commands/console/publickey/index.js)_

## `aio console publickey delete IDORFINGERPRINT`

Delete a public key certificate from the selected Workspace

```
USAGE
  $ aio console publickey delete IDORFINGERPRINT [--help] [--orgId <value>] [--projectId <value>] [--workspaceId
  <value>]

ARGUMENTS
  IDORFINGERPRINT  The bindingId or the fingerprint of the public key binding to delete

FLAGS
  --help                 Show help
  --orgId=<value>        Organization id of the Console Workspace to delete the public key certificate from
  --projectId=<value>    Project id of the Console Workspace to delete the public key certificate from
  --workspaceId=<value>  Workspace id of the Console Workspace to delete the public key certificate from

DESCRIPTION
  Delete a public key certificate from the selected Workspace
```

_See code: [src/commands/console/publickey/delete.js](https://github.com/adobe/aio-cli-plugin-console/blob/5.1.0/src/commands/console/publickey/delete.js)_

## `aio console publickey list`

List the public key certificates bound to the selected Workspace

```
USAGE
  $ aio console publickey list [--help] [--orgId <value>] [--projectId <value>] [--workspaceId <value>] [-j | -y]

FLAGS
  -j, --json                 Output json
  -y, --yml                  Output yml
      --help                 Show help
      --orgId=<value>        Organization id of the Console Workspace to list the public key certificates for
      --projectId=<value>    Project id of the Console Workspace to list the public key certificate for
      --workspaceId=<value>  Workspace id of the Console Workspace to list the public key certificate for

DESCRIPTION
  List the public key certificates bound to the selected Workspace
```

_See code: [src/commands/console/publickey/list.js](https://github.com/adobe/aio-cli-plugin-console/blob/5.1.0/src/commands/console/publickey/list.js)_

## `aio console publickey upload FILE`

Upload a public key certificate to the selected Workspace

```
USAGE
  $ aio console publickey upload FILE [--help] [--orgId <value>] [--projectId <value>] [--workspaceId <value>] [-j | -y]

ARGUMENTS
  FILE  Path to public key certificate file in PEM format

FLAGS
  -j, --json                 Output json
  -y, --yml                  Output yml
      --help                 Show help
      --orgId=<value>        Organization id of the Console Workspace to upload the public key certificate to
      --projectId=<value>    Project id of the Console Workspace to upload the public key certificate to
      --workspaceId=<value>  Workspace id of the Console Workspace to upload the public key certificate to

DESCRIPTION
  Upload a public key certificate to the selected Workspace
```

_See code: [src/commands/console/publickey/upload.js](https://github.com/adobe/aio-cli-plugin-console/blob/5.1.0/src/commands/console/publickey/upload.js)_

## `aio console where`

Show the currently selected Organization, Project and Workspace

```
USAGE
  $ aio console where [--help] [-j | -y]

FLAGS
  -j, --json  Output json
  -y, --yml   Output yml
      --help  Show help

DESCRIPTION
  Show the currently selected Organization, Project and Workspace

ALIASES
  $ aio where
```

_See code: [src/commands/console/where/index.js](https://github.com/adobe/aio-cli-plugin-console/blob/5.1.0/src/commands/console/where/index.js)_

## `aio console workspace`

Manage your Adobe I/O Console Workspaces

```
USAGE
  $ aio console workspace [--help]

FLAGS
  --help  Show help

DESCRIPTION
  Manage your Adobe I/O Console Workspaces

ALIASES
  $ aio console ws
```

_See code: [src/commands/console/workspace/index.js](https://github.com/adobe/aio-cli-plugin-console/blob/5.1.0/src/commands/console/workspace/index.js)_

## `aio console workspace dl [DESTINATION]`

Downloads the configuration for the selected Workspace

```
USAGE
  $ aio console workspace dl [DESTINATION] [--help] [--orgId <value>] [--projectId <value>] [--workspaceId <value>]

ARGUMENTS
  [DESTINATION]  Output file name or folder name where the Console Workspace configuration file should be saved

FLAGS
  --help                 Show help
  --orgId=<value>        Organization id of the Console Workspace configuration to download
  --projectId=<value>    Project id of the Console Workspace configuration to download
  --workspaceId=<value>  Workspace id of the Console Workspace configuration to download

DESCRIPTION
  Downloads the configuration for the selected Workspace

ALIASES
  $ aio console workspace dl
  $ aio console ws download
  $ aio console ws dl
```

## `aio console workspace download [DESTINATION]`

Downloads the configuration for the selected Workspace

```
USAGE
  $ aio console workspace download [DESTINATION] [--help] [--orgId <value>] [--projectId <value>] [--workspaceId
  <value>]

ARGUMENTS
  [DESTINATION]  Output file name or folder name where the Console Workspace configuration file should be saved

FLAGS
  --help                 Show help
  --orgId=<value>        Organization id of the Console Workspace configuration to download
  --projectId=<value>    Project id of the Console Workspace configuration to download
  --workspaceId=<value>  Workspace id of the Console Workspace configuration to download

DESCRIPTION
  Downloads the configuration for the selected Workspace

ALIASES
  $ aio console workspace dl
  $ aio console ws download
  $ aio console ws dl
```

_See code: [src/commands/console/workspace/download.js](https://github.com/adobe/aio-cli-plugin-console/blob/5.1.0/src/commands/console/workspace/download.js)_

## `aio console workspace list`

List your Workspaces for your selected Project

```
USAGE
  $ aio console workspace list [--help] [-j | -y] [--orgId <value>] [--projectId <value>]

FLAGS
  -j, --json               Output json
  -y, --yml                Output yml
      --help               Show help
      --orgId=<value>      Organization id of the Console Workspaces to list
      --projectId=<value>  Project id of the Console Workspaces to list

DESCRIPTION
  List your Workspaces for your selected Project

ALIASES
  $ aio console workspace ls
  $ aio console ws list
  $ aio console ws ls
```

_See code: [src/commands/console/workspace/list.js](https://github.com/adobe/aio-cli-plugin-console/blob/5.1.0/src/commands/console/workspace/list.js)_

## `aio console workspace ls`

List your Workspaces for your selected Project

```
USAGE
  $ aio console workspace ls [--help] [-j | -y] [--orgId <value>] [--projectId <value>]

FLAGS
  -j, --json               Output json
  -y, --yml                Output yml
      --help               Show help
      --orgId=<value>      Organization id of the Console Workspaces to list
      --projectId=<value>  Project id of the Console Workspaces to list

DESCRIPTION
  List your Workspaces for your selected Project

ALIASES
  $ aio console workspace ls
  $ aio console ws list
  $ aio console ws ls
```

## `aio console workspace sel [WORKSPACEIDORNAME]`

Select a Workspace for the selected Project

```
USAGE
  $ aio console workspace sel [WORKSPACEIDORNAME] [--help] [--orgId <value>] [--projectId <value>]

ARGUMENTS
  [WORKSPACEIDORNAME]  Adobe Developer Console Workspace id or Workspace name

FLAGS
  --help               Show help
  --orgId=<value>      Organization id of the Console Workspace to select
  --projectId=<value>  Project id of the Console Workspace to select

DESCRIPTION
  Select a Workspace for the selected Project

ALIASES
  $ aio console workspace sel
  $ aio console ws select
  $ aio console ws sel
```

## `aio console workspace select [WORKSPACEIDORNAME]`

Select a Workspace for the selected Project

```
USAGE
  $ aio console workspace select [WORKSPACEIDORNAME] [--help] [--orgId <value>] [--projectId <value>]

ARGUMENTS
  [WORKSPACEIDORNAME]  Adobe Developer Console Workspace id or Workspace name

FLAGS
  --help               Show help
  --orgId=<value>      Organization id of the Console Workspace to select
  --projectId=<value>  Project id of the Console Workspace to select

DESCRIPTION
  Select a Workspace for the selected Project

ALIASES
  $ aio console workspace sel
  $ aio console ws select
  $ aio console ws sel
```

_See code: [src/commands/console/workspace/select.js](https://github.com/adobe/aio-cli-plugin-console/blob/5.1.0/src/commands/console/workspace/select.js)_

## `aio console ws`

Manage your Adobe I/O Console Workspaces

```
USAGE
  $ aio console ws [--help]

FLAGS
  --help  Show help

DESCRIPTION
  Manage your Adobe I/O Console Workspaces

ALIASES
  $ aio console ws
```

## `aio console ws dl [DESTINATION]`

Downloads the configuration for the selected Workspace

```
USAGE
  $ aio console ws dl [DESTINATION] [--help] [--orgId <value>] [--projectId <value>] [--workspaceId <value>]

ARGUMENTS
  [DESTINATION]  Output file name or folder name where the Console Workspace configuration file should be saved

FLAGS
  --help                 Show help
  --orgId=<value>        Organization id of the Console Workspace configuration to download
  --projectId=<value>    Project id of the Console Workspace configuration to download
  --workspaceId=<value>  Workspace id of the Console Workspace configuration to download

DESCRIPTION
  Downloads the configuration for the selected Workspace

ALIASES
  $ aio console workspace dl
  $ aio console ws download
  $ aio console ws dl
```

## `aio console ws download [DESTINATION]`

Downloads the configuration for the selected Workspace

```
USAGE
  $ aio console ws download [DESTINATION] [--help] [--orgId <value>] [--projectId <value>] [--workspaceId <value>]

ARGUMENTS
  [DESTINATION]  Output file name or folder name where the Console Workspace configuration file should be saved

FLAGS
  --help                 Show help
  --orgId=<value>        Organization id of the Console Workspace configuration to download
  --projectId=<value>    Project id of the Console Workspace configuration to download
  --workspaceId=<value>  Workspace id of the Console Workspace configuration to download

DESCRIPTION
  Downloads the configuration for the selected Workspace

ALIASES
  $ aio console workspace dl
  $ aio console ws download
  $ aio console ws dl
```

## `aio console ws list`

List your Workspaces for your selected Project

```
USAGE
  $ aio console ws list [--help] [-j | -y] [--orgId <value>] [--projectId <value>]

FLAGS
  -j, --json               Output json
  -y, --yml                Output yml
      --help               Show help
      --orgId=<value>      Organization id of the Console Workspaces to list
      --projectId=<value>  Project id of the Console Workspaces to list

DESCRIPTION
  List your Workspaces for your selected Project

ALIASES
  $ aio console workspace ls
  $ aio console ws list
  $ aio console ws ls
```

## `aio console ws ls`

List your Workspaces for your selected Project

```
USAGE
  $ aio console ws ls [--help] [-j | -y] [--orgId <value>] [--projectId <value>]

FLAGS
  -j, --json               Output json
  -y, --yml                Output yml
      --help               Show help
      --orgId=<value>      Organization id of the Console Workspaces to list
      --projectId=<value>  Project id of the Console Workspaces to list

DESCRIPTION
  List your Workspaces for your selected Project

ALIASES
  $ aio console workspace ls
  $ aio console ws list
  $ aio console ws ls
```

## `aio console ws sel [WORKSPACEIDORNAME]`

Select a Workspace for the selected Project

```
USAGE
  $ aio console ws sel [WORKSPACEIDORNAME] [--help] [--orgId <value>] [--projectId <value>]

ARGUMENTS
  [WORKSPACEIDORNAME]  Adobe Developer Console Workspace id or Workspace name

FLAGS
  --help               Show help
  --orgId=<value>      Organization id of the Console Workspace to select
  --projectId=<value>  Project id of the Console Workspace to select

DESCRIPTION
  Select a Workspace for the selected Project

ALIASES
  $ aio console workspace sel
  $ aio console ws select
  $ aio console ws sel
```

## `aio console ws select [WORKSPACEIDORNAME]`

Select a Workspace for the selected Project

```
USAGE
  $ aio console ws select [WORKSPACEIDORNAME] [--help] [--orgId <value>] [--projectId <value>]

ARGUMENTS
  [WORKSPACEIDORNAME]  Adobe Developer Console Workspace id or Workspace name

FLAGS
  --help               Show help
  --orgId=<value>      Organization id of the Console Workspace to select
  --projectId=<value>  Project id of the Console Workspace to select

DESCRIPTION
  Select a Workspace for the selected Project

ALIASES
  $ aio console workspace sel
  $ aio console ws select
  $ aio console ws sel
```

## `aio open`

Open the developer console for the selected Organization, Project and Workspace

```
USAGE
  $ aio open [--help]

FLAGS
  --help  Show help

DESCRIPTION
  Open the developer console for the selected Organization, Project and Workspace

ALIASES
  $ aio open
```

## `aio where`

Show the currently selected Organization, Project and Workspace

```
USAGE
  $ aio where [--help] [-j | -y]

FLAGS
  -j, --json  Output json
  -y, --yml   Output yml
      --help  Show help

DESCRIPTION
  Show the currently selected Organization, Project and Workspace

ALIASES
  $ aio where
```
<!-- commandsstop -->
