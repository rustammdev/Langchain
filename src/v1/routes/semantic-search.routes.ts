/**
 * 
 * This file defines the API routes for semantic search operations.
 * It provides endpoints for:
 * - Document loading: POST /load-document
 * - Embeddings: POST /embeddings
 * - Vector store: POST /create-vector-store
 * - Search: POST /search
 * 
 */

import { Router } from "express";
import { SemanticSearchController } from "../controllers/semantic-search.controller.js";

const router = Router();
const semanticSearchController = new SemanticSearchController();

// Document loading
router.post("/load-document", semanticSearchController.loadDocument.bind(semanticSearchController));

// Embeddings
router.post("/embeddings", semanticSearchController.getEmbeddings.bind(semanticSearchController));

// Vector store
router.post("/create-vector-store", semanticSearchController.createVectorStore.bind(semanticSearchController));

// Search
router.post("/search", semanticSearchController.similaritySearch.bind(semanticSearchController));

// PDF operations
router.post("/load-pdf", semanticSearchController.loadPdfAndCreateVectorStore.bind(semanticSearchController));
router.post("/search-pdf", semanticSearchController.searchInPdf.bind(semanticSearchController));

export default router;
