import { IDatabaseConnection } from "@infra-interfaces/IDbConnection";
import { IOrderRepository } from "@repositories/IOrderRepository";
import Order, { OrderStatus } from "@entities/Order";
import OrderItem from "@entities/OrderItem";

interface OrderData {
  id: string;
  customerId?: string;
  status: OrderStatus;
  paymentStatus: string;
  totalAmount: number;
  paymentProviderId?: string;
  orderNumber?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItemData {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  observation?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class OrderGateway implements IOrderRepository {
  private readonly dbConnection: IDatabaseConnection;
  private readonly orderTable: string = "order"; // Prisma client expects lowercase model name
  private readonly orderItemTable: string = "orderItem"; // Prisma client expects lowercase model name
  constructor(dbConnection: IDatabaseConnection) {
    this.dbConnection = dbConnection;
  }

  private async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const items = await this.dbConnection.findByField<OrderItemData>(
      this.orderItemTable,
      "orderId",
      orderId
    );
    return items.map(
      (item) =>
        new OrderItem(
          item.productId,
          item.quantity,
          item.unitPrice,
          item.orderId || orderId,
          item.id,
          item.observation
        )
    );
  }
  async create(order: Order): Promise<Order> {
    const orderData = order.toJSON();
    console.log("OrderGateway.create payload:", orderData);

    const createdOrder = await this.dbConnection.create<Omit<OrderData, "id">>(
      this.orderTable,
      {
        customerId: orderData.customerId,
        status: orderData.status,
        totalAmount: orderData.totalAmount,
        paymentStatus: orderData.paymentStatus,
        paymentProviderId: orderData.paymentProviderId,
        // orderNumber não é definido na criação, será gerado na confirmação
        createdAt: orderData.createdAt,
        updatedAt: orderData.updatedAt,
      }
    );
    console.log("OrderGateway.create result:", createdOrder);
    // Salvar os itens usando o ID do pedido criado
    for (const item of order.items) {
      const itemData = item.toJSON();
      await this.dbConnection.create<Omit<OrderItemData, "id">>(
        this.orderItemTable,
        {
          orderId: (createdOrder as any).id, // Use the ID from the created order
          productId: itemData.productId,
          quantity: itemData.quantity,
          unitPrice: itemData.unitPrice,
          totalPrice: itemData.totalPrice,
          observation: itemData.observation,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      );
    }
    const items = await this.getOrderItems((createdOrder as any).id);
    return new Order(
      (createdOrder as any).id,
      orderData.customerId,
      items,
      orderData.status,
      orderData.paymentStatus,
      orderData.paymentProviderId
    );
    // Note: orderNumber will be set later when order is confirmed
  }
  async update(order: Order): Promise<Order> {
    const orderData = order.toJSON();
    const updatedOrder = await this.dbConnection.update<OrderData>(
      this.orderTable,
      order.id,
      {
        customerId: orderData.customerId,
        status: orderData.status,
        totalAmount: orderData.totalAmount,
        paymentStatus: orderData.paymentStatus,
        paymentProviderId: orderData.paymentProviderId,
        orderNumber: orderData.orderNumber,
        updatedAt: new Date(),
      }
    );
    // Atualizar itens: estratégia simples (deleta todos e recria)
    const existingItems = await this.getOrderItems(order.id);
    for (const item of existingItems) {
      await this.dbConnection.delete(this.orderItemTable, item.id);
    }
    for (const item of order.items) {
      const itemData = item.toJSON();
      await this.dbConnection.create<Omit<OrderItemData, "id">>(
        this.orderItemTable,
        {
          orderId: itemData.orderId || order.id,
          productId: itemData.productId,
          quantity: itemData.quantity,
          unitPrice: itemData.unitPrice,
          totalPrice: itemData.totalPrice,
          observation: itemData.observation,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      );
    }
    const items = await this.getOrderItems(order.id);
    const orderInstance = new Order(
      updatedOrder.id,
      updatedOrder.customerId,
      items,
      updatedOrder.status,
      updatedOrder.paymentStatus,
      updatedOrder.paymentProviderId
    );
    // Set orderNumber manually if it exists
    if (updatedOrder.orderNumber) {
      (orderInstance as any)._orderNumber = updatedOrder.orderNumber;
    }
    return orderInstance;
  }

  async findById(id: string): Promise<Order | null> {
    const order = await this.dbConnection.findById<OrderData>(
      this.orderTable,
      id
    );
    if (!order) {
      return null;
    }
    const items = await this.getOrderItems(order.id);
    const orderInstance = new Order(
      order.id,
      order.customerId,
      items,
      order.status,
      order.paymentStatus,
      order.paymentProviderId
    );
    // Set orderNumber manually if it exists
    if (order.orderNumber) {
      (orderInstance as any)._orderNumber = order.orderNumber;
    }
    return orderInstance;
  }
  async findAll(): Promise<Order[]> {
    const orders = await this.dbConnection.findAll<OrderData>(this.orderTable);
    const result: Order[] = [];
    for (const order of orders) {
      const items = await this.getOrderItems(order.id);
      const orderInstance = new Order(
        order.id,
        order.customerId,
        items,
        order.status,
        order.paymentStatus,
        order.paymentProviderId
      );
      // Set orderNumber manually if it exists
      if (order.orderNumber) {
        (orderInstance as any)._orderNumber = order.orderNumber;
      }
      result.push(orderInstance);
    }
    return result;
  }
  async findAllSorted(): Promise<Order[]> {
    const allOrders = await this.findAll();

    // Incluir apenas pedidos em andamento, excluindo DELIVERED (finalizados)
    const kitchenStatuses = [
      OrderStatus.READY, // Prioridade 1
      OrderStatus.PREPARING, // Prioridade 2
      OrderStatus.PAYMENT_CONFIRMED, // Prioridade 3
    ];

    const filteredOrders = allOrders.filter((order) =>
      kitchenStatuses.includes(order.status)
    );

    // Definir ordem de prioridade: READY (1) > PREPARING (2) > PAYMENT_CONFIRMED (3)
    const statusOrder: { [key: string]: number } = {
      [OrderStatus.READY]: 1,
      [OrderStatus.PREPARING]: 2,
      [OrderStatus.PAYMENT_CONFIRMED]: 3,
    };

    const sortedOrders = filteredOrders.sort((a, b) => {
      const statusA = statusOrder[a.status] || 4;
      const statusB = statusOrder[b.status] || 4;

      // Primeiro critério: ordenar por status (prioridade)
      if (statusA !== statusB) {
        return statusA - statusB;
      }

      // Segundo critério: dentro do mesmo status, pedidos mais antigos primeiro
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    return sortedOrders;
  }
  async findByCustomerId(customerId: string): Promise<Order[]> {
    const orders = await this.dbConnection.findByField<OrderData>(
      this.orderTable,
      "customerId",
      customerId
    );
    const result: Order[] = [];
    for (const order of orders) {
      const items = await this.getOrderItems(order.id);
      const orderInstance = new Order(
        order.id,
        order.customerId,
        items,
        order.status,
        order.paymentStatus,
        order.paymentProviderId
      );
      // Set orderNumber manually if it exists
      if (order.orderNumber) {
        (orderInstance as any)._orderNumber = order.orderNumber;
      }
      result.push(orderInstance);
    }
    return result;
  }
  async findByStatus(status: string): Promise<Order[]> {
    const orders = await this.dbConnection.findByField<OrderData>(
      this.orderTable,
      "status",
      status
    );
    const result: Order[] = [];
    for (const order of orders) {
      const items = await this.getOrderItems(order.id);
      const orderInstance = new Order(
        order.id,
        order.customerId,
        items,
        order.status,
        order.paymentStatus,
        order.paymentProviderId
      );
      // Set orderNumber manually if it exists
      if (order.orderNumber) {
        (orderInstance as any)._orderNumber = order.orderNumber;
      }
      result.push(orderInstance);
    }
    return result;
  }

  async delete(id: string): Promise<void> {
    // Deleta os itens primeiro
    const items = await this.getOrderItems(id);
    for (const item of items) {
      await this.dbConnection.delete(this.orderItemTable, item.id);
    }
    const deleted = await this.dbConnection.delete(this.orderTable, id);
    if (!deleted) {
      throw new Error(`Order with ID ${id} not found`);
    }
  }
}
