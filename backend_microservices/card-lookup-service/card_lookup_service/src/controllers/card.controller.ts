import { Request, Response, NextFunction } from 'express';
import { ICardService } from '../services/card.service';
import { getRequestContext } from '../middleware/trace-context.middleware';
import { UnauthorizedException } from '../exceptions/unauthorized.exception';

export class CardController {
  constructor(private readonly cardService: ICardService) {}

  async getCard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const context = getRequestContext();
      if (!context) {
        throw new UnauthorizedException('Request context not found');
      }

      const { cardNumber } = req.params;
      const includeAccount = req.query.includeAccount === 'true';
      const includeCustomer = req.query.includeCustomer === 'true';
      const includeTransactions = req.query.includeTransactions === 'true';

      const card = await this.cardService.getCardByNumber(
        cardNumber,
        context.userId,
        context.userRole,
        includeAccount,
        includeCustomer,
        includeTransactions
      );

      res.status(200).json(card);
    } catch (error) {
      next(error);
    }
  }
}
