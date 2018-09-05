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

const rp = require('request-promise-native')
const path = require('path')
const Config = require('@adobe/aio-cli-plugin-config')
const {cli} = require('cli-ux')

function toJson(item) {
  let c = item
  if (typeof c === 'string') {
    c = JSON.parse(c)
  }

  return c
}

/**
 * @description Calls the server api to get a list of orgs
 * @param {string} accessToken a valid token from jwt-auth command
 * @param {Sting} apiKey a valid api_key for this api
 * @return {Promise} resolves with a list of orgs
 */
async function getOrgs(accessToken, apiKey) {
  const orgsUrl = await getOrgsUrl()

  const options = {
    uri: orgsUrl,
    method: 'GET',
    headers: {
      'X-Api-Key': apiKey,
      Authorization: `Bearer ${accessToken}`,
      accept: 'application/json',
    },
    json: true,
  }
  return rp(options)
}

/**
 * @description Returns the path to the users wskprops file, which can vary by OS, and
 *  can be overridden with an enviroment variable
 * @return {String} resolved path to wskprops file
 */
function getWskPropsFilePath() {
  if (process.env.WSK_CONFIG_FILE) {
    return path.resolve(process.env.WSK_CONFIG_FILE)
  }
  return path.resolve(require('os').homedir(), '.wskprops')
}

async function getApiKey() {
  const configStr = await Config.get('jwt-auth')
  if (!configStr) {
    return Promise.reject(new Error('missing config data: jwt-auth'))
  }

  const configData = toJson(configStr)
  if (!configData.client_id) {
    return Promise.reject(new Error('missing config data: client_id'))
  }
  return configData.client_id
}

async function getOrgsUrl() {
  const configStr = await Config.get('jwt-auth')
  if (!configStr) {
    return Promise.reject(new Error('missing config data: jwt-auth'))
  }

  const configData = toJson(configStr)
  if (!configData.console_get_orgs_url) {
    return Promise.reject(new Error('missing config data: console_get_orgs_url'))
  }
  return configData.console_get_orgs_url
}

async function getNamespaceUrl() {
  const configStr = await Config.get('jwt-auth')
  if (!configStr) {
    return Promise.reject(new Error('missing config data: jwt-auth'))
  }

  const configData = toJson(configStr)
  if (!configData.console_get_namespaces_url) {
    return Promise.reject(new Error('missing config data: console_get_namespaces_url'))
  }
  return configData.console_get_namespaces_url
}

/**
 * @description Calls the server api to get a list of integrations (by org)
 * @param {string} orgId organization to look in
 * @param {string} accessToken a valid token from jwt-auth command
 * @param {Sting} apiKey a valid api_key for this api
 * @return {Promise} resolves with a list of integrations
 */
async function getIntegrations(orgId, accessToken, apiKey, {pageNum = 1, pageSize = 20} = {}) {
  // server is zero based, we are 1 based
  const pg = (pageNum > 0) ? pageNum - 1 : 0
  // server chokes with pagesize greater than 50
  const sz = (pageSize < 51) ? pageSize : 50

  const orgsUrl = await getOrgsUrl()
  const options = {
    uri: `${orgsUrl}/${orgId}/integrations?page=${pg}&size=${sz}`,
    method: 'GET',
    headers: {
      'X-Api-Key': apiKey,
      Authorization: `Bearer ${accessToken}`,
      accept: 'application/json',
    },
    json: true,
  }
  return rp(options)
}

/**
 * Wrapper for cli.prompt because cli.confirm does not support options
 *
 * @param {*} message The message to output
 * @param {*} options cli.prompt options
 */
async function confirm(message, options) {
  try {
    options = options || {required: false, timeout: 20000, default: 'n'}
    let response = await cli.prompt(`${message} (y/n)`, options)

    if (['n', 'no'].includes(response)) return false
    if (['y', 'yes'].includes(response)) return true
    return false // default is false
  } catch (e) {
    return false
  }
}

module.exports = {
  confirm,
  getOrgs,
  getOrgsUrl,
  getWskPropsFilePath,
  getApiKey,
  getNamespaceUrl,
  getIntegrations,
}
