const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Transportador de correos
const transporter = nodemailer.createTransport({
  host: 'mail.alzenergy.com.co',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Endpoint: recibir solicitud
app.post('/solicitudes', async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);

    const {
      typedocument,
      numerodocumento,
      nombre,
      telefono,
      correo,
      monto,
      cuotas,
      cuotaMensual,
      total,
    } = req.body;

    // CONSULTA MODIFICADA: Especificamos el esquema public
    const result = await pool.query(
      `INSERT INTO public.solicitudes (
        typedocument, numerodocumento, nombre, telefono, correo,
        monto, cuotas, cuota_mensual, total
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [
        typedocument,
        numerodocumento,
        nombre,
        telefono,
        correo,
        monto,
        cuotas,
        cuotaMensual,
        total,
      ]
    );

    const solicitudId = result.rows[0].id;
    console.log('Solicitud guardada con ID:', solicitudId);

    // Envío de correo
    await transporter.sendMail({
      from: `"Prestadero" <${process.env.EMAIL_USER}>`,
      to: correo,
      subject: '✅ Solicitud Recibida - Prestadero',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmación de Solicitud</title>
          <style>
            /* Estilos optimizados */
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: white; 
              max-width: 650px; 
              margin: 0 auto; 
              padding: 20px; 
              background-color:rgb(0, 0, 0);
            }
            .header { 
              background: linear-gradient(135deg,rgb(255, 251, 0),rgb(234, 255, 0));
              padding: 30px 20px; 
              text-align: center; 
              border-radius: 8px 8px 0 0;
            }
            /* ... (resto de estilos permanecen iguales) ... */
          </style>
        </head>
        <body>
          <div class="card">
            <!-- Contenido del correo permanece igual -->
          </div>
        </body>
        </html>
      `
    });

    console.log('Correo enviado a:', correo);
    res.status(201).json({ id: solicitudId });
  } catch (error) {
    console.error('Error al guardar la solicitud:', error);
    
    // Mensaje de error más detallado
    let errorMessage = 'Error interno del servidor';
    if (error.code === '23505') {
      errorMessage = 'Documento ya registrado';
    } else if (error.code === '23502') {
      errorMessage = 'Datos incompletos';
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

// Endpoint: obtener todas las solicitudes
app.get('/solicitudes', async (req, res) => {
  try {
    // CONSULTA MODIFICADA: Especificamos el esquema public
    const result = await pool.query(
      'SELECT * FROM public.solicitudes ORDER BY fecha DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al consultar solicitudes:', error);
    res.status(500).json({ error: 'Error al obtener solicitudes' });
  }
});

// Nuevo endpoint: obtener solicitud por documento
app.get('/solicitudes/:documento', async (req, res) => {
  try {
    const { documento } = req.params;
    const result = await pool.query(
      'SELECT * FROM public.solicitudes WHERE numerodocumento = $1',
      [documento]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al buscar solicitud:', error);
    res.status(500).json({ error: 'Error en la búsqueda' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor de solicitudes corriendo en http://localhost:${PORT}`);
  console.log(`Conectado a: ${process.env.DB_CONNECTION_STRING}`);
});