import { NextFunction, Request, Response } from 'express';
import { Department, ProcurementStatus, ShelvingStatus } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import procurementService from '../services/procurement.service';
import { successResponse } from '../utils/apiResponse';

const requireActorId = (req: AuthenticatedRequest, res: Response) => {
  const actorId = req.user?.id;
  if (!actorId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return undefined;
  }

  return actorId;
};

class ProcurementController {
  async summary(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await procurementService.getSummary();
      return res.status(200).json(successResponse(result));
    } catch (error) {
      return next(error);
    }
  }

  async listApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await procurementService.listApplications({
        q: req.query.q as string | undefined,
        department: req.query.department as Department | undefined,
        budgetYear: req.query.budgetYear ? Number(req.query.budgetYear) : undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      });
      return res.status(200).json(successResponse(result));
    } catch (error) {
      return next(error);
    }
  }

  async createApplication(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = requireActorId(req, res);
      if (!actorId) {
        return undefined;
      }

      const result = await procurementService.createApplication(actorId, req.body);
      return res.status(201).json(successResponse(result, 'Procurement application created'));
    } catch (error) {
      return next(error);
    }
  }

  async updateApplication(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = requireActorId(req, res);
      if (!actorId) {
        return undefined;
      }

      const result = await procurementService.updateApplication(actorId, req.params.id, req.body);
      return res.status(200).json(successResponse(result, 'Procurement application updated'));
    } catch (error) {
      return next(error);
    }
  }

  async listRequisitions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await procurementService.listRequisitions({
        q: req.query.q as string | undefined,
        applicationId: req.query.applicationId as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      });
      return res.status(200).json(successResponse(result));
    } catch (error) {
      return next(error);
    }
  }

  async createRequisition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = requireActorId(req, res);
      if (!actorId) {
        return undefined;
      }

      const result = await procurementService.createRequisition(actorId, req.body);
      return res.status(201).json(successResponse(result, 'Book requisition created'));
    } catch (error) {
      return next(error);
    }
  }

  async updateRequisition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = requireActorId(req, res);
      if (!actorId) {
        return undefined;
      }

      const result = await procurementService.updateRequisition(actorId, req.params.id, req.body);
      return res.status(200).json(successResponse(result, 'Book requisition updated'));
    } catch (error) {
      return next(error);
    }
  }

  async listVendors(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await procurementService.listVendors({
        q: req.query.q as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      });
      return res.status(200).json(successResponse(result));
    } catch (error) {
      return next(error);
    }
  }

  async createVendor(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = requireActorId(req, res);
      if (!actorId) {
        return undefined;
      }

      const result = await procurementService.createVendor(actorId, req.body);
      return res.status(201).json(successResponse(result, 'Vendor created'));
    } catch (error) {
      return next(error);
    }
  }

  async updateVendor(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = requireActorId(req, res);
      if (!actorId) {
        return undefined;
      }

      const result = await procurementService.updateVendor(actorId, req.params.id, req.body);
      return res.status(200).json(successResponse(result, 'Vendor updated'));
    } catch (error) {
      return next(error);
    }
  }

  async listProcurements(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await procurementService.listProcurements({
        q: req.query.q as string | undefined,
        requisitionId: req.query.requisitionId as string | undefined,
        vendorId: req.query.vendorId as string | undefined,
        procurementStatus: req.query.procurementStatus as ProcurementStatus | undefined,
        shelvingStatus: req.query.shelvingStatus as ShelvingStatus | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      });
      return res.status(200).json(successResponse(result));
    } catch (error) {
      return next(error);
    }
  }

  async createProcurement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = requireActorId(req, res);
      if (!actorId) {
        return undefined;
      }

      const result = await procurementService.createProcurement(actorId, req.body);
      return res.status(201).json(successResponse(result, 'Procurement order created'));
    } catch (error) {
      return next(error);
    }
  }

  async updateProcurement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = requireActorId(req, res);
      if (!actorId) {
        return undefined;
      }

      const result = await procurementService.updateProcurement(actorId, req.params.id, req.body);
      return res.status(200).json(successResponse(result, 'Procurement order updated'));
    } catch (error) {
      return next(error);
    }
  }
}

export default new ProcurementController();
