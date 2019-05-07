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

const fetch = require('node-fetch')
const path = require('path')
const config = require('@adobe/aio-cli-config')
const { cli } = require('cli-ux')
const debug = require('debug')('aio-cli-plugin-console')
const fs = require('fs')

/**
 * @description Calls the server api to get a list of orgs
 * @param {string} accessToken a valid token from jwt-auth command
 * @param {Sting} apiKey a valid api_key for this api
 * @return {Promise} resolves with a list of orgs
 */
async function getOrgs (accessToken, apiKey) {
  const orgsUrl = await getOrgsUrl()

  const options = {
    headers: {
      'X-Api-Key': apiKey,
      Authorization: `Bearer ${accessToken}`,
      accept: 'application/json'
    }
  }

  debug(`fetch: ${orgsUrl}`)
  return fetch(orgsUrl, options).then((res) => {
    if (res.ok) return res.json()
    else throw new Error(`Cannot retrieve organizations: ${orgsUrl} (${res.status} ${res.statusText})`)
  })
}

/**
 * @description Returns the path to the users wskprops file, which can vary by OS, and
 *  can be overridden with an enviroment variable
 * @return {String} resolved path to wskprops file
 */
function getWskPropsFilePath () {
  if (process.env.WSK_CONFIG_FILE) {
    return path.resolve(process.env.WSK_CONFIG_FILE)
  }
  return path.resolve(require('os').homedir(), '.wskprops')
}

function getWskProps () {
  const result = {}
  try {
    const props = fs.readFileSync(getWskPropsFilePath(), 'utf-8')
    const re = /^(.+)=(.+)$/gm
    let m
    while ((m = re.exec(props)) !== null) {
      result[m[1].toLowerCase().trim()] = m[2].replace(/ #.*$/, '').trim()
    }
  } catch (e) { }
  return result
}

async function getJwtAuth () {
  const data = config.get('jwt-auth')
  if (!data) throw new Error('missing config data: jwt-auth')
  return data
}

async function getApiKey () {
  const configData = await getJwtAuth()
  if (!configData.client_id) {
    throw new Error('missing config data: client_id')
  }
  return configData.client_id
}

async function getOrgsUrl () {
  const configData = await getJwtAuth()
  return configData.console_get_orgs_url || 'https://api.adobe.io/console/organizations'
}

async function getNamespaceUrl () {
  const configData = await getJwtAuth()
  return configData.console_get_namespaces_url || 'https://api.adobe.io/runtime/admin/namespaces/'
}

async function getIMSOrgId () {
  const configData = await getJwtAuth()
  if (!configData.jwt_payload) {
    throw new Error('missing config data: jwt_payload')
  }
  if (!configData.jwt_payload.iss) {
    throw new Error('missing config data: jwt_payload.iss')
  }
  return configData.jwt_payload.iss
}

/**
 * @description Calls the server api to get a list of integrations (by org)
 * @param {string} orgId organization to look in
 * @param {string} accessToken a valid token from jwt-auth command
 * @param {Sting} apiKey a valid api_key for this api
 * @return {Promise} resolves with a list of integrations
 */
async function getIntegrations (orgId, accessToken, apiKey, { pageNum = 1, pageSize = 20 } = {}) {
  // server is zero based, we are 1 based
  const pg = (pageNum > 0) ? pageNum - 1 : 0
  // server chokes with pagesize greater than 50
  const sz = (pageSize < 51) ? pageSize : 50

  const orgsUrl = await getOrgsUrl()
  const integrationsUrl = `${orgsUrl}/${orgId}/integrations?page=${pg}&size=${sz}`
  const options = {
    headers: {
      'X-Api-Key': apiKey,
      Authorization: `Bearer ${accessToken}`,
      accept: 'application/json'
    }
  }

  debug(`fetch: ${integrationsUrl}`)
  return fetch(integrationsUrl, options).then((res) => {
    if (res.ok) return res.json()
    else throw new Error(`Cannot retrieve integrations: ${integrationsUrl} (${res.status} ${res.statusText})`)
  })
}

/**
 * @description Calls the server api to get an integrations by namespace
 * @param {string} namespace namespace
 * @param {string} accessToken a valid token from jwt-auth command
 * @param {Sting} apiKey a valid api_key for this api
 * @return {Promise} resolves with a list of integrations
 */
async function getIntegration (namespace, accessToken, apiKey) {
  const orgsUrl = await getOrgsUrl()
  const [org, integration] = namespace.split('_')
  const integrationUrl = `${orgsUrl}/${org}/integrations/${integration}`
  const options = {
    headers: {
      'X-Api-Key': apiKey,
      Authorization: `Bearer ${accessToken}`,
      accept: 'application/json'
    }
  }

  debug(`fetch: ${integrationUrl}`)
  return fetch(integrationUrl, options).then((res) => {
    if (res.ok) return res.json()
    else throw new Error(`Cannot retrieve integration: ${integrationUrl} (${res.status} ${res.statusText})`)
  })
}

/**
 *
 */
function getConfig () {
  return { ...getWskProps(), ...config.get('runtime') }
}

/**
 * Wrapper for cli.prompt because cli.confirm does not support options
 *
 * @param {*} message The message to output
 * @param {*} options cli.prompt options
 */
async function confirm (message, options) {
  try {
    options = options || { required: false, timeout: 20000, default: 'n' }
    let response = await cli.prompt(`${message} (y/n)`, options)

    if (['n', 'no'].includes(response)) return false
    if (['y', 'yes'].includes(response)) return true
  } catch (e) { }
  return false
}

module.exports = {
  confirm,
  getOrgs,
  getOrgsUrl,
  getWskPropsFilePath,
  getApiKey,
  getNamespaceUrl,
  getIntegrations,
  getIMSOrgId,
  getWskProps,
  getIntegration,
  getConfig
}
