const jwt = require('jsonwebtoken');
const { prisma } = require('../prisma/connection');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth Header:', authHeader); // Log the authorization header
  console.log('Token:', token); // Log the token

  if (!token) return res.status(401).json({ details: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY || "3245d4b2cef8db37d893f54df31c42d7f936b109d397c5384334043d2765eb4c");
    console.log('Decoded Token:', decoded); // Log the decoded token

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ details: 'User not found' });
    }
    req.user = user;
    console.log('Authenticated user:', user); // Log the authenticated user
    next();
  } catch (err) {
    console.error(err);
    return res.status(403).json({ details: 'Forbidden' });
  }
};

module.exports = authenticateToken;
