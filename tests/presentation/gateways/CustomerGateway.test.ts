import { CustomerGateway } from "../../../src/presentation/gateways/CustomerGateway";
import Customer from "../../../src/domain/entities/Customer";
import { IDatabaseConnection } from "@infra-interfaces/IDbConnection";

describe("CustomerGateway", () => {
  let gateway: CustomerGateway;
  let mockDb: jest.Mocked<IDatabaseConnection>;
  const customerData = {
    id: "b3b8c7e2-8c2a-4e2a-9b2a-2b2a2b2a2b2a",
    name: "João Silva",
    email: "joao@email.com",
    cpf: "705.503.180-03",
    phone: "+5511999999999",
  };
  const customer = new Customer(
    customerData.id,
    customerData.name,
    customerData.email,
    customerData.cpf,
    customerData.phone
  );

  beforeEach(() => {
    mockDb = {
      create: jest.fn(),
      findById: jest.fn(),
      findByField: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    } as any;
    gateway = new CustomerGateway(mockDb);
  });

  it("should create a customer", async () => {
    mockDb.create.mockResolvedValue(customerData);
    const result = await gateway.create(customer);
    expect(mockDb.create).toHaveBeenCalledWith("customer", customer.toJSON());
    expect(result).toBeInstanceOf(Customer);
    expect(result.id).toBe(customerData.id);
  });

  it("should find a customer by id", async () => {
    mockDb.findById.mockResolvedValue(customerData);
    const result = await gateway.findById(customerData.id);
    expect(mockDb.findById).toHaveBeenCalledWith("customer", customerData.id);
    expect(result).toBeInstanceOf(Customer);
    expect(result?.id).toBe(customerData.id);
  });

  it("should return null if customer by id not found", async () => {
    mockDb.findById.mockResolvedValue(null);
    const result = await gateway.findById("not-found");
    expect(result).toBeNull();
  });

  it("should find a customer by email", async () => {
    mockDb.findByField.mockResolvedValue([customerData]);
    const result = await gateway.findByEmail(customerData.email);
    expect(mockDb.findByField).toHaveBeenCalledWith(
      "customer",
      "email",
      customerData.email
    );
    expect(result).toBeInstanceOf(Customer);
    expect(result?.email).toBe(customerData.email);
  });

  it("should return null if customer by email not found", async () => {
    mockDb.findByField.mockResolvedValue([]);
    const result = await gateway.findByEmail("notfound@email.com");
    expect(result).toBeNull();
  });

  it("should find a customer by CPF", async () => {
    mockDb.findByField.mockResolvedValue([customerData]);
    const result = await gateway.findByCPF(customerData.cpf);
    expect(mockDb.findByField).toHaveBeenCalledWith(
      "customer",
      "cpf",
      customerData.cpf
    );
    expect(result).toBeInstanceOf(Customer);
    expect(result?.cpf).toBe(customerData.cpf);
  });

  it("should return null if customer by CPF not found", async () => {
    mockDb.findByField.mockResolvedValue([]);
    const result = await gateway.findByCPF("000.000.000-00");
    expect(result).toBeNull();
  });

  it("should find all customers", async () => {
    mockDb.findAll.mockResolvedValue([customerData]);
    const result = await gateway.findAll();
    expect(mockDb.findAll).toHaveBeenCalledWith("customer");
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Customer);
  });

  it("should update a customer", async () => {
    mockDb.update.mockResolvedValue(customerData);
    const result = await gateway.update(customer);
    expect(mockDb.update).toHaveBeenCalledWith(
      "customer",
      customer.id,
      customer.toJSON()
    );
    expect(result).toBeInstanceOf(Customer);
    expect(result.id).toBe(customerData.id);
  });

  it("should delete a customer", async () => {
    mockDb.delete.mockResolvedValue(true);
    await expect(gateway.delete(customerData.id)).resolves.toBeUndefined();
    expect(mockDb.delete).toHaveBeenCalledWith("customer", customerData.id);
  });

  it("should throw if delete returns false", async () => {
    mockDb.delete.mockResolvedValue(false);
    await expect(gateway.delete(customerData.id)).rejects.toThrow(
      `Customer with ID ${customerData.id} not found`
    );
  });
});
