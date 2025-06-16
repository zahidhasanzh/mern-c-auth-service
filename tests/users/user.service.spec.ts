import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { User } from '../../src/entity/User'
import { UserService } from '../../src/services/userService'
import { Roles } from '../../src/constants'
import { UserQueryParams } from '../../src/types'

describe('UserService.getAll', () => {
    let connection: DataSource
    let userService: UserService

    beforeAll(async () => {
        connection = await AppDataSource.initialize()
        userService = new UserService(connection.getRepository(User))
    })

    beforeEach(async () => {
        await connection.synchronize(true) // reset DB
    })

    afterAll(async () => {
        await connection.destroy()
    })

    it('returns users with pagination (6 per page)', async () => {
        // Add 8 users
        const usersData: User[] = []

        for (let i = 1; i <= 8; i++) {
            usersData.push({
                firstName: `User${i}`,
                lastName: 'Test',
                email: `user${i}@example.com`,
                password: 'pass',
                role: Roles.CUSTOMER,
            } as User)
        }
        await connection.getRepository(User).save(usersData)

        const params: UserQueryParams = {
            currentPage: 2,
            perPage: 6,
            q: '',
            role: '',
        }

        const [users, count] = await userService.getAll(params)

        expect(count).toBe(8)
        expect(users).toHaveLength(2)
    })

    it('filters users by search query', async () => {
        await connection.getRepository(User).save([
            {
                firstName: 'Alice',
                lastName: 'Wonder',
                email: 'alice@example.com',
                password: 'pass',
                role: Roles.CUSTOMER,
            },
            {
                firstName: 'Bob',
                lastName: 'Builder',
                email: 'bob@example.com',
                password: 'pass',
                role: Roles.CUSTOMER,
            },
        ])

        const params: UserQueryParams = {
            q: 'Alice',
            role: Roles.CUSTOMER,
            currentPage: 1,
            perPage: 6,
        }

        const [users, count] = await userService.getAll(params)

        expect(count).toBe(1)
        expect(users[0].firstName).toBe('Alice')
    })

    it('filters users by role', async () => {
        await connection.getRepository(User).save([
            {
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@example.com',
                password: 'pass',
                role: Roles.ADMIN,
            },
            {
                firstName: 'Normal',
                lastName: 'User',
                email: 'normal@example.com',
                password: 'pass',
                role: Roles.CUSTOMER,
            },
        ])

        const params = {
            q: '',
            role: Roles.ADMIN,
            currentPage: 1,
            perPage: 6,
        }

        const [users, count] = await userService.getAll(params)

        expect(count).toBe(1)
        expect(users[0].role).toBe(Roles.ADMIN)
    })
})
