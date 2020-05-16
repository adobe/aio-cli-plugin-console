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
const aioConsoleLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-console:project:list', { provider: 'debug' })
const { flags } = require('@oclif/command')
const { cli } = require('cli-ux')
const ConsoleCommand = require('../index')

class ListCommand extends ConsoleCommand {
  async run () {
    const { flags } = this.parse(ListCommand)

    const orgId = flags.orgId || this.getConfig('org.id')
    if (!orgId) {
      this.log('You have not selected an Organization. Please select first.')
      this.printConsoleConfig()
      this.exit(1)
    }

    await this.initSdk()

    try {
      aioConsoleLogger.debug(`Listing Projects from Org ${orgId}`)

      cli.action.start(`Retrieving Projects for the Organization: ${orgId}`)
      const projects = await this.getConsoleOrgProjects(orgId)
      cli.action.stop()

      if (flags.json) {
        this.printJson(projects)
      } else if (flags.yml) {
        this.printYaml(projects)
      } else {
        this.printResults(projects)
      }
      return projects
    } catch (err) {
      aioConsoleLogger.debug(err)
      this.error(err.message)
    } finally {
      cli.action.stop()
    }
  }

  printResults (projects) {
    const columns = {
      id: {
        header: 'ID'
      },
      name: {
        header: 'Name'
      },
      title: {
        header: 'Title'
      }
    }
    cli.table(projects, columns)
  }
}

ListCommand.description = 'List your Projects for the selected Organization'

ListCommand.flags = {
  ...ConsoleCommand.flags,
  orgId: flags.string({
    description: 'OrgID for listing projects'
  }),
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

ListCommand.aliases = [
  'console:project:ls'
]

module.exports = ListCommand
