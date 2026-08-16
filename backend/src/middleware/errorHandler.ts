import type { ErrorRequestHandler, RequestHandler } from "express";
export const notFound: RequestHandler = (req, res) => res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
export const errorHandler: ErrorRequestHandler = (_error, _req, res, _next) => { console.error('Unhandled application error'); res.status(500).json({ success: false, message: 'Internal server error' }); };
