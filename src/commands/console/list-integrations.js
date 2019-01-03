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

const {Command, flags} = require('@oclif/command')
const {accessToken: getAccessToken} = require('@adobe/aio-cli-plugin-jwt-auth')
const {getApiKey, getOrgs, getIntegrations} = require('../../console-helpers')

const DEFAULT_PAGE_NUMBER = 1
const DEFAULT_PAGE_SIZE = 20

// simplified to include only id+orgId, and name. Formatted for output.
async function _listIntegrations(passphrase, pageNum, pageSize) {
  try {
    const apiKey = await getApiKey()
    const accessToken = await getAccessToken(passphrase)
    const orgs = await getOrgs(accessToken, apiKey)
    const integrations = await getIntegrations(orgs[0].id, accessToken, apiKey, {pageNum, pageSize})

    const results = integrations.content.map(obj => {
      return `${obj.orgId}_${obj.id} : ${obj.name}` // \n\t- ${obj.description}`;
    })

    const str = `Success: Page ${integrations.page + 1} of ${integrations.pages}, Showing ${results.length} results of ${integrations.total} total.`
    results.unshift(str)
    return Promise.resolve(results.join('\n'))
  } catch (error) {
    return Promise.reject(error)
  }
}

class ListIntegrationsCommand extends Command {
  async run() {
    const {flags} = this.parse(ListIntegrationsCommand)
    let result

    try {
      result = await this.listIntegrations(flags.passphrase, flags.page, flags.pageSize)
    } catch (error) {
      this.error(error.message)
    }

    this.log(result)
    return result
  }

  async listIntegrations(passphrase = null, page = DEFAULT_PAGE_NUMBER, pageSize = DEFAULT_PAGE_SIZE) {
    return _listIntegrations(passphrase, page, pageSize)
  }
}

ListIntegrationsCommand.description = 'lists integrations for use with Adobe I/O Runtime serverless functions'

ListIntegrationsCommand.flags = {
  page: flags.integer({char: 'p', description: 'page number', default: DEFAULT_PAGE_NUMBER}),
  pageSize: flags.integer({char: 's', description: 'size of a page (max 50)', default: DEFAULT_PAGE_SIZE}),
  passphrase: flags.string({char: 'p', description: 'the passphrase for the private-key'}),
}

ListIntegrationsCommand.aliases = [
  'console:ls',
]

module.exports = ListIntegrationsCommand
