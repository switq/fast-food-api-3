import { PrismaClient } from "@prisma/client";
import { IDatabaseConnection } from "../../interfaces/IDbConnection";

type PrismaModelDelegate = {
  create: Function;
  findUnique: Function;
  findMany: Function;
  update: Function;
  delete: Function;
};

class PrismaDBConnection implements IDatabaseConnection {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async connect(): Promise<void> {
    await this.prisma.$connect();
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  private getModel(table: string): PrismaModelDelegate {
    const model = (this.prisma as any)[table];

    if (!model || typeof model.create !== "function") {
      throw new Error(`Model '${table}' not found in Prisma`);
    }

    return model as PrismaModelDelegate;
  }

  async create<T>(table: string, data: Omit<T, "id">): Promise<T> {
    const model = this.getModel(table);

    const result = await model.create({
      data: data,
    });

    return result as T;
  }

  async findById<T>(table: string, id: string): Promise<T | null> {
    const model = this.getModel(table);

    const result = await model.findUnique({
      where: { id },
    });

    return result as T | null;
  }

  async findByField<T>(table: string, field: string, value: any): Promise<T[]> {
    const model = this.getModel(table);

    const whereCondition: Record<string, any> = {};
    whereCondition[field] = value;

    const results = await model.findMany({
      where: whereCondition,
    });

    return results as T[];
  }

  async findAll<T>(table: string): Promise<T[]> {
    const model = this.getModel(table);

    const results = await model.findMany();
    return results as T[];
  }

  async findMany<T>(table: string, where?: Record<string, any>): Promise<T[]> {
    const model = this.getModel(table);

    const results = await model.findMany({
      where: where,
    });
    return results as T[];
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    const model = this.getModel(table);

    const result = await model.update({
      where: { id },
      data: data,
    });

    return result as T;
  }

  async delete(table: string, id: string): Promise<boolean> {
    try {
      const model = this.getModel(table);

      await model.delete({
        where: { id },
      });

      return true;
    } catch (error) {
      return false;
    }
  }
}

export default PrismaDBConnection;
