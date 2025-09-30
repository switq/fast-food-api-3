import Customer from "@entities/Customer";

export default class CustomerPresenter {
  static toJSON(customer: Customer) {
    return customer.toJSON();
  }

  static toJSONArray(customers: Customer[]) {
    return customers.map((customer) => customer.toJSON());
  }
}
