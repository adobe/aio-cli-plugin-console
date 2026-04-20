/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
const { Flags } = require('@oclif/core')
const ConsoleCommand = require('../../index')
const aioConsoleLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-console:workspace:api:list', { provider: 'debug' })
const LibConsoleCLI = require('@adobe/aio-cli-lib-console')

class ListCommand extends ConsoleCommand {
  async run () {
    const { flags } = await this.parse(ListCommand)

    const orgId = flags.orgId || this.getConfig('org.id')
    if (!orgId) {
      this.log('You have not selected an Organization. Please select one first.')
      this.printConsoleConfig()
      this.exit(1)
    }

    await this.initSdk()

    try {
      const projects = await this.consoleCLI.getProjects(orgId)
      const project = projects.find(p => p.name === flags.projectName)
      if (!project) {
        this.error(`Project ${flags.projectName} not found in the Organization.`)
      }

      const workspaces = await this.consoleCLI.getWorkspaces(orgId, project.id)
      const workspace = workspaces.find(ws => ws.name === flags.workspaceName)
      if (!workspace) {
        this.error(`Workspace ${flags.workspaceName} not found in Project ${flags.projectName}.`)
      }

      const supportedServices = await this.consoleCLI.getEnabledServicesForOrg(orgId)
      const serviceProperties = await this.consoleCLI.getServicePropertiesFromWorkspaceWithCredentialType({
        orgId,
        projectId: project.id,
        workspace,
        supportedServices,
        credentialType: LibConsoleCLI.OAUTH_SERVER_TO_SERVER_CREDENTIAL
      })

      aioConsoleLogger.debug(`Subscribed services: ${JSON.stringify(serviceProperties.map(s => s.sdkCode))}`)

      if (flags.json) {
        this.printJson(serviceProperties)
      } else if (flags.yml) {
        this.printYaml(serviceProperties)
      } else {
        if (serviceProperties.length === 0) {
          this.log(`Workspace ${workspace.name} has no API services subscribed.`)
          return []
        }
        this.log(`API services subscribed to Workspace ${workspace.name} (${serviceProperties.length}):`)
        this.log('')
        for (const sp of serviceProperties) {
          this.log(`  ${sp.sdkCode}`)
          this.log(`    Name: ${sp.name}`)
          if (sp.licenseConfigs && sp.licenseConfigs.length > 0) {
            const names = sp.licenseConfigs.map(lc => lc.name).join(', ')
            this.log(`    Product Profiles: ${names}`)
          }
          this.log('')
        }
      }

      return serviceProperties
    } catch (err) {
      aioConsoleLogger.debug(err)
      this.error(err.message)
    } finally {
      this.cleanOutput()
    }
  }
}

ListCommand.description = 'List API services currently subscribed to a Workspace'

ListCommand.flags = {
  ...ConsoleCommand.flags,
  orgId: Flags.string({
    description: 'Organization id'
  }),
  projectName: Flags.string({
    description: 'Name of the project containing the workspace',
    required: true
  }),
  workspaceName: Flags.string({
    description: 'Name of the workspace to list services for',
    required: true
  }),
  json: Flags.boolean({
    description: 'Output json',
    char: 'j',
    exclusive: ['yml']
  }),
  yml: Flags.boolean({
    description: 'Output yml',
    char: 'y',
    exclusive: ['json']
  })
}

ListCommand.aliases = [
  'console:workspace:api:ls',
  'console:ws:api:list',
  'console:ws:api:ls'
]

module.exports = ListCommand
