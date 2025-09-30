import { IDatabaseConnection } from "@infra-interfaces/IDbConnection";
import { ICategoryRepository } from "@repositories/ICategoryRepository";
import Category from "@entities/Category";

interface CategoryData {
  id: string;
  name: string;
  description: string;
}

export class CategoryGateway implements ICategoryRepository {
  private readonly dbConnection: IDatabaseConnection;
  private readonly tableName: string = "category";

  constructor(dbConnection: IDatabaseConnection) {
    this.dbConnection = dbConnection;
  }

  async create(category: Category): Promise<Category> {
    const categoryData = category.toJSON();
    const createdCategory = await this.dbConnection.create<CategoryData>(
      this.tableName,
      categoryData
    );
    return new Category(
      createdCategory.id,
      createdCategory.name,
      createdCategory.description
    );
  }

  async findById(id: string): Promise<Category | null> {
    const category = await this.dbConnection.findById<CategoryData>(
      this.tableName,
      id
    );
    if (!category) {
      return null;
    }
    return new Category(category.id, category.name, category.description);
  }

  async findByName(name: string): Promise<Category | null> {
    const categories = await this.dbConnection.findByField<CategoryData>(
      this.tableName,
      "name",
      name
    );
    if (categories.length === 0) {
      return null;
    }
    const category = categories[0];
    return new Category(category.id, category.name, category.description);
  }

  async findAll(): Promise<Category[]> {
    const categories = await this.dbConnection.findAll<CategoryData>(
      this.tableName
    );
    return categories.map(
      (category) =>
        new Category(category.id, category.name, category.description)
    );
  }

  async update(category: Category): Promise<Category> {
    const categoryData = category.toJSON();
    const updatedCategory = await this.dbConnection.update<CategoryData>(
      this.tableName,
      category.id,
      categoryData
    );
    return new Category(
      updatedCategory.id,
      updatedCategory.name,
      updatedCategory.description
    );
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.dbConnection.delete(this.tableName, id);
    if (!deleted) {
      throw new Error(`Category with ID ${id} not found`);
    }
  }
}
