import { AppDataSource } from '../config/data-source'
import { User } from '../entity/User'
import { createAdminInit } from './createAdminInit'

jest.mock('../config/data-source.ts', () => ({
    AppDataSource: {
        getRepository: jest.fn(),
    },
}))

const mockFindOne = jest.fn()
const mockCreate = jest.fn()
const mockSave = jest.fn()

beforeEach(() => {
    jest.clearAllMocks()

    AppDataSource.getRepository = jest.fn().mockImplementation((entity) => {
        if (entity === User) {
            return {
                findOne: mockFindOne,
                create: mockCreate,
                save: mockSave,
            }
        }
    })

    process.env.ADMIN_EMAIL = 'admin@example.com'
    process.env.ADMIN_PASSWORD = 'securepassword'
})

test('should create admin user if not exists', async () => {
    mockFindOne.mockResolvedValueOnce(null) // No existing user
    mockCreate.mockReturnValue({ email: 'admin@example.com' })

    await createAdminInit()

    expect(mockCreate).toHaveBeenCalled()
    expect(mockSave).toHaveBeenCalled()
})

test('should skip creation if admin already exists', async () => {
    mockFindOne.mockResolvedValueOnce({ email: 'admin@example.com' })

    await createAdminInit()

    expect(mockCreate).not.toHaveBeenCalled()
    expect(mockSave).not.toHaveBeenCalled()
})

test('should log warning if env variables are missing', async () => {
    process.env.ADMIN_EMAIL = ''
    process.env.ADMIN_PASSWORD = ''

    await createAdminInit()
    expect(mockCreate).not.toHaveBeenCalled()
})
