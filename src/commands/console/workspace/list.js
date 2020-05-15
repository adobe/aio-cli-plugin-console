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
const { cli } = require('cli-ux')

const ConsoleCommand = require('../index')
const aioConsoleLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-console:workspace:list', { provider: 'debug' })

class ListCommand extends ConsoleCommand {
  async run () {
    await this.initSdk()
    try {
      aioConsoleLogger.debug('Listing workspaces')
      const { flags } = this.parse(ListCommand)

      const org = this.getConfig(ConsoleCommand.CONFIG_KEYS.ORG)
      if (!org) {
        this.log('You have not selected any Organization and Project. Please select first.')
        this.printConsoleConfig()
        return
      }

      const project = this.getConfig(ConsoleCommand.CONFIG_KEYS.PROJECT)
      if (!project) {
        this.log('You have not selected a Project. Please select first.')
        this.printConsoleConfig()
        return
      }

      cli.action.start(`Retrieving Workspaces for Project: ${project.id}`)

      const result = await this.consoleClient.getWorkspacesForProject(org.id, project.id)
      const workspaces = result.body

      aioConsoleLogger.debug('Listing workspaces: Data received')

      if (flags.json) {
        this.printJson(workspaces)
      } else if (flags.yml) {
        this.printYaml(workspaces)
      } else {
        // print formatted result
        cli.table(workspaces, {
          id: {
            minWidth: 25
          },
          name: {
            minWidth: 25
          },
          enabled: {}
        }, {
          printLine: this.log
        })
      }
    } catch (e) {
      this.error(e.message)
    } finally {
      cli.action.stop()
    }
  }
}

ListCommand.description = 'List your Workspaces for your selected Project'

ListCommand.aliases = [
  'console:workspace:list',
  'console:workspace:ls',
  'console:ws:list',
  'console:ws:ls'
]

ListCommand.flags = {
  ...ConsoleCommand.flags,
  json: flags.boolean({
    description: 'Output json',
    char: 'j',
    exclusive: ['yml']
  }),
  yml: flags.boolean({
    description: 'Output yml',
    char: 'y',
    exclusive: ['json']
  })
}

module.exports = ListCommand
