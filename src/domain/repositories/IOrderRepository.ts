import Order from "@entities/Order";

export interface IOrderRepository {
  create(order: Order): Promise<Order>;
  update(order: Order): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findAll(): Promise<Order[]>;
  findAllSorted(): Promise<Order[]>;
  findByCustomerId(customerId: string): Promise<Order[]>;
  findByStatus(status: string): Promise<Order[]>;
  delete(id: string): Promise<void>;
}
