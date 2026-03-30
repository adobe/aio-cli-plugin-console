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

const mockProject = {
  id: '9999',
  name: 'myproject',
  title: 'My Project'
}

const mockWorkspace = {
  id: '1000000001',
  name: 'TestWorkspace',
  title: 'Test Workspace',
  enabled: 1
}

const mockConsoleCLIInstance = {
  getProjects: jest.fn().mockResolvedValue([mockProject]),
  getWorkspaces: jest.fn().mockResolvedValue([]),
  createWorkspace: jest.fn().mockResolvedValue(mockWorkspace)
}

jest.mock('@adobe/aio-cli-lib-console', () => ({
  init: jest.fn().mockResolvedValue(mockConsoleCLIInstance),
  cleanStdOut: jest.fn()
}))

const TheCommand = require('../../../../src/commands/console/workspace/create')

describe('console:workspace:create', () => {
  let command

  beforeEach(() => {
    command = new TheCommand()
    mockConsoleCLIInstance.createWorkspace.mockReset()
    mockConsoleCLIInstance.createWorkspace.mockResolvedValue(mockWorkspace)
    mockConsoleCLIInstance.getWorkspaces.mockReset()
    mockConsoleCLIInstance.getWorkspaces.mockResolvedValue([])
    mockConsoleCLIInstance.getProjects.mockReset()
    mockConsoleCLIInstance.getProjects.mockResolvedValue([mockProject])
  })

  afterEach(() => {
    command = null
  })

  it('should create a workspace', async () => {
    command.argv = ['--name', 'testworkspace', '--title', 'Test Workspace', '--projectName', 'myproject', '--orgId', '1234567890']
    const result = await command.run()
    expect(mockConsoleCLIInstance.getProjects).toHaveBeenCalledWith('1234567890')
    expect(mockConsoleCLIInstance.createWorkspace).toHaveBeenCalledWith('1234567890', '9999', {
      name: 'testworkspace',
      title: 'Test Workspace'
    })
    expect(result).toEqual(mockWorkspace)
  })

  it('should output JSON when --json is used', async () => {
    const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true)
    const stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true)

    try {
      command.argv = ['--name', 'testworkspace', '--title', 'Test Workspace', '--projectName', 'myproject', '--orgId', '1234567890', '--json']
      await command.run()

      const stdout = stdoutSpy.mock.calls.map(args => args[0]).join('')
      const stderr = stderrSpy.mock.calls.map(args => args[0]).join('')

      expect(stderr).toBe('')
      let parsed
      expect(() => { parsed = JSON.parse(stdout) }).not.toThrow()
      expect(parsed).toMatchObject(mockWorkspace)
    } finally {
      stdoutSpy.mockRestore()
      stderrSpy.mockRestore()
    }
  })

  it('should output YAML when --yml is used', async () => {
    const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true)
    const stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true)

    try {
      command.argv = ['--name', 'testworkspace', '--title', 'Test Workspace', '--projectName', 'myproject', '--orgId', '1234567890', '--yml']
      await command.run()

      const stdout = stdoutSpy.mock.calls.map(args => args[0]).join('')
      const stderr = stderrSpy.mock.calls.map(args => args[0]).join('')

      expect(stderr).toBe('')
      expect(stdout).toContain('id:')
      expect(stdout).toContain('name:')
      expect(stdout).toContain('title:')
      expect(stdout).toContain('Test Workspace')
      expect(stdout).toContain('TestWorkspace')
    } finally {
      stdoutSpy.mockRestore()
      stderrSpy.mockRestore()
    }
  })
  it('should not create a workspace if the name is not provided', async () => {
    command.argv = ['--projectName', 'myproject', '--orgId', '1234567890']
    await expect(command.run()).rejects.toThrow('Missing required flag name')
    expect(mockConsoleCLIInstance.createWorkspace).not.toHaveBeenCalled()
  })

  it('should not create a workspace if the projectName is not provided', async () => {
    command.argv = ['--name', 'testworkspace', '--orgId', '1234567890']
    await expect(command.run()).rejects.toThrow('Missing required flag projectName')
    expect(mockConsoleCLIInstance.createWorkspace).not.toHaveBeenCalled()
  })

  it('should not create a workspace if the orgId is not provided and no config', async () => {
    command.argv = ['--name', 'testworkspace', '--projectName', 'myproject']
    command.getConfig = jest.fn().mockReturnValue(null)
    await expect(command.run()).rejects.toThrow('You have not selected an Organization. Please select first.')
    expect(mockConsoleCLIInstance.createWorkspace).not.toHaveBeenCalled()
  })

  it('should use config org.id if orgId flag is not provided', async () => {
    command.argv = ['--name', 'testworkspace', '--title', 'Test Workspace', '--projectName', 'myproject']
    command.getConfig = jest.fn().mockImplementation(key => {
      if (key === 'org.id') return '0987654321'
      return null
    })
    const result = await command.run()
    expect(mockConsoleCLIInstance.getProjects).toHaveBeenCalledWith('0987654321')
    expect(mockConsoleCLIInstance.createWorkspace).toHaveBeenCalledWith('0987654321', '9999', {
      name: 'testworkspace',
      title: 'Test Workspace'
    })
    expect(result).toEqual(mockWorkspace)
  })

  it('should resolve project by title', async () => {
    command.argv = ['--name', 'testworkspace', '--projectName', 'My Project', '--orgId', '1234567890']
    const result = await command.run()
    expect(mockConsoleCLIInstance.getProjects).toHaveBeenCalledWith('1234567890')
    expect(mockConsoleCLIInstance.createWorkspace).toHaveBeenCalledWith('1234567890', '9999', {
      name: 'testworkspace',
      title: 'testworkspace'
    })
    expect(result).toEqual(mockWorkspace)
  })

  it('should error if the project name is not found', async () => {
    mockConsoleCLIInstance.getProjects.mockResolvedValue([])
    command.argv = ['--name', 'testworkspace', '--projectName', 'nonexistent', '--orgId', '1234567890']
    await expect(command.run()).rejects.toThrow('Project nonexistent not found in the Organization.')
    expect(mockConsoleCLIInstance.createWorkspace).not.toHaveBeenCalled()
  })

  it('should not create a workspace if the name is already in use', async () => {
    mockConsoleCLIInstance.getWorkspaces.mockResolvedValue([mockWorkspace])
    command.argv = ['--name', 'TestWorkspace', '--projectName', 'myproject', '--orgId', '1234567890']
    await expect(command.run()).rejects.toThrow('Workspace TestWorkspace already exists. Please choose a different name.')
    expect(mockConsoleCLIInstance.createWorkspace).not.toHaveBeenCalled()
  })

  it('should use name as title if no title is provided', async () => {
    command.argv = ['--name', 'testworkspace', '--projectName', 'myproject', '--orgId', '1234567890']
    const result = await command.run()
    expect(mockConsoleCLIInstance.createWorkspace).toHaveBeenCalledWith('1234567890', '9999', {
      name: 'testworkspace',
      title: 'testworkspace'
    })
    expect(result).toEqual(mockWorkspace)
  })

  it('should not create a workspace if the name is invalid', async () => {
    command.argv = ['--name', 'test-workspace!', '--projectName', 'myproject', '--orgId', '1234567890']
    await expect(command.run()).rejects.toThrow('Workspace name test-workspace! is invalid. It should only contain alphanumeric values.')
    expect(mockConsoleCLIInstance.createWorkspace).not.toHaveBeenCalled()
  })

  it('should not create a workspace if the title is invalid', async () => {
    command.argv = ['--name', 'testworkspace', '--title', 'Test Workspace!', '--projectName', 'myproject', '--orgId', '1234567890']
    await expect(command.run()).rejects.toThrow('Workspace title Test Workspace! is invalid. It should only contain alphanumeric characters and spaces.')
    expect(mockConsoleCLIInstance.createWorkspace).not.toHaveBeenCalled()
  })

  it('should not create a workspace if the name is too short', async () => {
    command.argv = ['--name', 'ab', '--projectName', 'myproject', '--orgId', '1234567890']
    await expect(command.run()).rejects.toThrow('Workspace name must be between 3 and 45 characters long.')
    expect(mockConsoleCLIInstance.createWorkspace).not.toHaveBeenCalled()
  })

  it('should not create a workspace if the name is too long', async () => {
    command.argv = ['--name', 'testworkspace'.repeat(50), '--projectName', 'myproject', '--orgId', '1234567890']
    await expect(command.run()).rejects.toThrow('Workspace name must be between 3 and 45 characters long.')
    expect(mockConsoleCLIInstance.createWorkspace).not.toHaveBeenCalled()
  })

  it('should not create a workspace if the title is too short', async () => {
    command.argv = ['--name', 'testworkspace', '--title', 'ab', '--projectName', 'myproject', '--orgId', '1234567890']
    await expect(command.run()).rejects.toThrow('Workspace title must be between 3 and 45 characters long.')
    expect(mockConsoleCLIInstance.createWorkspace).not.toHaveBeenCalled()
  })

  it('should not create a workspace if the title is too long', async () => {
    command.argv = ['--name', 'testworkspace', '--title', 'Test Workspace'.repeat(50), '--projectName', 'myproject', '--orgId', '1234567890']
    await expect(command.run()).rejects.toThrow('Workspace title must be between 3 and 45 characters long.')
    expect(mockConsoleCLIInstance.createWorkspace).not.toHaveBeenCalled()
  })
})
