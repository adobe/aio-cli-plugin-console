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
 * @returns {{[sdkCode: string]: string[]}} map of sdkCode to list of profile identifiers
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
 * licenseConfigs by id, name, or productId.
 *
 * Matching by productId lets users pass the value they see in
 * `properties.licenseConfigs[].productId` from `aio console api list`,
 * which is convenient for services like Frame.io that expose a single
 * profile per product.
 *
 * @param {Array<{id: string, name: string, productId: string}>} available licenseConfigs reported for the service
 * @param {string[]} requested profile names, ids, or productIds
 * @param {string} sdkCode service code for error messages
 * @returns {Array} selected licenseConfig objects
 */
function resolveLicenseConfigs (available, requested, sdkCode) {
  const selected = []
  const notFound = []
  for (const id of requested) {
    const match = available.find(lc => lc.id === id || lc.name === id || lc.productId === id)
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

/**
 * Pick the best service record to subscribe when multiple records share
 * the same sdkCode.
 *
 * Some services (notably Frame.io) appear twice in `getEnabledServicesForOrg`:
 * once as `type: 'adobeid'` with no licenseConfigs (browser/SPA flow) and
 * once as `type: 'entp'` with the product profile metadata required for
 * OAuth Server-to-Server. `Array.find` returns whichever the API lists
 * first, which silently drops `--license-config` when the adobeid record
 * wins and causes JIL to reject the subscription. Since this command
 * always uses OAuth Server-to-Server credentials, prefer the `entp` record
 * (and, within that, the one that actually carries licenseConfigs).
 *
 * @param {Array<object>} services full enabled-services list
 * @param {string} code sdkCode to look up
 * @returns {object|undefined} the chosen service record, or undefined
 */
function pickServiceForCode (services, code) {
  const matches = services.filter(s => s.code === code)
  if (matches.length === 0) {
    return undefined
  }
  const hasLicenseConfigs = s =>
    s.properties &&
    Array.isArray(s.properties.licenseConfigs) &&
    s.properties.licenseConfigs.length > 0
  const entpWithProfiles = matches.find(s => s.type === 'entp' && hasLicenseConfigs(s))
  if (entpWithProfiles) {
    return entpWithProfiles
  }
  const entp = matches.find(s => s.type === 'entp')
  if (entp) {
    return entp
  }
  return matches[0]
}

/**
 * Reduce the enabled-services list to one record per sdkCode using
 * pickServiceForCode. Preserves the original ordering of the chosen records.
 *
 * @param {Array<object>} services enabled services
 * @returns {Array<object>} deduplicated services
 */
function dedupeServicesByCode (services) {
  const seen = new Set()
  const result = []
  for (const s of services) {
    if (seen.has(s.code)) continue
    seen.add(s.code)
    // pickServiceForCode is guaranteed to return a record because s itself
    // is in services and matches by code.
    result.push(pickServiceForCode(services, s.code))
  }
  return result
}

/**
 * Merge new service-subscription requests with existing services on the
 * credential. JIL's PUT-services endpoint replaces the credential's
 * service list rather than appending to it, so without this merge a
 * subsequent `aio console workspace api add` call would silently wipe
 * the services subscribed by an earlier call.
 *
 * For codes present in both, the new entry wins (the user is overriding
 * the existing subscription, including any licenseConfig changes).
 *
 * @param {Array<object>} existing serviceProperties currently on the credential
 * @param {Array<object>} requested serviceProperties the user is adding
 * @returns {Array<object>} merged serviceProperties
 */
function mergeServiceProperties (existing, requested) {
  const requestedCodes = new Set(requested.map(sp => sp.sdkCode))
  const kept = existing.filter(sp => !requestedCodes.has(sp.sdkCode))
  return [...kept, ...requested]
}

/**
 * Detect JIL subscription errors embedded in a 200 response and throw
 * a CLI-friendly error if any are found.
 *
 * JIL returns `{ error: [<sdkCode>...], errorDetails: [{ sdkCode, domain, code, message }...] }`
 * for partial/total failures inside an otherwise successful HTTP response,
 * so without this check `--json` output silently looks like success.
 *
 * @param {object} response the subscribe response body
 */
function assertSubscribeSuccess (response) {
  if (!response || typeof response !== 'object') {
    return
  }
  const errorDetails = Array.isArray(response.errorDetails) ? response.errorDetails : []
  const errorCodes = Array.isArray(response.error) ? response.error : []
  if (errorDetails.length === 0 && errorCodes.length === 0) {
    return
  }
  const formatted = errorDetails.length > 0
    ? errorDetails.map(d => {
      const where = d && d.sdkCode ? `${d.sdkCode}: ` : ''
      const message = (d && d.message) || JSON.stringify(d)
      return `  ${where}${message}`
    }).join('\n')
    : `  ${errorCodes.join(', ')}`
  throw new Error(`Failed to add API service(s):\n${formatted}`)
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
      const supportedServices = dedupeServicesByCode(enabledServices)
      aioConsoleLogger.debug(`Enabled services (deduped): ${JSON.stringify(supportedServices.map(s => s.code))}`)

      const serviceProperties = []
      const notFound = []
      const missingProfiles = []
      for (const code of requestedCodes) {
        const service = supportedServices.find(s => s.code === code)
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

      // JIL's PUT-services endpoint replaces the credential's service list,
      // so fetch what's already subscribed and submit the union — otherwise
      // a later `api add` call silently wipes services attached by an earlier
      // one. Treat any failure as "no existing services" so a brand-new
      // workspace (no credential yet) still works.
      let existingProperties = []
      try {
        existingProperties = await this.consoleCLI.getServicePropertiesFromWorkspaceWithCredentialType({
          orgId,
          projectId: project.id,
          workspace,
          supportedServices,
          credentialType: LibConsoleCLI.OAUTH_SERVER_TO_SERVER_CREDENTIAL
        })
      } catch (err) {
        aioConsoleLogger.debug(`Could not fetch existing services for workspace ${workspace.name}: ${err.message}`)
      }
      const mergedProperties = mergeServiceProperties(existingProperties, serviceProperties)
      aioConsoleLogger.debug(`Submitting service list: ${JSON.stringify(mergedProperties.map(sp => sp.sdkCode))}`)

      const result = await this.consoleCLI.subscribeToServicesWithCredentialType({
        orgId,
        project,
        workspace,
        serviceProperties: mergedProperties,
        credentialType: LibConsoleCLI.OAUTH_SERVER_TO_SERVER_CREDENTIAL
      })

      assertSubscribeSuccess(result)

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
    description: 'Product profile(s) for a service, format: \'<sdkCode>=<profileNameOrIdOrProductId>[,<profileNameOrIdOrProductId>...]\'. Repeat for multiple services.',
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
module.exports.assertSubscribeSuccess = assertSubscribeSuccess
module.exports.pickServiceForCode = pickServiceForCode
module.exports.dedupeServicesByCode = dedupeServicesByCode
module.exports.mergeServiceProperties = mergeServiceProperties
