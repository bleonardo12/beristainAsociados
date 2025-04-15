backend/
├── config/               # Configuraciones
│   ├── database.js       # Configuración de la base de datos
│   └── mail.js           # Configuración del servicio de correo
├── controllers/          # Controladores de rutas
│   ├── contactController.js   # Control de formulario de contacto
│   ├── chatbotController.js   # Lógica del chatbot
│   └── testimonialsController.js  # Control de testimonios
├── middleware/           # Middleware personalizado
│   ├── rateLimiter.js    # Limitador de tasa para evitar spam
│   ├── security.js       # Headers de seguridad
│   └── validator.js      # Validación de datos
├── models/               # Modelos de datos
│   ├── Contact.js        # Modelo para mensajes de contacto
│   └── Testimonial.js    # Modelo para testimonios
├── routes/               # Rutas de la API
│   ├── api.js            # Rutas principales de la API
│   ├── contact.js        # Rutas de contacto
│   └── chatbot.js        # Rutas del chatbot
├── utils/                # Utilidades
│   ├── logger.js         # Configuración de logging
│   └── emailService.js   # Servicio para enviar emails
├── .env                  # Variables de entorno (no se versiona)
├── .env.example          # Ejemplo de variables de entorno
├── .gitignore            # Archivos a ignorar en Git
├── package.json          # Dependencias y scripts
└── server.js             # Punto de entrada principal