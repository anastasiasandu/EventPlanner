const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createNotification = async (userId, message) => {
  return prisma.notification.create({
    data: {
      userId,
      message,
    },
  });
};

module.exports = { createNotification };
