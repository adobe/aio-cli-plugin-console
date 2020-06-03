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
const path = require('path')
const ConsoleCommand = require('../index')
const aioConsoleLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-console:workspace:download', { provider: 'debug' })
const { cli } = require('cli-ux')
const { CONFIG_KEYS } = require('../../../config')

class DownloadCommand extends ConsoleCommand {
  async run () {
    aioConsoleLogger.debug('Trying to fetch workspace configs')
    const { args } = this.parse(DownloadCommand)

    const org = this.getConfig(CONFIG_KEYS.ORG)
    if (!org) {
      this.log('You have not selected any Organization, Project and Workspace. Please select first.')
      this.printConsoleConfig()
      this.exit(1)
    }

    const project = this.getConfig(CONFIG_KEYS.PROJECT)
    if (!project) {
      this.log('You have not selected any Project and Workspace. Please select first.')
      this.printConsoleConfig()
      this.exit(1)
    }

    const workspace = this.getConfig(CONFIG_KEYS.WORKSPACE)
    if (!workspace) {
      this.log('You have not selected a Workspace. Please select first.')
      this.printConsoleConfig()
      this.exit(1)
    }

    await this.initSdk()
    try {
      cli.action.start(`Downloading configuration for Workspace ${workspace.name}`)
      const consoleConfig = await this.consoleClient.downloadWorkspaceJson(org.id, project.id, workspace.id)
      cli.action.stop()

      let fileName = `${org.id}-${project.name}-${workspace.name}.json`
      if (args.destination) {
        fileName = path.join(args.destination, fileName)
      }
      fs.writeFileSync(fileName, JSON.stringify(consoleConfig.body, null, 2))

      this.log(`Downloaded Workspace configuration to ${fileName}`)
    } catch (err) {
      aioConsoleLogger.debug(err)
      this.error(err.message)
    } finally {
      cli.action.stop()
    }
  }
}

DownloadCommand.description = 'Downloads the configuration for the selected Workspace'

DownloadCommand.aliases = [
  'console:workspace:dl',
  'console:ws:download',
  'console:ws:dl'
]

DownloadCommand.args = [
  { name: 'destination', required: false, description: 'path where workspace configuration file will be saved' }
]

module.exports = DownloadCommand
