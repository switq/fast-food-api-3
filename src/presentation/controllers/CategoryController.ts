import { IDatabaseConnection } from "@infra-interfaces/IDbConnection";
import { CategoryGateway } from "../gateways/CategoryGateway";
import CategoryUseCases from "@usecases/CategoryUseCases";
import CategoryPresenter from "@presenters/CategoryPresenter";

class CategoryController {
  static async createCategory(
    name: string,
    description: string,
    dbConnection: IDatabaseConnection
  ) {
    const gateway = new CategoryGateway(dbConnection);
    const category = await CategoryUseCases.createCategory(
      name,
      description,
      gateway
    );
    return CategoryPresenter.toJSON(category);
  }

  static async getCategoryById(id: string, dbConnection: IDatabaseConnection) {
    const gateway = new CategoryGateway(dbConnection);
    const category = await CategoryUseCases.findCategoryById(id, gateway);
    return CategoryPresenter.toJSON(category);
  }

  static async getCategoryByName(
    name: string,
    dbConnection: IDatabaseConnection
  ) {
    const gateway = new CategoryGateway(dbConnection);
    const category = await CategoryUseCases.findCategoryByName(name, gateway);
    return CategoryPresenter.toJSON(category);
  }

  static async getAllCategories(dbConnection: IDatabaseConnection) {
    const gateway = new CategoryGateway(dbConnection);
    const categories = await CategoryUseCases.findAllCategories(gateway);
    return CategoryPresenter.toJSONArray(categories);
  }

  static async updateCategory(
    id: string,
    name: string | undefined,
    description: string | undefined,
    dbConnection: IDatabaseConnection
  ) {
    const gateway = new CategoryGateway(dbConnection);
    const category = await CategoryUseCases.updateCategory(
      id,
      name,
      description,
      gateway
    );
    return CategoryPresenter.toJSON(category);
  }

  static async deleteCategoryById(
    id: string,
    dbConnection: IDatabaseConnection
  ) {
    const gateway = new CategoryGateway(dbConnection);
    await CategoryUseCases.deleteCategory(id, gateway);
    return { message: "Category deleted successfully" };
  }
}

export default CategoryController;
