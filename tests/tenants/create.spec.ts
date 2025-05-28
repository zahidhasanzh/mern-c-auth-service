import { DataSource } from 'typeorm'
import request from 'supertest'
import { AppDataSource } from '../../src/config/data-source'
import app from '../../src/app'

describe('POST /tenants', () => {
    let connection: DataSource

    beforeAll(async () => {
        connection = await AppDataSource.initialize()
    })

    beforeEach(async () => {
        await connection.dropDatabase()
        await connection.synchronize()
    })

    afterAll(async () => {
        await connection.destroy()
    })

    describe('Given all fields', () => {
        it('should return a 201 status code', async () => {
            const TenantData = {
                name: 'Tenant Name',
                tennats: 'Tennats Address',
            }

            const response = await request(app)
                .post('/tenants')
                .send(TenantData)

            expect(response.statusCode).toBe(201)
        })
    })
})
