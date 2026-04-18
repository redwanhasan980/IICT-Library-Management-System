import { NextFunction, Request, Response } from 'express';
import * as spineLabelService from '../services/spineLabel.service';
import { GenerateSpineLabelInput } from '../validators/spineLabel.validator';

export const generateSpineLabel = async (
  req: Request<{}, {}, GenerateSpineLabelInput['body']>,
  res: Response,
  next: NextFunction
) => {
  try {
    const labelData = spineLabelService.prepareLabelData(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        label: labelData,
      },
    });
  } catch (error) {
    next(error);
  }
};
