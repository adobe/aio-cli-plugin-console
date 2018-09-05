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

jest.mock('request')
jest.mock('request-promise-native')

jest.setTimeout(10000)

const path = require('path')
const {confirm, getApiKey, getIntegrations, getOrgs, getOrgsUrl, getWskPropsFilePath, getNamespaceUrl} = require('../src/console-helpers')
const Config = require('@adobe/aio-cli-plugin-config')
const {cli} = require('cli-ux')

beforeEach(() => {
  jest.clearAllMocks()
  jest.resetAllMocks()
})

test('getWskPropsFilePath', () => {
  const wskpath = path.resolve(require('os').homedir(), '.wskprops')

  process.env.WSK_CONFIG_FILE = path.resolve('/my/path/.wskprops')
  expect(getWskPropsFilePath()).toEqual(process.env.WSK_CONFIG_FILE)

  delete process.env.WSK_CONFIG_FILE
  expect(getWskPropsFilePath()).toEqual(wskpath)
})

test('toJson coverage', async () => {
  expect.assertions(3)

  // no jwt-auth key
  jest.spyOn(Config, 'get').mockImplementation(() => null)
  await expect(getOrgs('x', 'y')).rejects.toEqual(new Error('missing config data: jwt-auth'))

  // jwt-auth available
  jest.spyOn(Config, 'get').mockImplementation(() => '{ "jwt-auth": {} }')
  await expect(getOrgs('x', 'y')).rejects.toEqual(new Error('missing config data: console_get_orgs_url'))

  // jwt-auth, console_get_orgs_url available
  jest.spyOn(Config, 'get').mockImplementation(k => {
    if (k === 'jwt-auth') {
      return {
        console_get_orgs_url: '...',
      }
    }
  })

  await expect(getOrgs('x', 'y')).resolves.toBeUndefined()
})

test('getOrgs', async () => {
  expect.assertions(3)

  // no jwt-auth key
  jest.spyOn(Config, 'get').mockImplementation(() => null)
  await expect(getOrgs('x', 'y')).rejects.toEqual(new Error('missing config data: jwt-auth'))

  // jwt-auth available
  jest.spyOn(Config, 'get').mockImplementation(() => '{ "jwt-auth": {} }')
  await expect(getOrgs('x', 'y')).rejects.toEqual(new Error('missing config data: console_get_orgs_url'))

  // jwt-auth, console_get_orgs_url available
  jest.spyOn(Config, 'get').mockImplementation(k => {
    if (k === 'jwt-auth') {
      return JSON.stringify({
        console_get_orgs_url: '...',
      })
    }
  })

  await expect(getOrgs('x', 'y')).resolves.toBeUndefined()
})

test('getOrgsUrl', async () => {
  expect.assertions(2)

  // no jwt-auth key
  jest.spyOn(Config, 'get').mockImplementation(() => null)
  await expect(getOrgsUrl()).rejects.toEqual(new Error('missing config data: jwt-auth'))

  // jwt-auth available
  jest.spyOn(Config, 'get').mockImplementation(() => '{ "jwt-auth": {} }')
  await expect(getOrgsUrl()).rejects.toEqual(new Error('missing config data: console_get_orgs_url'))
})

test('getNamespaceUrl', async () => {
  expect.assertions(3)

  // no jwt-auth key
  jest.spyOn(Config, 'get').mockImplementation(() => null)
  await expect(getNamespaceUrl()).rejects.toEqual(new Error('missing config data: jwt-auth'))

  // jwt-auth available
  jest.spyOn(Config, 'get').mockImplementation(() => '{ "jwt-auth": {} }')
  await expect(getNamespaceUrl()).rejects.toEqual(new Error('missing config data: console_get_namespaces_url'))

  // jwt-auth, console_get_namespaces_url available
  jest.spyOn(Config, 'get').mockImplementation(k => {
    if (k === 'jwt-auth') {
      return JSON.stringify({
        console_get_namespaces_url: '...',
      })
    }
  })
  await expect(getNamespaceUrl()).resolves.toEqual('...')
})

test('getApiKey', async () => {
  expect.assertions(3)

  // no jwt-auth key
  jest.spyOn(Config, 'get').mockImplementation(() => null)
  await expect(getApiKey()).rejects.toEqual(new Error('missing config data: jwt-auth'))

  // jwt-auth available
  jest.spyOn(Config, 'get').mockImplementation(() => '{ "jwt-auth": {} }')
  await expect(getApiKey()).rejects.toEqual(new Error('missing config data: client_id'))

  // jwt-auth, client_id available
  jest.spyOn(Config, 'get').mockImplementation(k => {
    if (k === 'jwt-auth') {
      return JSON.stringify({
        client_id: '...',
      })
    }
  })
  await expect(getApiKey()).resolves.toEqual('...')
})

test('getIntegrations', async () => {
  jest.spyOn(Config, 'get')
  .mockImplementation(() => '{"client_id":1234, "console_get_orgs_url":"http://foo.bar"}')

  expect.assertions(2)

  await expect(getIntegrations('myOrg', 'myAccessToken', 'myApiKey')).resolves.toBeUndefined()
  await expect(getIntegrations('myOrg', 'myAccessToken', 'myApiKey', {pageNum: -1, pageSize: 51})).resolves.toBeUndefined()
})

test('confirm', async () => {
  let confirmPromise = confirm('Require input?')
  process.stdin.emit('data', 'yes')
  let answer = await confirmPromise
  await cli.done()
  expect(answer).toBe(true)

  confirmPromise = confirm('Require input?')
  process.stdin.emit('data', 'no')
  answer = await confirmPromise
  await cli.done()
  expect(answer).toBe(false)

  confirmPromise = confirm('Require input?')
  process.stdin.emit('data', 'gibberish')
  answer = await confirmPromise
  await cli.done()
  expect(answer).toBe(false)
})
