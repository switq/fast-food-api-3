import Category from "@entities/Category";

export default class CategoryPresenter {
  static toJSON(category: Category) {
    return category.toJSON();
  }

  static toJSONArray(categories: Category[]) {
    return categories.map((category) => category.toJSON());
  }
}
