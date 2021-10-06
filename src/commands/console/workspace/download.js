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
const { flags } = require('@oclif/command')
const path = require('path')
const ConsoleCommand = require('../index')
const aioConsoleLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-console:workspace:download', { provider: 'debug' })
const { CONFIG_KEYS } = require('../../../config')
const LibConsoleCLI = require('@adobe/aio-cli-lib-console')
const fs = require('fs')

class DownloadCommand extends ConsoleCommand {
  async run () {
    aioConsoleLogger.debug('Trying to fetch workspace configs')
    const { args, flags } = this.parse(DownloadCommand)

    const orgId = flags.orgId || this.getConfig(`${CONFIG_KEYS.ORG}.id`)
    if (!orgId) {
      this.log('You have not selected an Organization. Please select first.')
      this.printConsoleConfig()
      this.exit(1)
    }

    const projectId = flags.projectId || this.getConfig(`${CONFIG_KEYS.PROJECT}.id`)
    if (!projectId) {
      this.log('You have not selected a Project. Please select first.')
      this.printConsoleConfig()
      this.exit(1)
    }

    const workspaceId = flags.workspaceId || this.getConfig(`${CONFIG_KEYS.WORKSPACE}.id`)
    if (!workspaceId) {
      this.log('You have not selected a Workspace. Please select first.')
      this.printConsoleConfig()
      this.exit(1)
    }

    await this.initSdk()
    try {
      const consoleConfig = await this.consoleCLI.getWorkspaceConfig(orgId, projectId, workspaceId)

      let fileName = 'console.json'
      if (!flags.workspaceId && !flags.projectId && !flags.orgId) {
        const projectName = this.getConfig(`${CONFIG_KEYS.PROJECT}.name`)
        const workspaceName = this.getConfig(`${CONFIG_KEYS.WORKSPACE}.name`)
        if (projectName && workspaceName) {
          // give a better default file name when possible
          fileName = `${orgId}-${projectName}-${workspaceName}.json`
        }
      }
      if (args.destination) {
        // overwrite default name based on destination flag
        let stats
        try {
          stats = fs.statSync(args.destination)
        } catch (e) { /* does not exist */ }
        if (!stats || stats.isFile()) {
          fileName = args.destination
        } else if (stats.isDirectory()) {
          fileName = path.join(args.destination, fileName)
        }
      }

      fs.writeFileSync(fileName, JSON.stringify(consoleConfig, null, 2))

      this.log(`Downloaded Workspace configuration to ${fileName}`)
    } catch (err) {
      aioConsoleLogger.debug(err)
      this.error(err.message)
    } finally {
      LibConsoleCLI.cleanStdOut()
    }
  }
}

DownloadCommand.description = 'Downloads the configuration for the selected Workspace'

DownloadCommand.flags = {
  ...ConsoleCommand.flags,
  orgId: flags.string({
    description: 'Organization id of the Console Workspace configuration to download'
  }),
  projectId: flags.string({
    description: 'Project id of the Console Workspace configuration to download'
  }),
  workspaceId: flags.string({
    description: 'Workspace id of the Console Workspace configuration to download'
  })
}

DownloadCommand.aliases = [
  'console:workspace:dl',
  'console:ws:download',
  'console:ws:dl'
]

DownloadCommand.args = [
  { name: 'destination', required: false, description: 'Output file name or folder name where the Console Workspace configuration file should be saved' }
]

module.exports = DownloadCommand
