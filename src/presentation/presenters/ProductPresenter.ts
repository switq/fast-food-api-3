import Product from "@entities/Product";

export default class ProductPresenter {
  static toJSON(product: Product) {
    return product.toJSON();
  }

  static toJSONArray(products: Product[]) {
    return products.map((product) => product.toJSON());
  }
}
