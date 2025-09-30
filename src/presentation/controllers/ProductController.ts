import { IDatabaseConnection } from "@infra-interfaces/IDbConnection";
import { ProductGateway } from "../gateways/ProductGateway";
import { CategoryGateway } from "../gateways/CategoryGateway";
import ProductUseCases from "@usecases/ProductUseCases";
import ProductPresenter from "@presenters/ProductPresenter";

class ProductController {
  static async createProduct(
    name: string,
    description: string,
    price: number,
    categoryId: string,
    imageUrl: string | undefined,
    dbConnection: IDatabaseConnection
  ) {
    const productGateway = new ProductGateway(dbConnection);
    const categoryGateway = new CategoryGateway(dbConnection);
    const product = await ProductUseCases.createProduct(
      name,
      description,
      price,
      categoryId,
      imageUrl,
      productGateway,
      categoryGateway
    );
    return ProductPresenter.toJSON(product);
  }

  static async getProductById(id: string, dbConnection: IDatabaseConnection) {
    const productGateway = new ProductGateway(dbConnection);
    const product = await ProductUseCases.findProductById(id, productGateway);
    return ProductPresenter.toJSON(product);
  }

  static async getProductByName(
    name: string,
    dbConnection: IDatabaseConnection
  ) {
    const productGateway = new ProductGateway(dbConnection);
    const product = await ProductUseCases.findProductByName(
      name,
      productGateway
    );
    return ProductPresenter.toJSON(product);
  }

  static async getProductsByCategory(
    categoryId: string,
    dbConnection: IDatabaseConnection
  ) {
    const productGateway = new ProductGateway(dbConnection);
    const products = await ProductUseCases.findProductsByCategory(
      categoryId,
      productGateway
    );
    return ProductPresenter.toJSONArray(products);
  }

  static async getAllProducts(dbConnection: IDatabaseConnection) {
    const productGateway = new ProductGateway(dbConnection);
    const products = await ProductUseCases.findAllProducts(productGateway);
    return ProductPresenter.toJSONArray(products);
  }

  static async updateProduct(
    id: string,
    name: string | undefined,
    description: string | undefined,
    price: number | undefined,
    categoryId: string | undefined,
    imageUrl: string | undefined,
    isAvailable: boolean | undefined,
    dbConnection: IDatabaseConnection
  ) {
    const productGateway = new ProductGateway(dbConnection);
    const product = await ProductUseCases.updateProduct(
      id,
      name,
      description,
      price,
      categoryId,
      imageUrl,
      isAvailable,
      productGateway
    );
    return ProductPresenter.toJSON(product);
  }

  static async deleteProductById(
    id: string,
    dbConnection: IDatabaseConnection
  ) {
    const productGateway = new ProductGateway(dbConnection);
    await ProductUseCases.deleteProduct(id, productGateway);
    return { message: "Product deleted successfully" };
  }
}

export default ProductController;
