import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting forced database seeding...");

  // Clear all existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.category.deleteMany();
  console.log("✅ All existing data cleared");

  // Create categories
  console.log("📂 Creating categories...");
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Hambúrgueres",
        description: "Deliciosos hambúrgueres artesanais",
      },
    }),
    prisma.category.create({
      data: {
        name: "Bebidas",
        description: "Refrigerantes, sucos e outras bebidas",
      },
    }),
    prisma.category.create({
      data: {
        name: "Acompanhamentos",
        description: "Batatas fritas, onion rings e outros acompanhamentos",
      },
    }),
    prisma.category.create({
      data: {
        name: "Sobremesas",
        description: "Sobremesas deliciosas para adoçar seu dia",
      },
    }),
    prisma.category.create({
      data: {
        name: "Combos",
        description: "Combos completos com hambúrguer, acompanhamento e bebida",
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create products
  console.log("🍔 Creating products...");
  const products = await Promise.all([
    // Hambúrgueres
    prisma.product.create({
      data: {
        name: "X-Burger Clássico",
        description:
          "Hambúrguer de carne bovina com queijo, alface, tomate e molho especial",
        price: 18.9,
        categoryId: categories[0].id,
        imageUrl:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
        isAvailable: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "X-Bacon",
        description:
          "Hambúrguer com bacon crocante, queijo, alface, tomate e molho especial",
        price: 22.9,
        categoryId: categories[0].id,
        imageUrl:
          "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400",
        isAvailable: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "X-Salada",
        description:
          "Hambúrguer vegetariano com alface, tomate, cebola, pepino e molho especial",
        price: 20.9,
        categoryId: categories[0].id,
        imageUrl:
          "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400",
        isAvailable: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "Mega Burger",
        description:
          "Hambúrguer duplo com queijo, bacon, alface, tomate e molho especial",
        price: 28.9,
        categoryId: categories[0].id,
        imageUrl:
          "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400",
        isAvailable: true,
      },
    }),

    // Bebidas
    prisma.product.create({
      data: {
        name: "Coca-Cola 350ml",
        description: "Refrigerante Coca-Cola em lata de 350ml",
        price: 6.9,
        categoryId: categories[1].id,
        imageUrl:
          "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400",
        isAvailable: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "Suco de Laranja Natural",
        description: "Suco de laranja natural 300ml",
        price: 8.9,
        categoryId: categories[1].id,
        imageUrl:
          "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400",
        isAvailable: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "Água Mineral 500ml",
        description: "Água mineral sem gás 500ml",
        price: 4.9,
        categoryId: categories[1].id,
        imageUrl:
          "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400",
        isAvailable: true,
      },
    }),

    // Acompanhamentos
    prisma.product.create({
      data: {
        name: "Batata Frita Média",
        description: "Porção de batatas fritas crocantes com sal",
        price: 12.9,
        categoryId: categories[2].id,
        imageUrl:
          "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400",
        isAvailable: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "Onion Rings",
        description: "Anéis de cebola empanados e fritos",
        price: 14.9,
        categoryId: categories[2].id,
        imageUrl:
          "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400",
        isAvailable: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "Nuggets de Frango",
        description: "6 unidades de nuggets de frango empanados",
        price: 16.9,
        categoryId: categories[2].id,
        imageUrl:
          "https://images.unsplash.com/photo-1562967914-608f82629710?w=400",
        isAvailable: true,
      },
    }),

    // Sobremesas
    prisma.product.create({
      data: {
        name: "Milk Shake de Chocolate",
        description: "Milk shake cremoso de chocolate 300ml",
        price: 15.9,
        categoryId: categories[3].id,
        imageUrl:
          "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400",
        isAvailable: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "Sorvete de Baunilha",
        description: "Sorvete de baunilha com calda de chocolate",
        price: 12.9,
        categoryId: categories[3].id,
        imageUrl:
          "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400",
        isAvailable: true,
      },
    }),

    // Combos
    prisma.product.create({
      data: {
        name: "Combo X-Burger",
        description: "X-Burger + Batata Frita Média + Coca-Cola 350ml",
        price: 32.9,
        categoryId: categories[4].id,
        imageUrl:
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
        isAvailable: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "Combo X-Bacon",
        description: "X-Bacon + Batata Frita Média + Coca-Cola 350ml",
        price: 36.9,
        categoryId: categories[4].id,
        imageUrl:
          "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400",
        isAvailable: true,
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);

  // Create customers
  console.log("👥 Creating customers...");
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: "João Silva",
        email: "joao.silva@email.com",
        cpf: "123.456.789-01",
        phone: "+5511999999999",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Maria Santos",
        email: "maria.santos@email.com",
        cpf: "987.654.321-00",
        phone: "+5511888888888",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Pedro Oliveira",
        email: "pedro.oliveira@email.com",
        cpf: "111.222.333-44",
        phone: "+5511777777777",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Ana Costa",
        email: "ana.costa@email.com",
        cpf: "555.666.777-88",
        phone: "+5511666666666",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Carlos Ferreira",
        email: "carlos.ferreira@email.com",
        cpf: "999.888.777-66",
        phone: "+5511555555555",
      },
    }),
  ]);

  console.log(`✅ Created ${customers.length} customers`);

  // Create sample orders
  console.log("📋 Creating sample orders...");
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        customerId: customers[0].id,
        status: "CONFIRMED",
        orderNumber: 1,
        totalAmount: 51.8,
        orderItems: {
          create: [
            {
              productId: products[0].id, // X-Burger Clássico
              quantity: 2,
              unitPrice: 18.9,
              totalPrice: 37.8,
              observation: "Sem cebola no primeiro hambúrguer",
            },
            {
              productId: products[7].id, // Batata Frita Média
              quantity: 1,
              unitPrice: 12.9,
              totalPrice: 12.9,
              observation: "Bem crocante",
            },
            {
              productId: products[4].id, // Coca-Cola 350ml
              quantity: 1,
              unitPrice: 6.9,
              totalPrice: 6.9,
            },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        customerId: customers[1].id,
        status: "READY",
        orderNumber: 2,
        totalAmount: 28.9,
        orderItems: {
          create: [
            {
              productId: products[1].id, // X-Bacon
              quantity: 1,
              unitPrice: 22.9,
              totalPrice: 22.9,
              observation: "Bacon bem crocante",
            },
            {
              productId: products[4].id, // Coca-Cola 350ml
              quantity: 1,
              unitPrice: 6.9,
              totalPrice: 6.9,
            },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        customerId: customers[2].id,
        status: "PENDING",
        totalAmount: 45.7,
        orderItems: {
          create: [
            {
              productId: products[11].id, // Combo X-Burger
              quantity: 1,
              unitPrice: 32.9,
              totalPrice: 32.9,
            },
            {
              productId: products[10].id, // Milk Shake de Chocolate
              quantity: 1,
              unitPrice: 15.9,
              totalPrice: 15.9,
              observation: "Extra cremoso",
            },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${orders.length} sample orders`);

  console.log("🎉 Forced database seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - ${categories.length} categories created`);
  console.log(`   - ${products.length} products created`);
  console.log(`   - ${customers.length} customers created`);
  console.log(`   - ${orders.length} sample orders created`);
}

main()
  .catch((e) => {
    console.error("❌ Error during forced seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
