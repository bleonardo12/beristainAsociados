// Aumentar el tiempo de espera para pruebas asíncronas
jest.setTimeout(10000);

// Variables globales para pruebas
process.env.NODE_ENV = 'test';

// Silenciar logs durante pruebas
jest.mock('./server/logger', () => {
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

// Mock para pino-http
jest.mock('pino-http', () => {
  return jest.fn().mockImplementation(() => {
    return (req, res, next) => {
      req.log = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      };
      if (next) next();
    };
  });
});

// Mock para pino
jest.mock('pino', () => {
  return {
    stdSerializers: {
      req: jest.fn().mockImplementation((req) => req)
    }
  };
});

// Mock para nodemailer
jest.mock('nodemailer', () => {
  return {
    createTransport: jest.fn().mockReturnValue({
      verify: jest.fn().mockImplementation((callback) => callback(null, true)),
      sendMail: jest.fn().mockImplementation((mailOptions) => 
        Promise.resolve({
          messageId: 'test-message-id',
          envelope: {
            from: mailOptions.from,
            to: [mailOptions.to]
          },
          accepted: [mailOptions.to],
          rejected: [],
          pending: []
        })
      )
    })
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