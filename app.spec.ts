import app from './src/app'
import { calculateDiscount } from './src/utils'
import request from 'supertest'

describe.skip('App', () => {
    it('should return correct discount amount', () => {
        const discount = calculateDiscount(100, 10)
        expect(discount).toBe(10)
    })

    it('should return 200 status code', async () => {
        const response = await request(app).get('/').send()
        expect(response.statusCode).toBe(200)
    })
})
