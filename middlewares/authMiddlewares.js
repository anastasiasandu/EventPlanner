const jwt = require('jsonwebtoken');
const { prisma } = require('../prisma/connection');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401); // Unauthorized

  try {
    const decoded = jwt.verify(token, "3245d4b2cef8db37d893f54df31c42d7f936b109d397c5384334043d2765eb4c");
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.sendStatus(401); // Unauthorized
    }
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.sendStatus(403); // Forbidden
  }
};

module.exports = authenticateToken;
