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
const config = require('@adobe/aio-lib-core-config')
const debug = require('debug')('aio-cli-plugin-console')
const fs = require('fs')

/**
 * Response interceptor for logging purposes
 *
 * @param {string} url the url to fetch from
 * @param {object} options the options for fetch
* @return {object} the JSON response, if any
 */
async function consumeResponseJson (response) {
  debug('RESPONSE', response)
  let json = {}

  if (response.ok) {
    const text = (response.text instanceof Function) ? (await response.text()) : ''
    try {
      // try to parse
      json = JSON.parse(text)
      debug('DATA\n', JSON.stringify(json, null, 2))
    } catch (e) {
      debug('DATA\n', text)
    }
  }
  return json
}

/**
 * Convenience wrapper for fetch for logging purposes.
 *
 * @param {string} url the url to fetch from
 * @param {object} options the options for fetch
 */
async function fetchWrapper (url, options) {
  debug(`fetch: ${url}`)
  debug(`fetch options: ${JSON.stringify(options, null, 2)}`)
  return fetch(url, options)
}

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

  return fetchWrapper(orgsUrl, options).then(res => {
    if (res.ok) {
      return consumeResponseJson(res)
    } else {
      throw new Error(`Cannot retrieve organizations: ${orgsUrl} (${res.status} ${res.statusText})`)
    }
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

  return fetchWrapper(integrationsUrl, options).then(res => {
    if (res.ok) {
      return consumeResponseJson(res)
    } else {
      throw new Error(`Cannot retrieve integrations: ${integrationsUrl} (${res.status} ${res.statusText})`)
    }
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
  const [orgId, integration] = namespace.split('_').map(id => parseInt(id))
  const results = await getIntegrations(orgId, accessToken, apiKey)
  const result = results.content.find((elem) => {
    return (elem.orgId === orgId && elem.id === integration)
  })
  return result
}

/**
 *
 */
function getConfig () {
  return { ...getWskProps(), ...config.get('runtime') }
}

module.exports = {
  getOrgs,
  getOrgsUrl,
  getWskPropsFilePath,
  getApiKey,
  getNamespaceUrl,
  getIntegrations,
  getIMSOrgId,
  getWskProps,
  getIntegration,
  getConfig,
  fetchWrapper,
  consumeResponseJson
}
