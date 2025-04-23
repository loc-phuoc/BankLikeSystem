export function errorHandler(err, req, res, next) {
    console.error('Global error:', err);
    
    if (res.headersSent) {
      return next(err);
    }
    
    res.status(500).json({
      error: 'An unexpected error occurred',
      message: err.message
    });
  }