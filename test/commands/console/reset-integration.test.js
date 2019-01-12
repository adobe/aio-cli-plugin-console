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

const fs = require('fs')
const Config = require('@adobe/aio-cli-plugin-config')
const ResetIntegrationCommand = require('../../../src/commands/console/reset-integration')
jest.mock('request-promise-native')

jest.mock('@adobe/aio-cli-plugin-jwt-auth', () => {
  return {
    accessToken: () => {
      return Promise.resolve('fake-token')
    },
  }
})

afterAll(() => {
  jest.resetAllMocks()
})

test('reset-integration - no args', async () => {
  expect.assertions(2)

  let runResult = ResetIntegrationCommand.run([])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('missing expected integration identifier.'))
})

test('reset-integration - bad args', async () => {
  expect.assertions(2)

  let runResult = ResetIntegrationCommand.run(['7'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('integration identifier does not appear to be valid.'))
})

test('reset-integration - console_get_namespaces_url, does not end with forward slash', async () => {
  fs.writeFileSync = jest.fn()
  fs.existsSync = jest.fn()
  fs.existsSync.mockReturnValue(false)

  jest.spyOn(Config, 'get')
  .mockImplementation(key => {
    if (key === 'jwt-auth') {
      return '{"client_id":1234,"console_get_namespaces_url":"http://foo.bar","jwt_payload": {"iss":"asd"}}'
    }
  })

  let rp = require('request-promise-native')
  rp.mockImplementation(() => Promise.resolve({name: 'Basil', auth: '======'}))

  expect.assertions(2)

  let runResult = ResetIntegrationCommand.run(['5_5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).resolves.toEqual({name: 'Basil', auth: '======'})
})

test('reset-integration - mock success', async () => {
  fs.writeFileSync = jest.fn()
  fs.existsSync = jest.fn()
  fs.existsSync.mockReturnValue(true)

  jest.spyOn(Config, 'get')
  .mockImplementation(key => {
    if (key === 'jwt-auth') {
      return '{"client_id":1234,"console_get_namespaces_url":"http://foo.bar/","jwt_payload": {"iss":"asd"}}'
    }
  })

  let rp = require('request-promise-native')
  rp.mockImplementation(opts => {
    expect(opts.headers['x-ims-org-id']).toEqual('asd')
    return Promise.resolve({name: 'Basil', auth: '======'})
  })

  expect.assertions(4)

  let runResult = ResetIntegrationCommand.run(['5_5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).resolves.toEqual({name: 'Basil', auth: '======'})
  expect(rp).toHaveBeenCalled()
})

test('reset-integration - config error', async () => {
  fs.writeFileSync = jest.fn()
  fs.existsSync = jest.fn()
  fs.existsSync.mockReturnValue(true)

  jest.spyOn(Config, 'get')
  .mockImplementation(key => {
    if (key === 'jwt-auth') {
      return '{"not_client_id": "1234"}'
    }
  })

  expect.assertions(2)

  let runResult = ResetIntegrationCommand.run(['5_5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('missing config data: console_get_namespaces_url'))
})

test('reset-integration - config error missing jwt_payload', async () => {
  fs.writeFileSync = jest.fn()
  fs.existsSync = jest.fn()
  fs.existsSync.mockReturnValue(true)

  jest.spyOn(Config, 'get')
  .mockImplementation(key => {
    if (key === 'jwt-auth') {
      return '{"client_id": "1234","console_get_namespaces_url":"http://foo.bar/"}'
    }
  })

  expect.assertions(2)

  let runResult = ResetIntegrationCommand.run(['5_5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('missing config data: jwt_payload'))
})

test('reset-integration - config error missing jwt_payload pre-condition', async () => {
  fs.writeFileSync = jest.fn()
  fs.existsSync = jest.fn()
  fs.existsSync.mockReturnValue(true)

  let goodValue = '{"client_id":1234,"console_get_namespaces_url":"http://foo.bar/"}'
  // first mock is for getNamespaceUrl
  // second mock is for getAccessToken
  // third mock we want to fail so we can get full test coverage
  jest.spyOn(Config, 'get')
  .mockImplementationOnce(key => {
    if (key === 'jwt-auth') {
      return goodValue
    }
  })
  .mockImplementationOnce(key => {
    if (key === 'jwt-auth') {
      return goodValue
    }
  })
  .mockImplementationOnce(() => {})

  expect.assertions(2)

  let runResult = ResetIntegrationCommand.run(['5_5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('missing config data: jwt-auth'))
})

test('reset-integration - config error missing jwt_payload.iss', async () => {
  fs.writeFileSync = jest.fn()
  fs.existsSync = jest.fn()
  fs.existsSync.mockReturnValue(true)

  jest.spyOn(Config, 'get')
  .mockImplementation(key => {
    if (key === 'jwt-auth') {
      return '{"client_id": "1234","console_get_namespaces_url":"http://foo.bar/","jwt_payload":{}}'
    }
  })

  expect.assertions(2)

  let runResult = ResetIntegrationCommand.run(['5_5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('missing config data: jwt_payload.iss'))
})
