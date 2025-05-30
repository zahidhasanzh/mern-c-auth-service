import { DataSource } from 'typeorm'
import createJWKSMock from 'mock-jwks'
import request from 'supertest'
import { AppDataSource } from '../../src/config/data-source'
import app from '../../src/app'
import { User } from '../../src/entity/User'
import { Roles } from '../../src/constants'

describe('GET /auth/self', () => {
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

    // afterAll(async () => {
    //     await connection.destroy()
    // })

    afterAll(async () => {
        if (connection?.destroy) {
            await connection.destroy()
        }
    })

    describe('Given all fields', () => {
        it('should return the 200 status code', async () => {
            const accessToken = jwks.token({
                sub: '1',
                role: Roles.CUSTOMER,
            })

            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send()
            expect(response.statusCode).toBe(200)
        })

        it('should return the user data', async () => {
            //Register user
            const userData = {
                firstName: 'Zahid',
                lastName: 'Hassan',
                email: 'zahid@mern.space',
                password: 'password',
            }
            const userRepository = connection.getRepository(User)
            const data = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            })
            //generate token
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            })
            //add token cookie

            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken};`])
                .send()

            //Assert
            // Check if user mathces with register
            expect((response.body as Record<string, string>).id).toBe(data.id)
        })

        it('should not return the password field', async () => {
            //Register user
            const userData = {
                firstName: 'Zahid',
                lastName: 'Hassan',
                email: 'zahid@mern.space',
                password: 'password',
            }
            const userRepository = connection.getRepository(User)
            const data = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            })
            //generate token
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            })
            //add token cookie

            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken};`])
                .send()

            //Assert
            // Check if user mathces with register

            expect(response.body as Record<string, string>).not.toHaveProperty(
                'password',
            )
        })

        it('should return 401 status code if token not exist', async () => {
            //Register user
            const userData = {
                firstName: 'Zahid',
                lastName: 'Hassan',
                email: 'zahid@mern.space',
                password: 'password',
            }
            const userRepository = connection.getRepository(User)
            await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            })

            //add token cookie

            const response = await request(app).get('/auth/self').send()

            //Assert
            expect(response.statusCode).toBe(401)
        })
    })
})
