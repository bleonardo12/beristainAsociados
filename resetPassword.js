const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetPassword() {
  const email = 'beristainyasociadosej@gmail.com';
  const newPassword = 'Temporal2024!';

  console.log('Iniciando reset de contraseña...');
  console.log('Email:', email);
  console.log('Nueva contraseña:', newPassword);

  let connection;
  try {
    // Crear conexión con las credenciales del .env o configuración existente
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'beristain_user',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'beristain_db'
    });

    console.log('Conectado a la base de datos');

    // Hashear la nueva contraseña (bcrypt con salt 10, igual que en el modelo User)
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('Contraseña hasheada');

    // Actualizar el usuario y resetear intentos de login
    const [result] = await connection.execute(
      `UPDATE Users
       SET password = ?,
           loginAttempts = 0,
           lockUntil = NULL
       WHERE email = ?`,
      [hashedPassword, email]
    );

    if (result.affectedRows === 0) {
      console.log('❌ No se encontró ningún usuario con ese email');
      console.log('Verificando emails existentes...');

      const [users] = await connection.execute('SELECT email FROM Users');
      console.log('Usuarios en la base de datos:');
      users.forEach(u => console.log(' -', u.email));
    } else {
      console.log('✅ Contraseña actualizada exitosamente');
      console.log('');
      console.log('Credenciales:');
      console.log('Email:', email);
      console.log('Contraseña:', newPassword);
      console.log('');
      console.log('⚠️  Recuerda cambiar esta contraseña temporal después de iniciar sesión');
    }

  } catch (error) {
    console.error('❌ Error al resetear contraseña:', error.message);
    if (error.errno === 1698) {
      console.log('\nEl error 1698 indica problema de autenticación con MySQL.');
      console.log('Verifica las credenciales en el archivo .env');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('Conexión cerrada');
    }
  }
}

resetPassword();
