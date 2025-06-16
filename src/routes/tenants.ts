import express, {
    Request,
    Response,
    NextFunction,
    RequestHandler,
} from 'express'
import { TenantController } from '../controllers/tenantsControllers'
import { TenantService } from '../services/TenantService'
import { Tenant } from '../entity/Tenant'
import { AppDataSource } from '../config/data-source'
import logger from '../config/logger'
import authenticate from '../middlewares/authenticate'
import { canAccess } from '../middlewares/canAccess'
import { Roles } from '../constants'
import tenantValidator from '../validators/tenant-validator'
import { CreateTenantRequest } from '../types'
import listTenantsValidator from '../validators/list-tenants-validator'

const router = express.Router()

const tenantRepository = AppDataSource.getRepository(Tenant)
const tennantService = new TenantService(tenantRepository)
const tenantController = new TenantController(tennantService, logger)

router.post('/', authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
    tenantController.create(req, res, next),
)
router.patch(
    '/:id',
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    tenantValidator,
    (req: CreateTenantRequest, res: Response, next: NextFunction) =>
        tenantController.update(req, res, next) as unknown as RequestHandler,
)
router.get(
    '/',
    listTenantsValidator,
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.getAll(req, res, next) as unknown as RequestHandler,
)
router.get(
    '/:id',
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req, res, next) =>
        tenantController.getOne(req, res, next) as unknown as RequestHandler,
)
router.delete(
    '/:id',
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req, res, next) =>
        tenantController.destroy(req, res, next) as unknown as RequestHandler,
)

export default router
