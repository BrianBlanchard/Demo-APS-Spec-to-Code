import { Request, Response, NextFunction } from 'express';
import { ICardService } from '../services/card.service';
import { CreateCardSchema } from '../dto/create-card.dto';

export class CardController {
  constructor(private cardService: ICardService) {}

  issueCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request body
      const validatedData = CreateCardSchema.parse(req.body);

      // Get user ID from auth middleware
      const userId = (req as any).userId || 'unknown';

      // Call service
      const card = await this.cardService.issueCard(validatedData, userId);

      // Set Location header
      res.setHeader('Location', `/api/v1/cards/${card.id}`);

      // Return 201 Created with card data
      res.status(201).json(card);
    } catch (error) {
      next(error);
    }
  };
}
