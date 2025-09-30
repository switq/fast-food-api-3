import { IDatabaseConnection } from "@infra-interfaces/IDbConnection";
import { CustomerGateway } from "../gateways/CustomerGateway";
import CustomerUseCases from "@usecases/CustomerUseCases";
import CustomerPresenter from "@presenters/CustomerPresenter";

class CustomerController {
  static async createCustomer(
    name: string,
    email: string,
    cpf: string,
    phone: string | undefined,
    dbConnection: IDatabaseConnection
  ) {
    const gateway = new CustomerGateway(dbConnection);
    const customer = await CustomerUseCases.createCustomer(
      name,
      email,
      cpf,
      phone,
      gateway
    );
    return CustomerPresenter.toJSON(customer);
  }

  static async getCustomerById(id: string, dbConnection: IDatabaseConnection) {
    const gateway = new CustomerGateway(dbConnection);
    const customer = await CustomerUseCases.findCustomerById(id, gateway);
    return CustomerPresenter.toJSON(customer);
  }

  static async getCustomerByEmail(
    email: string,
    dbConnection: IDatabaseConnection
  ) {
    const gateway = new CustomerGateway(dbConnection);
    const customer = await CustomerUseCases.findCustomerByEmail(email, gateway);
    return CustomerPresenter.toJSON(customer);
  }

  static async getCustomerByCPF(
    cpf: string,
    dbConnection: IDatabaseConnection
  ) {
    const gateway = new CustomerGateway(dbConnection);
    const customer = await CustomerUseCases.findCustomerByCPF(cpf, gateway);
    return CustomerPresenter.toJSON(customer);
  }

  static async getAllCustomers(dbConnection: IDatabaseConnection) {
    const gateway = new CustomerGateway(dbConnection);
    const customers = await CustomerUseCases.findAllCustomers(gateway);
    return CustomerPresenter.toJSONArray(customers);
  }

  static async updateCustomer(
    id: string,
    name: string | undefined,
    email: string | undefined,
    cpf: string | undefined,
    phone: string | undefined,
    dbConnection: IDatabaseConnection
  ) {
    const gateway = new CustomerGateway(dbConnection);
    const customer = await CustomerUseCases.updateCustomer(
      id,
      name,
      email,
      cpf,
      phone,
      gateway
    );
    return CustomerPresenter.toJSON(customer);
  }

  static async deleteCustomerById(
    id: string,
    dbConnection: IDatabaseConnection
  ) {
    const gateway = new CustomerGateway(dbConnection);
    await CustomerUseCases.deleteCustomer(id, gateway);
    return { message: "Customer deleted successfully" };
  }
}

export default CustomerController;
