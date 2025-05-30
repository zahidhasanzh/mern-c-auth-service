import { DataSource } from 'typeorm'
import request from 'supertest'
import { AppDataSource } from '../../src/config/data-source'
import app from '../../src/app'
import { Tenant } from '../../src/entity/Tenant'
import createJWKSMock from 'mock-jwks'
import { Roles } from '../../src/constants'

describe('POST /tenants', () => {
    let connection: DataSource
    let jwks: ReturnType<typeof createJWKSMock>
    let adminToken: string

    beforeAll(async () => {
        connection = await AppDataSource.initialize()
        jwks = createJWKSMock('http://localhost:5501')
    })

    beforeEach(async () => {
        await connection.dropDatabase()
        await connection.synchronize()
        jwks.start()

        adminToken = jwks.token({
            sub: '1',
            role: Roles.ADMIN,
        })
    })

    // afterAll(async () => {
    //     await connection.destroy()
    // })
    afterEach(() => {
        jwks.stop()
    })

    afterAll(async () => {
        if (connection?.destroy) {
            await connection.destroy()
        }
    })

    describe('Given all fields', () => {
        it('should return a 201 status code', async () => {
            const TenantData = {
                name: 'Tenant Name',
                address: 'Tenant Address',
            }

            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(TenantData)

            expect(response.statusCode).toBe(201)
        })

        it('should create a tenant in the database', async () => {
            const TenantData = {
                name: 'Tenant Name',
                address: 'Tenant Address',
            }
            await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(TenantData)

            const tenantRepository = connection.getRepository(Tenant)
            const tenants = await tenantRepository.find()

            expect(tenants).toHaveLength(1)
            expect(tenants[0].name).toBe(TenantData.name)
            expect(tenants[0].address).toBe(TenantData.address)
        })

        it('should return 401 if user is not authenticated', async () => {
            const TenantData = {
                name: 'Tenant Name',
                address: 'Tenant Address',
            }

            const response = await request(app)
                .post('/tenants')
                .send(TenantData)
            expect(response.statusCode).toBe(401)

            const tenantRepository = connection.getRepository(Tenant)
            const tenants = await tenantRepository.find()

            expect(tenants).toHaveLength(0)
        })

        it('should return 403 if user is not admin', async () => {
            const managerToken = (adminToken = jwks.token({
                sub: '1',
                role: Roles.MANAGER,
            }))
            const TenantData = {
                name: 'Tenant Name',
                address: 'Tenant Address',
            }

            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${managerToken}`])
                .send(TenantData)

            expect(response.statusCode).toBe(403)

            const tenantRepository = connection.getRepository(Tenant)
            const tenants = await tenantRepository.find()

            expect(tenants).toHaveLength(0)
        })
    })
})
