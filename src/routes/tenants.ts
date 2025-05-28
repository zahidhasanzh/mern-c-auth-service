import express from 'express'
import { TenantController } from '../controllers/tenantsControllers'
import { TenantService } from '../services/TenantService'
import { Tenant } from '../entity/Tenant'
import { AppDataSource } from '../config/data-source'
import logger from '../config/logger'

const router = express.Router()

const tenantRepository = AppDataSource.getRepository(Tenant)
const tennantService = new TenantService(tenantRepository)
const tenantController = new TenantController(tennantService, logger)

router.post('/', (req, res, next) => tenantController.create(req, res, next))

export default router
