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

let mockResult
jest.mock('node-fetch', () => jest.fn().mockImplementation(() => mockResult))

const fs = require('fs')
const path = require('path')
const config = require('@adobe/aio-cna-core-config')
const { consumeResponseJson, getApiKey, getIntegrations, getOrgs, getOrgsUrl, getIntegration, getWskProps, getConfig, getWskPropsFilePath, getNamespaceUrl, getIMSOrgId } = require('../src/console-helpers')

beforeEach(() => {
  jest.restoreAllMocks()
  mockResult = Promise.resolve({
    ok: true,
    json: () => Promise.resolve({})
  })
})

test('consumeResponseJson', async () => {
  let response = { ok: true, text: () => '{ "foo": "bar" }' }
  let json = await consumeResponseJson(response)
  expect(json).toEqual({ foo: 'bar' })

  response = { ok: true }
  json = await consumeResponseJson(response)
  expect(json).toEqual({})

  response = {}
  json = await consumeResponseJson(response)
  expect(json).toEqual({})
})

test('getWskPropsFilePath', () => {
  const wskpath = path.resolve(require('os').homedir(), '.wskprops')

  process.env.WSK_CONFIG_FILE = path.resolve('/my/path/.wskprops')
  expect(getWskPropsFilePath()).toEqual(process.env.WSK_CONFIG_FILE)

  delete process.env.WSK_CONFIG_FILE
  expect(getWskPropsFilePath()).toEqual(wskpath)
})

test('getOrgs', async () => {
  expect.assertions(4)

  // no jwt-auth key
  config.get.mockImplementation(() => null)
  await expect(getOrgs('x', 'y')).rejects.toEqual(new Error('missing config data: jwt-auth'))

  // jwt-auth available
  config.get.mockImplementation(() => { return {} })
  await expect(getOrgs('x', 'y')).resolves.toEqual({})

  // jwt-auth, console_get_orgs_url available
  config.get.mockImplementation(() => {
    return {
      console_get_orgs_url: 'http://foo.bar'
    }
  })

  await expect(getOrgs('x', 'y')).resolves.toEqual({})

  mockResult = Promise.resolve({ ok: false, status: 404, statusText: 'Not Found' })
  await expect(getOrgs('x', 'y')).rejects.toEqual(new Error('Cannot retrieve organizations: http://foo.bar (404 Not Found)'))
})

test('getOrgsUrl', async () => {
  expect.assertions(3)

  // no jwt-auth key
  config.get.mockImplementation(() => null)
  await expect(getOrgsUrl()).rejects.toEqual(new Error('missing config data: jwt-auth'))

  // jwt-auth available
  config.get.mockImplementation(() => { return {} })
  await expect(getOrgsUrl('x', 'y')).resolves.toEqual('https://api.adobe.io/console/organizations')

  // jwt-auth available
  config.get.mockImplementation(() => { return { console_get_orgs_url: 'http://foo.bar' } })
  await expect(getOrgsUrl('x', 'y')).resolves.toEqual('http://foo.bar')
})

test('getNamespaceUrl', async () => {
  expect.assertions(3)

  // no jwt-auth key
  config.get.mockImplementation(() => null)
  await expect(getNamespaceUrl()).rejects.toEqual(new Error('missing config data: jwt-auth'))

  config.get.mockImplementation(() => { return {} })
  await expect(getNamespaceUrl('x', 'y')).resolves.toEqual('https://api.adobe.io/runtime/admin/namespaces/')

  // jwt-auth available
  config.get.mockImplementation(() => { return { console_get_namespaces_url: 'http://foo.bar' } })
  await expect(getNamespaceUrl('x', 'y')).resolves.toEqual('http://foo.bar')
})

test('getApiKey', async () => {
  expect.assertions(3)

  // no jwt-auth key
  config.get.mockImplementation(() => null)
  await expect(getApiKey()).rejects.toEqual(new Error('missing config data: jwt-auth'))

  // jwt-auth available
  config.get.mockImplementation(() => { return {} })
  await expect(getApiKey()).rejects.toEqual(new Error('missing config data: client_id'))

  // jwt-auth, client_id available
  config.get.mockImplementation(() => { return { client_id: 1234 } })
  await expect(getApiKey()).resolves.toEqual(1234)
})

test('getIMSOrgId', async () => {
  expect.assertions(4)

  // no jwt-auth key
  config.get.mockImplementation(() => null)
  await expect(getIMSOrgId()).rejects.toEqual(new Error('missing config data: jwt-auth'))

  // jwt-auth available
  config.get.mockImplementation(() => { return {} })
  await expect(getIMSOrgId()).rejects.toEqual(new Error('missing config data: jwt_payload'))

  // jwt-auth available
  config.get.mockImplementation(() => { return { jwt_payload: {} } })
  await expect(getIMSOrgId()).rejects.toEqual(new Error('missing config data: jwt_payload.iss'))

  // jwt-auth, client_id available
  config.get.mockImplementation(() => { return { jwt_payload: { iss: 'adobe.com' } } })
  await expect(getIMSOrgId()).resolves.toEqual('adobe.com')
})

test('getIntegrations', async () => {
  config.get
    .mockImplementation(() => '{"client_id":1234, "console_get_orgs_url":"http://foo.bar"}')

  expect.assertions(3)

  await expect(getIntegrations('myOrg', 'myAccessToken', 'myApiKey')).resolves.toEqual({})
  await expect(getIntegrations('myOrg', 'myAccessToken', 'myApiKey', { pageNum: -1, pageSize: 51 })).resolves.toEqual({})

  mockResult = Promise.resolve({ ok: false, status: 404, statusText: 'Not Found' })
  await expect(getIntegrations('x', 'y')).rejects.toThrow('(404 Not Found)')
})

test('getIntegration', async () => {
  config.get
    .mockImplementation(() => '{"client_id":1234, "console_get_orgs_url":"http://foo.bar"}')

  mockResult = Promise.resolve({ ok: true,
    text: () => Promise.resolve('{"content": [{ "orgId": 111, "id": 222 }]}') })

  await expect(getIntegration('111_222', 'myAccessToken', 'myApiKey')).resolves.toMatchObject({ orgId: 111, id: 222 })
})

test('getIntegration - not found', async () => {
  config.get
    .mockImplementation(() => '{"client_id":1234, "console_get_orgs_url":"http://foo.bar"}')

  mockResult = Promise.resolve({ ok: false, status: 404, statusText: 'Not Found' })
  await expect(getIntegration('a_b', 'y')).rejects.toThrow('(404 Not Found)')
})

test('getConfig', async () => {
  config.get.mockImplementation(() => null)
  jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() => 'A=B')
  expect(getConfig()).toEqual({ a: 'B' })

  jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() => 'foo=12')
  config.get.mockImplementation(() => { return { foo: 'bar' } })
  expect(getConfig()).toEqual({ foo: 'bar' })
})

test('getWskProps', async () => {
  jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() => 'A=B')
  expect(getWskProps()).toEqual({ a: 'B' })

  jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() => 'a single line')
  expect(getWskProps()).toEqual({})

  jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() => 'A=B\n# a commend\nFOO=BAR     # a comment')
  expect(getWskProps()).toEqual({ a: 'B', foo: 'BAR' })

  jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() => { throw new Error('no file') })
  expect(getWskProps()).toEqual({})
})
