import { prisma } from '../prisma.js';
import type { Prisma } from '../generated/prisma/client.js';

export type CreateUserInput = Pick<
  Prisma.UserUncheckedCreateInput,
  'id' | 'name' | 'email' | 'phone'
>;
export type UpdateUserInput = Partial<Pick<CreateUserInput, 'name' | 'email' | 'phone'>>;

export const UserQuery = {
  findAll() {
    return prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  createUser(userData: CreateUserInput) {
    return prisma.user.create({
      data: userData,
    });
  },

  update(id: string, data: UpdateUserInput) {
    return prisma.user.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.user.delete({ where: { id } });
  },
};

export default UserQuery;
