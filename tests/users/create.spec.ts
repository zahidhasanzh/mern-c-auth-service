import { DataSource } from 'typeorm'
import createJWKSMock from 'mock-jwks'
import request from 'supertest'
import { AppDataSource } from '../../src/config/data-source'
import app from '../../src/app'
import { Roles } from '../../src/constants'
import { User } from '../../src/entity/User'

describe('POST /users', () => {
    let connection: DataSource
    let jwks: ReturnType<typeof createJWKSMock>

    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:5501')
        connection = await AppDataSource.initialize()
    })

    beforeEach(async () => {
        jwks.start()
        await connection.dropDatabase()
        await connection.synchronize()
    })

    afterEach(() => {
        jwks.stop()
    })

    afterAll(async () => {
        await connection.destroy()
    })

    describe('Given all fields', () => {
        it('should persist the user in the database', async () => {
            const adminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })

            const userData = {
                firstName: 'Zahid',
                lastName: 'Hassan',
                email: 'zahid@mern.space',
                password: 'password',
                tenantId: 1,
            }

            //add token cookie
            await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(userData)

            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()

            expect(users).toHaveLength(1)
            expect(users[0].email).toBe(userData.email)
        })

        it('should create a manager user', async () => {
            const adminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })

            const userData = {
                firstName: 'Zahid',
                lastName: 'Hassan',
                email: 'zahid@mern.space',
                password: 'password',
                tenantId: 1,
            }

            //add token cookie
            await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(userData)

            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()

            expect(users).toHaveLength(1)
            expect(users[0].role).toBe(Roles.MANAGER)
        })

        it.todo('should return 403 if non admin tries to create a user')
    })
})
