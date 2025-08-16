/**
 * 
 * This controller handles HTTP requests related to text classification operations.
 * It provides endpoints for:
 * - Sentiment analysis
 * - Language detection
 * - Content categorization
 * - Style classification
 * 
 */

import { TextClassificationService } from "../services/text-classification.service.js";
import type { Request, Response } from "express";

export class TextClassificationController {
    private textClassificationService: TextClassificationService;

    constructor() {
        this.textClassificationService = new TextClassificationService();
    }

    /**
     * Simple classification
     */
    async simpleClassification(req: Request, res: Response) {
        const response = await this.textClassificationService.simpleClassification();
        return res.json(response);
    }
}
