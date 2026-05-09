import { prisma } from '../prisma.js';

const UserQuery = () => {
  const findAllUsers = async () => {
    return await prisma.user.findMany();
  };

  return {
    findAllUsers,
  };
};

export default UserQuery;
