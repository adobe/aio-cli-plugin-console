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
* [`aio console:org`](#aio-consoleorg)
* [`aio console:org:list`](#aio-consoleorglist)
* [`aio console:org:select [ORGCODE]`](#aio-consoleorgselect-orgcode)
* [`aio console:project`](#aio-consoleproject)
* [`aio console:project:list`](#aio-consoleprojectlist)
* [`aio console:project:select [PROJECTIDORNAME]`](#aio-consoleprojectselect-projectidorname)
* [`aio console:publickey`](#aio-consolepublickey)
* [`aio console:publickey:delete IDORFINGERPRINT`](#aio-consolepublickeydelete-idorfingerprint)
* [`aio console:publickey:list`](#aio-consolepublickeylist)
* [`aio console:publickey:upload FILE`](#aio-consolepublickeyupload-file)
* [`aio console:where`](#aio-consolewhere)
* [`aio console:workspace`](#aio-consoleworkspace)
* [`aio console:workspace:download [DESTINATION]`](#aio-consoleworkspacedownload-destination)
* [`aio console:workspace:list`](#aio-consoleworkspacelist)
* [`aio console:workspace:select [WORKSPACEIDORNAME]`](#aio-consoleworkspaceselect-workspaceidorname)

## `aio console`

Console plugin for the Adobe I/O CLI

```
USAGE
  $ aio console

OPTIONS
  --help  Show help
```

_See code: [src/commands/console/index.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.4.2/src/commands/console/index.js)_

## `aio console:org`

Manage your Adobe I/O Console Organizations

```
USAGE
  $ aio console:org

OPTIONS
  --help  Show help
```

_See code: [src/commands/console/org/index.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.4.2/src/commands/console/org/index.js)_

## `aio console:org:list`

List your Organizations

```
USAGE
  $ aio console:org:list

OPTIONS
  -j, --json  Output json
  -y, --yml   Output yml
  --help      Show help

ALIASES
  $ aio console:org:ls
```

_See code: [src/commands/console/org/list.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.4.2/src/commands/console/org/list.js)_

## `aio console:org:select [ORGCODE]`

Select an Organization

```
USAGE
  $ aio console:org:select [ORGCODE]

ARGUMENTS
  ORGCODE  Adobe Developer Console Org code

OPTIONS
  --help  Show help

ALIASES
  $ aio console:org:sel
```

_See code: [src/commands/console/org/select.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.4.2/src/commands/console/org/select.js)_

## `aio console:project`

Manage your Adobe I/O Console Projects

```
USAGE
  $ aio console:project

OPTIONS
  --help  Show help
```

_See code: [src/commands/console/project/index.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.4.2/src/commands/console/project/index.js)_

## `aio console:project:list`

List your Projects for the selected Organization

```
USAGE
  $ aio console:project:list

OPTIONS
  -j, --json     Output json
  -y, --yml      Output yml
  --help         Show help
  --orgId=orgId  OrgID for listing projects

ALIASES
  $ aio console:project:ls
```

_See code: [src/commands/console/project/list.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.4.2/src/commands/console/project/list.js)_

## `aio console:project:select [PROJECTIDORNAME]`

Select a Project for the selected Organization

```
USAGE
  $ aio console:project:select [PROJECTIDORNAME]

ARGUMENTS
  PROJECTIDORNAME  Adobe Developer Console Project id or Project name

OPTIONS
  --help         Show help
  --orgId=orgId  Organization id of the Console Project to select

ALIASES
  $ aio console:project:sel
```

_See code: [src/commands/console/project/select.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.4.2/src/commands/console/project/select.js)_

## `aio console:publickey`

Manage Public Key Bindings for your Adobe I/O Console Workspaces

```
USAGE
  $ aio console:publickey

OPTIONS
  --help  Show help
```

_See code: [src/commands/console/publickey/index.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.4.2/src/commands/console/publickey/index.js)_

## `aio console:publickey:delete IDORFINGERPRINT`

Delete a public key certificate from the selected Workspace

```
USAGE
  $ aio console:publickey:delete IDORFINGERPRINT

ARGUMENTS
  IDORFINGERPRINT  The bindingId or the fingerprint of the public key binding to delete

OPTIONS
  --help                     Show help
  --orgId=orgId              Organization id of the Console Workspace to delete the public key certificate from
  --projectId=projectId      Project id of the Console Workspace to delete the public key certificate from
  --workspaceId=workspaceId  Workspace id of the Console Workspace to delete the public key certificate from
```

_See code: [src/commands/console/publickey/delete.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.4.2/src/commands/console/publickey/delete.js)_

## `aio console:publickey:list`

List the public key certificates bound to the selected Workspace

```
USAGE
  $ aio console:publickey:list

OPTIONS
  -j, --json                 Output json
  -y, --yml                  Output yml
  --help                     Show help
  --orgId=orgId              Organization id of the Console Workspace to list the public key certificates for
  --projectId=projectId      Project id of the Console Workspace to list the public key certificate for
  --workspaceId=workspaceId  Workspace id of the Console Workspace to list the public key certificate for
```

_See code: [src/commands/console/publickey/list.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.4.2/src/commands/console/publickey/list.js)_

## `aio console:publickey:upload FILE`

Upload a public key certificate to the selected Workspace

```
USAGE
  $ aio console:publickey:upload FILE

ARGUMENTS
  FILE  Path to public key certificate file in PEM format

OPTIONS
  -j, --json                 Output json
  -y, --yml                  Output yml
  --help                     Show help
  --orgId=orgId              Organization id of the Console Workspace to upload the public key certificate to
  --projectId=projectId      Project id of the Console Workspace to upload the public key certificate to
  --workspaceId=workspaceId  Workspace id of the Console Workspace to upload the public key certificate to
```

_See code: [src/commands/console/publickey/upload.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.4.2/src/commands/console/publickey/upload.js)_

## `aio console:where`

Show the currently selected Organization, Project and Workspace

```
USAGE
  $ aio console:where

OPTIONS
  -j, --json  Output json
  -y, --yml   Output yml
  --help      Show help

ALIASES
  $ aio where
```

_See code: [src/commands/console/where/index.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.4.2/src/commands/console/where/index.js)_

## `aio console:workspace`

Manage your Adobe I/O Console Workspaces

```
USAGE
  $ aio console:workspace

OPTIONS
  --help  Show help

ALIASES
  $ aio console:ws
```

_See code: [src/commands/console/workspace/index.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.4.2/src/commands/console/workspace/index.js)_

## `aio console:workspace:download [DESTINATION]`

Downloads the configuration for the selected Workspace

```
USAGE
  $ aio console:workspace:download [DESTINATION]

ARGUMENTS
  DESTINATION  Output file name or folder name where the Console Workspace configuration file should be saved

OPTIONS
  --help                     Show help
  --orgId=orgId              Organization id of the Console Workspace configuration to download
  --projectId=projectId      Project id of the Console Workspace configuration to download
  --workspaceId=workspaceId  Workspace id of the Console Workspace configuration to download

ALIASES
  $ aio console:workspace:dl
  $ aio console:ws:download
  $ aio console:ws:dl
```

_See code: [src/commands/console/workspace/download.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.4.2/src/commands/console/workspace/download.js)_

## `aio console:workspace:list`

List your Workspaces for your selected Project

```
USAGE
  $ aio console:workspace:list

OPTIONS
  -j, --json             Output json
  -y, --yml              Output yml
  --help                 Show help
  --orgId=orgId          Organization id of the Console Workspaces to list
  --projectId=projectId  Project id of the Console Workspaces to list

ALIASES
  $ aio console:workspace:ls
  $ aio console:ws:list
  $ aio console:ws:ls
```

_See code: [src/commands/console/workspace/list.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.4.2/src/commands/console/workspace/list.js)_

## `aio console:workspace:select [WORKSPACEIDORNAME]`

Select a Workspace for the selected Project

```
USAGE
  $ aio console:workspace:select [WORKSPACEIDORNAME]

ARGUMENTS
  WORKSPACEIDORNAME  Adobe Developer Console Workspace id or Workspace name

OPTIONS
  --help                 Show help
  --orgId=orgId          Organization id of the Console Workspace to select
  --projectId=projectId  Project id of the Console Workspace to select

ALIASES
  $ aio console:workspace:sel
  $ aio console:ws:select
  $ aio console:ws:sel
```

_See code: [src/commands/console/workspace/select.js](https://github.com/adobe/aio-cli-plugin-console/blob/3.4.2/src/commands/console/workspace/select.js)_
<!-- commandsstop -->
