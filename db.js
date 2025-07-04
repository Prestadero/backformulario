const { Pool } = require('pg');
require('dotenv').config();

// Configuración optimizada para Supabase
const pool = new Pool({
  connectionString: process.env.DB_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false // Requerido para Supabase
  },
  max: 10, // Máximo de conexiones
  idleTimeoutMillis: 30000, // Desconexión después de 30s inactivo
  connectionTimeoutMillis: 5000 // Tiempo de espera para conexión
});

// Verificación de conexión
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error conectando a Supabase:', err);
  } else {
    console.log('✅ Conectado a Supabase. Hora actual:', res.rows[0].now);
  }
});

module.exports = pool;