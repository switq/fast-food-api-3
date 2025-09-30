import { FastFoodApp } from "./infrastructure/api";
import PrismaDBConnection from "./infrastructure/database/prisma/PrismaDBConnection";

let server: any;
let dbConnection: PrismaDBConnection;

async function gracefulShutdown(signal: string) {
  console.log(`Received ${signal}, starting graceful shutdown...`);
  
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
    });
  }
  
  if (dbConnection) {
    await dbConnection.disconnect();
    console.log('Database connection closed');
  }
  
  process.exit(0);
}

async function init() {
  const fastFoodApp = new FastFoodApp();
  dbConnection = new PrismaDBConnection();
  await dbConnection.connect();

  server = fastFoodApp.start(dbConnection);
}

// Graceful shutdown handling
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

init();
