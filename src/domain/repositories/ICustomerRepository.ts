import Customer from "@entities/Customer";

export interface ICustomerRepository {
  create(customer: Customer): Promise<Customer>;
  findById(id: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  findByCPF(cpf: string): Promise<Customer | null>;
  findAll(): Promise<Customer[]>;
  update(customer: Customer): Promise<Customer>;
  delete(id: string): Promise<void>;
}
