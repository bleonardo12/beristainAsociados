// Aumentar el tiempo de espera para pruebas asíncronas
jest.setTimeout(10000);

// Variables globales para pruebas
process.env.NODE_ENV = 'test';

// Silenciar logs durante pruebas
jest.mock('./logger', () => {
  return {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockImplementation(() => ({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    })),
  };
});

// Limpiar mocks después de cada prueba
afterEach(() => {
  jest.clearAllMocks();
});

// Cerrar cualquier conexión abierta después de todas las pruebas
afterAll(async () => {
  // Si tienes una referencia global al servidor, ciérralo aquí
  if (global.server) {
    await new Promise((resolve) => {
      global.server.close(resolve);
    });
  }
  
  // Si tienes conexiones a bases de datos, ciérralas aquí
  // ejemplo: await mongoose.connection.close();
  
  // Esperar a que termine el ciclo de eventos para evitar fugas de memoria
  await new Promise(resolve => setTimeout(resolve, 500));
});