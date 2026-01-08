/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
const aioLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-console:open', { provider: 'debug' })
const { getCliEnv } = require('@adobe/aio-lib-env')
const { OPEN_URLS } = require('../../config')
const open = require('open')
const ConsoleCommand = require('./index')
class OpenCommand extends ConsoleCommand {
  async run () {
    // TODO: we could support --orgId and --projectId flags to open the console for a specific org/project
    // currently we open the console for the local config org/project
    // const { flags } = await this.parse(OpenCommand)

    aioLogger.debug('Inquiring currently selected Org, Project and Workspace')
    const cliEnv = getCliEnv()
    const config = this.getConfig()
    let url = OPEN_URLS[cliEnv]
    if (config?.project?.id && config?.project?.org_id) {
      url += `/${config.project.org_id}/${config.project.id}/`
      if (config.workspace && config.workspace.id) {
        url += `workspaces/${config.workspace.id}/details`
      } else {
        url += 'overview'
      }
    }
    aioLogger.debug(`opening url ${url}`)
    open(url)
  }
}

OpenCommand.description = 'Open the developer console for the selected Organization, Project and Workspace'

OpenCommand.flags = {
  ...ConsoleCommand.flags
}

OpenCommand.aliases = [
  'open'
]

module.exports = OpenCommand
