import { IDatabaseConnection } from "@infra-interfaces/IDbConnection";
import { ICustomerRepository } from "@repositories/ICustomerRepository";
import Customer from "@entities/Customer";

interface CustomerData {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone?: string;
}

export class CustomerGateway implements ICustomerRepository {
  private readonly dbConnection: IDatabaseConnection;
  private readonly tableName: string = "customer";

  constructor(dbConnection: IDatabaseConnection) {
    this.dbConnection = dbConnection;
  }

  async create(customer: Customer): Promise<Customer> {
    const customerData = customer.toJSON();
    const createdCustomer = await this.dbConnection.create<CustomerData>(
      this.tableName,
      customerData
    );
    return new Customer(
      createdCustomer.id,
      createdCustomer.name,
      createdCustomer.email,
      createdCustomer.cpf,
      createdCustomer.phone
    );
  }

  async findById(id: string): Promise<Customer | null> {
    const customer = await this.dbConnection.findById<CustomerData>(
      this.tableName,
      id
    );
    if (!customer) {
      return null;
    }
    return new Customer(
      customer.id,
      customer.name,
      customer.email,
      customer.cpf,
      customer.phone
    );
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const customers = await this.dbConnection.findByField<CustomerData>(
      this.tableName,
      "email",
      email
    );
    if (customers.length === 0) {
      return null;
    }
    const customer = customers[0];
    return new Customer(
      customer.id,
      customer.name,
      customer.email,
      customer.cpf,
      customer.phone
    );
  }

  async findByCPF(cpf: string): Promise<Customer | null> {
    const customers = await this.dbConnection.findByField<CustomerData>(
      this.tableName,
      "cpf",
      cpf
    );
    if (customers.length === 0) {
      return null;
    }
    const customer = customers[0];
    return new Customer(
      customer.id,
      customer.name,
      customer.email,
      customer.cpf,
      customer.phone
    );
  }

  async findAll(): Promise<Customer[]> {
    const customers = await this.dbConnection.findAll<CustomerData>(
      this.tableName
    );
    return customers.map(
      (customer) =>
        new Customer(
          customer.id,
          customer.name,
          customer.email,
          customer.cpf,
          customer.phone
        )
    );
  }

  async update(customer: Customer): Promise<Customer> {
    const customerData = customer.toJSON();
    const updatedCustomer = await this.dbConnection.update<CustomerData>(
      this.tableName,
      customer.id,
      customerData
    );
    return new Customer(
      updatedCustomer.id,
      updatedCustomer.name,
      updatedCustomer.email,
      updatedCustomer.cpf,
      updatedCustomer.phone
    );
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.dbConnection.delete(this.tableName, id);
    if (!deleted) {
      throw new Error(`Customer with ID ${id} not found`);
    }
  }
}
