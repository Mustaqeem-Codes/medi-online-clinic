// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

// Protect routes - verify token and attach user to request
const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Not authorized to access this route' 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      error: 'Not authorized' 
    });
  }
};

// Role-based authorization middleware (optional, for later use)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized for this role' 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };