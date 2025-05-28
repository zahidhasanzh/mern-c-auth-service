import { DataSource } from 'typeorm'
import request from 'supertest'
import { AppDataSource } from '../../src/config/data-source'
import app from '../../src/app'
import { Tenant } from '../../src/entity/Tenant'

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
                address: 'Tenant Address',
            }

            const response = await request(app)
                .post('/tenants')
                .send(TenantData)

            expect(response.statusCode).toBe(201)
        })

        it('should create a tenant in the database', async () => {
            const TenantData = {
                name: 'Tenant Name',
                address: 'Tenant Address',
            }
            await request(app).post('/tenants').send(TenantData)

            const tenantRepository = connection.getRepository(Tenant)
            const tenants = await tenantRepository.find()

            expect(tenants).toHaveLength(1)
            expect(tenants[0].name).toBe(TenantData.name)
            expect(tenants[0].address).toBe(TenantData.address)
        })
    })
})
