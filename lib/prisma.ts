import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

export const prisma: PrismaClient = global.__prisma__ ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.__prisma__ = prisma;

export async function getItemsPrisma() {
  return prisma.inventoryItem.findMany({ orderBy: { created_at: 'desc' } });
}

export async function createItemPrisma(payload: any) {
  return prisma.inventoryItem.create({ data: payload });
}

export async function deleteItemPrisma(id: number | string) {
  return prisma.inventoryItem.delete({ where: { id: Number(id) } });
}

export async function findBySKUPrisma(sku: string) {
  return prisma.inventoryItem.findUnique({ where: { qr_code: sku } });
}

export async function getUsersPrisma() {
  return prisma.user.findMany();
}

export async function createUserPrisma(data: any) {
  return prisma.user.create({ data });
}
