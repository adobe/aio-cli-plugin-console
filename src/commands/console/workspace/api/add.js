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
const aioConsoleLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-console:workspace:api:add', { provider: 'debug' })
const LibConsoleCLI = require('@adobe/aio-cli-lib-console')

/**
 * Parse --license-config flag values into a map of sdkCode -> array of profile
 * identifiers (matched later against profile name or id).
 *
 * Format: "<sdkCode>=<nameOrId>[,<nameOrId>...]"
 *
 * @param {string[]} values raw flag values
 * @returns {Object<string, string[]>} map of sdkCode to list of profile identifiers
 */
function parseLicenseConfigFlags (values) {
  const result = {}
  for (const raw of values) {
    const eq = raw.indexOf('=')
    if (eq <= 0) {
      throw new Error(`Invalid --license-config value '${raw}'. Expected format: '<sdkCode>=<profileNameOrId>[,<profileNameOrId>...]'.`)
    }
    const sdkCode = raw.slice(0, eq).trim()
    const rest = raw.slice(eq + 1)
    const profiles = rest.split(',').map(s => s.trim()).filter(Boolean)
    if (!sdkCode || profiles.length === 0) {
      throw new Error(`Invalid --license-config value '${raw}'. Expected format: '<sdkCode>=<profileNameOrId>[,<profileNameOrId>...]'.`)
    }
    if (!result[sdkCode]) {
      result[sdkCode] = []
    }
    result[sdkCode].push(...profiles)
  }
  return result
}

/**
 * Match requested profile identifiers against a service's available
 * licenseConfigs by either id or name.
 *
 * @param {Array<{id: string, name: string, productId: string}>} available
 * @param {string[]} requested profile names or ids
 * @param {string} sdkCode service code for error messages
 * @returns {Array} selected licenseConfig objects
 */
function resolveLicenseConfigs (available, requested, sdkCode) {
  const selected = []
  const notFound = []
  for (const id of requested) {
    const match = available.find(lc => lc.id === id || lc.name === id)
    if (match) {
      selected.push(match)
    } else {
      notFound.push(id)
    }
  }
  if (notFound.length > 0) {
    const availableNames = available.map(lc => lc.name).join(', ')
    throw new Error(
      `Product profile(s) not found for service ${sdkCode}: ${notFound.join(', ')}. ` +
      `Available profiles: ${availableNames}.`
    )
  }
  return selected
}

class AddCommand extends ConsoleCommand {
  async run () {
    const { flags } = await this.parse(AddCommand)

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

      const licenseConfigMap = parseLicenseConfigFlags(flags['license-config'] || [])

      const enabledServices = await this.consoleCLI.getEnabledServicesForOrg(orgId)
      aioConsoleLogger.debug(`Enabled services: ${JSON.stringify(enabledServices.map(s => s.code))}`)

      const serviceProperties = []
      const notFound = []
      const missingProfiles = []
      for (const code of requestedCodes) {
        const service = enabledServices.find(s => s.code === code)
        if (!service) {
          notFound.push(code)
          continue
        }

        const availableProfiles = (service.properties && service.properties.licenseConfigs) || null
        let licenseConfigs = null
        if (availableProfiles && availableProfiles.length > 0) {
          const requestedProfiles = licenseConfigMap[code]
          if (!requestedProfiles || requestedProfiles.length === 0) {
            missingProfiles.push({ code, available: availableProfiles })
            continue
          }
          licenseConfigs = resolveLicenseConfigs(availableProfiles, requestedProfiles, code)
        }

        serviceProperties.push({
          name: service.name,
          sdkCode: service.code,
          roles: (service.properties && service.properties.roles) || null,
          licenseConfigs
        })
      }

      if (notFound.length > 0) {
        this.error(`Service code(s) not found or not enabled in the Organization: ${notFound.join(', ')}`)
      }

      if (missingProfiles.length > 0) {
        const lines = missingProfiles.map(({ code, available }) => {
          const names = available.map(lc => lc.name).join(', ')
          return `  ${code}: ${names}`
        }).join('\n')
        this.error(
          'The following service(s) require one or more product profiles. ' +
          'Pass them with --license-config \'<sdkCode>=<profileNameOrId>[,...]\':\n' + lines
        )
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

AddCommand.description = 'Add API service(s) to a Workspace'

AddCommand.flags = {
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
  'license-config': Flags.string({
    description: 'Product profile(s) for a service, format: \'<sdkCode>=<profileNameOrId>[,<profileNameOrId>...]\'. Repeat for multiple services.',
    multiple: true
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

AddCommand.aliases = [
  'console:ws:api:add'
]

module.exports = AddCommand
module.exports.parseLicenseConfigFlags = parseLicenseConfigFlags
module.exports.resolveLicenseConfigs = resolveLicenseConfigs
