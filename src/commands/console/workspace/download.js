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
const fs = require('fs')
const ConsoleCommand = require('../index')
const Constants = require('../../../utils/constants')
const aioConsoleLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-console:workspace:download', { provider: 'debug' })
const { cli } = require('cli-ux')

class DownloadCommand extends ConsoleCommand {
  async run () {
    await this.initSdk()
    try {
      aioConsoleLogger.debug('Trying to fetch workspace configs')

      const org = this.getConfig(Constants.ORG_KEY)
      if (!org) {
        throw new Error('No Organization selected')
      }

      const project = this.getConfig(Constants.PROJECT_KEY)
      if (!project) {
        throw new Error('No Project selected')
      }

      const workspace = this.getConfig(Constants.WORKSPACE_KEY)
      if (!workspace) {
        throw new Error('No Workspace selected')
      }

      cli.action.start(`Downloading configuration for Workspace ${workspace.name}`)

      const consoleConfig = await this.consoleClient.downloadWorkspaceJson(org.id, project.id, workspace.id)
      const fileName = `${org.id}-${project.name}-${workspace.name}.json`

      fs.writeFileSync(fileName, JSON.stringify(consoleConfig.body, null, 2))
      this.log(`Downloaded Workspace configuration to ${fileName}`)
    } catch (e) {
      this.error(e.message)
    } finally {
      cli.action.stop()
    }
  }
}

DownloadCommand.description = 'Downloads the configuration for the selected Workspace'

DownloadCommand.aliases = [
  'console:workspace:download',
  'console:workspace:dl',
  'console:ws:download',
  'console:ws:dl'
]

module.exports = DownloadCommand
