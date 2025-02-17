// middleware/branchMiddleware.js
exports.branchMiddleware = (req, res, next) => {
    // Get branchId from headers
    const branchId = req.headers['x-branch-id']; // Example: x-branch-id: 1
  
    if (!branchId) {
      // If branchId is missing, send an error response
      return res.status(400).json({ error: "Branch ID is required" });
    }
  
    // Add branchId to the request object
    req.branchId = branchId;
  
    // Move to the next middleware or route handler
    next();
  };
  
 
  