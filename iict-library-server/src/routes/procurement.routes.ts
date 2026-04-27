import { Role } from '@prisma/client';
import { Router } from 'express';
import procurementController from '../controllers/procurement.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createApplicationSchema,
  createProcurementSchema,
  createRequisitionSchema,
  createVendorSchema,
  listApplicationsSchema,
  listProcurementsSchema,
  listRequisitionsSchema,
  listVendorsSchema,
  updateApplicationSchema,
  updateProcurementSchema,
  updateRequisitionSchema,
  updateVendorSchema,
} from '../validators/procurement.validator';

const router = Router();

router.use(protect);
router.use(restrictTo(Role.ADMIN));

router.get('/summary', procurementController.summary);

router.get('/applications', validate(listApplicationsSchema), procurementController.listApplications);
router.post('/applications', validate(createApplicationSchema), procurementController.createApplication);
router.put('/applications/:id', validate(updateApplicationSchema), procurementController.updateApplication);

router.get('/requisitions', validate(listRequisitionsSchema), procurementController.listRequisitions);
router.post('/requisitions', validate(createRequisitionSchema), procurementController.createRequisition);
router.put('/requisitions/:id', validate(updateRequisitionSchema), procurementController.updateRequisition);

router.get('/vendors', validate(listVendorsSchema), procurementController.listVendors);
router.post('/vendors', validate(createVendorSchema), procurementController.createVendor);
router.put('/vendors/:id', validate(updateVendorSchema), procurementController.updateVendor);

router.get('/orders', validate(listProcurementsSchema), procurementController.listProcurements);
router.post('/orders', validate(createProcurementSchema), procurementController.createProcurement);
router.put('/orders/:id', validate(updateProcurementSchema), procurementController.updateProcurement);

export default router;
