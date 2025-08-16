/**
 * 
 * This file defines the API routes for text classification operations.
 * It provides endpoints for:
 * - Sentiment analysis: POST /sentiment
 * - Language detection: POST /language
 * - Content categorization: POST /categorize
 * - Style classification: POST /style
 * 
 */

import { Router } from "express";
import { TextClassificationController } from "../controllers/text-classification.controller.js";

const router = Router();
const textClassificationController = new TextClassificationController();

router.post("/simple-classification", textClassificationController.simpleClassification.bind(textClassificationController));

export default router;
