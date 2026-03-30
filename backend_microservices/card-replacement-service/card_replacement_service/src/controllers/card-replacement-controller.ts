import { Request, Response, NextFunction } from 'express';
import { ICardReplacementService } from '../services/card-replacement-service';
import { CardReplacementRequest } from '../types/dtos';

export class CardReplacementController {
  constructor(private readonly cardReplacementService: ICardReplacementService) {}

  replaceCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { cardNumber } = req.params;
      const request = req.body as CardReplacementRequest;

      const response = await this.cardReplacementService.replaceCard(cardNumber, request);

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };
}
