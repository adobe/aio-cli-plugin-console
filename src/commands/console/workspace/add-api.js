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
const ConsoleCommand = require('../index')
const aioConsoleLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-console:workspace:add-api', { provider: 'debug' })
const LibConsoleCLI = require('@adobe/aio-cli-lib-console')

class AddApiCommand extends ConsoleCommand {
  async run () {
    const { flags } = await this.parse(AddApiCommand)

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

      const requestedCodes = flags['service-code'].split(',').map(s => s.trim()).filter(Boolean)
      if (requestedCodes.length === 0) {
        this.error('At least one service code must be provided.')
      }

      const enabledServices = await this.consoleCLI.getEnabledServicesForOrg(orgId)
      aioConsoleLogger.debug(`Enabled services: ${JSON.stringify(enabledServices.map(s => s.code))}`)

      const serviceProperties = []
      const notFound = []
      for (const code of requestedCodes) {
        const service = enabledServices.find(s => s.code === code)
        if (!service) {
          notFound.push(code)
          continue
        }
        serviceProperties.push({
          name: service.name,
          sdkCode: service.code,
          roles: (service.properties && service.properties.roles) || null,
          licenseConfigs: (service.properties && service.properties.licenseConfigs) || null
        })
      }

      if (notFound.length > 0) {
        this.error(`Service code(s) not found or not enabled in the Organization: ${notFound.join(', ')}`)
      }

      const result = await this.consoleCLI.subscribeToServicesWithCredentialType({
        orgId,
        project,
        workspace,
        serviceProperties,
        credentialType: LibConsoleCLI.OAUTH_SERVER_TO_SERVER_CREDENTIAL
      })

      if (flags.json) {
        this.printJson(result)
      } else if (flags.yml) {
        this.printYaml(result)
      } else {
        this.log(`Successfully added API(s) ${requestedCodes.join(', ')} to Workspace ${workspace.name}.`)
      }

      return result
    } catch (err) {
      aioConsoleLogger.debug(err)
      this.error(err.message)
    } finally {
      this.cleanOutput()
    }
  }
}

AddApiCommand.description = 'Add API service(s) to a Workspace'

AddApiCommand.flags = {
  ...ConsoleCommand.flags,
  orgId: Flags.string({
    description: 'Organization id'
  }),
  projectName: Flags.string({
    description: 'Name of the project containing the workspace',
    required: true
  }),
  workspaceName: Flags.string({
    description: 'Name of the workspace to add the API to',
    required: true
  }),
  'service-code': Flags.string({
    description: 'Comma-separated list of API service codes to add (e.g. AssetComputeSDK,AdobeAnalyticsSDK)',
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

AddApiCommand.aliases = [
  'console:ws:add-api'
]

module.exports = AddApiCommand
