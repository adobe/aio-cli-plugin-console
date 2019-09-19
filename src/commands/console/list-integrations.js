/*
Copyright 2018 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const yaml = require('js-yaml')
const { Command, flags } = require('@oclif/command')
const { accessToken: getAccessToken } = require('@adobe/aio-cli-plugin-jwt-auth')
const { getApiKey, getOrgs, getIntegrations, getConfig } = require('../../console-helpers')
const { cli } = require('cli-ux')
const debug = require('debug')('aio-cli-plugin-console:list-integrations')

const PAGE_SIZE = 50

// simplified to include only id+orgId, and name. Formatted for output.
async function _listIntegrations (passphrase) {
  const apiKey = await getApiKey()
  const accessToken = await getAccessToken(passphrase)
  const orgs = await getOrgs(accessToken, apiKey)
  const integrations = await getIntegrations(orgs[0].id, accessToken, apiKey, { pageNum: 1, pageSize: PAGE_SIZE })
  let result = integrations.content

  const pages = integrations.pages
  const fetches = []
  for (let i = 2; i <= pages; i++) {
    fetches.push(getIntegrations(orgs[0].id, accessToken, apiKey, { pageNum: i, pageSize: PAGE_SIZE }))
  }

  const rest = await Promise.all(fetches)

  rest.forEach((integration) => { result = result.concat(integration.content) })

  return result
}

class ListIntegrationsCommand extends Command {
  logJSON (obj) {
    this.log(JSON.stringify(obj, null, 2))
  }

  logYAML (obj) {
    this.log(yaml.safeDump(obj, { noCompatMode: true }))
  }

  async run () {
    const { flags } = this.parse(ListIntegrationsCommand)
    let result

    try {
      result = await this.listIntegrations(flags.passphrase)
    } catch (error) {
      debug(error)
      this.error(error.message)
    }

    const currentNamespace = getConfig()['namespace']

    result.forEach(obj => {
      obj.selected = `${obj.orgId}_${obj.id}` === currentNamespace
      obj.namespace = `${obj.orgId}_${obj.id}`
      return obj
    })

    if (flags.name) {
      result = result.sort((a, b) => a.name.localeCompare(b.name))
    } else {
      result = result.sort((a, b) => a.namespace.localeCompare(b.namespace))
    }

    if (flags.json) {
      this.logJSON(result)
    } else if (flags.yaml) {
      this.logYAML(result)
    } else {
      cli.table(result, {
        namespace: { },
        name: {
          minWidth: 25,
        },
        apiKey: {
          header: 'API Key',
          minWidth: 15,
          get: row => (row.apiKey) ? `${row.apiKey.substr(0,5)}...` : ''
        },
        status: {},
        current: {
          header: '',
          get: row => (row.selected) ? '(currently selected)' : ''
        }
      }, {
        printLine: this.log
      })
    }
    return result
  }

  async listIntegrations (passphrase = null) {
    return _listIntegrations(passphrase)
  }
}

ListIntegrationsCommand.description = 'lists integrations for use with Adobe I/O Runtime serverless functions'

ListIntegrationsCommand.flags = {
  passphrase: flags.string({ char: 'p', description: 'the passphrase for the private-key' }),
  name: flags.boolean({ char: 'n', description: 'sort results by name' }),
  json: flags.boolean({ char: 'j', description: 'output raw json' }),
  yaml: flags.boolean({ char: 'y', description: 'output yaml' })
}

ListIntegrationsCommand.aliases = [
  'console:ls',
  'console:list'
]

module.exports = ListIntegrationsCommand
