import Order from "@entities/Order";

export default class OrderPresenter {
  static toJSON(order: Order) {
    return order.toJSON();
  }

  static toJSONArray(orders: Order[]) {
    return orders.map((order) => order.toJSON());
  }
}
