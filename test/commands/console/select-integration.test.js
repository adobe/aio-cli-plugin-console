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

const Config = require('@adobe/aio-cli-plugin-config')
const SelectIntegrationCommand = require('../../../src/commands/console/select-integration')
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

test('select-integration - no args', async () => {
  expect.assertions(2)

  let runResult = SelectIntegrationCommand.run([])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('missing expected integration identifier.'))
})

test('select-integration - bad args', async () => {
  expect.assertions(2)

  let runResult = SelectIntegrationCommand.run(['7'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('integration identifier does not appear to be valid.'))
})

test('select-integration - console_get_namespaces_url, does not end with forward slash', async () => {
  jest.mock('fs')

  jest.spyOn(Config, 'get')
  .mockImplementation(key => {
    if (key === 'jwt-auth') {
      return '{"client_id":1234,"console_get_namespaces_url":"http://foo.bar"}'
    }
  })

  let rp = require('request-promise-native')
  rp.mockImplementation(() => Promise.resolve({name: 'Basil', auth: '======'}))

  expect.assertions(2)

  let runResult = SelectIntegrationCommand.run(['5_5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).resolves.toEqual({name: 'Basil', auth: '======'})
})

test('select-integration - mock success', async () => {
  jest.mock('fs')

  jest.spyOn(Config, 'get')
  .mockImplementation(key => {
    if (key === 'jwt-auth') {
      return '{"client_id":1234,"console_get_namespaces_url":"http://foo.bar/"}'
    }
  })

  let rp = require('request-promise-native')
  rp.mockImplementation(() => Promise.resolve({name: 'Basil', auth: '======'}))

  expect.assertions(2)

  let runResult = SelectIntegrationCommand.run(['5_5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).resolves.toEqual({name: 'Basil', auth: '======'})
})

test('select-integration - config error', async () => {
  jest.mock('fs')

  jest.spyOn(Config, 'get')
  .mockImplementation(key => {
    if (key === 'jwt-auth') {
      return '{"not_client_id": "1234"}'
    }
  })

  expect.assertions(2)

  let runResult = SelectIntegrationCommand.run(['5_5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('missing config data: console_get_namespaces_url'))
})
