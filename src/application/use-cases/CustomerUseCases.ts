import Customer from "@entities/Customer";
import { ICustomerRepository } from "@repositories/ICustomerRepository";

class CustomerUseCases {
  static async createCustomer(
    name: string,
    email: string,
    cpf: string,
    phone: string | undefined,
    repository: ICustomerRepository
  ): Promise<Customer> {
    const existingEmail = await repository.findByEmail(email);
    if (existingEmail) {
      throw new Error("A customer with this email already exists");
    }
    const existingCPF = await repository.findByCPF(cpf);
    if (existingCPF) {
      throw new Error("A customer with this CPF already exists");
    }
    const customer = new Customer(undefined, name, email, cpf, phone);
    return repository.create(customer);
  }

  static async findCustomerById(
    id: string,
    repository: ICustomerRepository
  ): Promise<Customer> {
    const customer = await repository.findById(id);
    if (!customer) {
      throw new Error("Customer not found");
    }
    return customer;
  }

  static async findCustomerByEmail(
    email: string,
    repository: ICustomerRepository
  ): Promise<Customer> {
    const customer = await repository.findByEmail(email);
    if (!customer) {
      throw new Error("Customer not found");
    }
    return customer;
  }

  static async findCustomerByCPF(
    cpf: string,
    repository: ICustomerRepository
  ): Promise<Customer> {
    const customer = await repository.findByCPF(cpf);
    if (!customer) {
      throw new Error("Customer not found");
    }
    return customer;
  }

  static async findAllCustomers(
    repository: ICustomerRepository
  ): Promise<Customer[]> {
    return repository.findAll();
  }

  static async updateCustomer(
    id: string,
    name: string | undefined,
    email: string | undefined,
    cpf: string | undefined,
    phone: string | undefined,
    repository: ICustomerRepository
  ): Promise<Customer> {
    const existingCustomer = await repository.findById(id);
    if (!existingCustomer) {
      throw new Error("Customer not found");
    }
    if (email !== undefined && email !== existingCustomer.email) {
      const customerWithSameEmail = await repository.findByEmail(email);
      if (customerWithSameEmail) {
        throw new Error("A customer with this email already exists");
      }
      existingCustomer.email = email;
    }
    if (cpf !== undefined && cpf !== existingCustomer.cpf) {
      const customerWithSameCPF = await repository.findByCPF(cpf);
      if (customerWithSameCPF) {
        throw new Error("A customer with this CPF already exists");
      }
      existingCustomer.cpf = cpf;
    }
    if (name !== undefined) {
      existingCustomer.name = name;
    }
    if (phone !== undefined) {
      existingCustomer.phone = phone;
    }
    return repository.update(existingCustomer);
  }

  static async deleteCustomer(
    id: string,
    repository: ICustomerRepository
  ): Promise<void> {
    const customer = await repository.findById(id);
    if (!customer) {
      throw new Error("Customer not found");
    }
    await repository.delete(id);
  }
}

export default CustomerUseCases;
