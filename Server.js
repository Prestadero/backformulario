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
        .header img { 
          max-width: 180px; 
          height: auto;
        }
        .card {
          background: black;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          margin-top: -15px;
          overflow: hidden;
        }
        .content {
          padding: 30px;
        }
        h1 { 
          color: white; 
          margin-top: 15px;
          font-weight: 600;
          font-size: 24px;
        }
        h2 {
          color:rgb(248, 251, 60);
          margin-top: 0;
          font-size: 22px;
        }
        .highlight {
          background-color:rgb(0, 0, 0);
          padding: 15px;
          border-left: 4px solidrgb(253, 253, 0);
          border-radius: 4px;
          margin: 25px 0;
        }
        .solicitud-info {
          display: flex;
          justify-content: space-between;
          margin-top: 25px;
          flex-wrap: wrap;
        }
        .info-box {
          background:rgb(0, 0, 0);
          border-radius: 6px;
          padding: 15px;
          width: 48%;
          margin-bottom: 15px;
          box-sizing: border-box;
        }
        .info-label {
          font-size: 14px;
          color:rgb(255, 255, 255);
          margin-bottom: 5px;
        }
        .info-value {
          font-size: 18px;
          font-weight: 600;
          color:rgb(255, 251, 0);
        }
        .footer {
          text-align: center;
          padding: 20px;
          color:rgb(255, 255, 255);
          font-size: 14px;
          border-top: 1px solid #eaeaea;
          margin-top: 20px;
        }
        .contact-info {
          margin-top: 15px;
          font-size: 15px;
        }
        .btn {
          display: inline-block;
          background: linear-gradient(135deg,rgb(240, 255, 37),rgb(230, 255, 5));
          color: white !important;
          text-decoration: none;
          padding: 12px 30px;
          border-radius: 30px;
          font-weight: 600;
          margin: 20px 0;
          text-align: center;
          transition: all 0.3s ease;
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        @media (max-width: 600px) {
          .info-box { width: 100%; }
          .header { padding: 20px 10px; }
          .content { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <img src="https://italzenergy.github.io/it/static/media/logo.4a2af6154802f6cee97c.jpg" alt="Prestadero Logo">
          <h1>Solicitud Recibida</h1>
        </div>
        
        <div class="content">
          <h2>Hola ${nombre},</h2>
          <p>Hemos recibido tu solicitud de crédito exitosamente y ya está en proceso de revisión por parte de nuestro equipo.</p>
          
          <div class="highlight">
            <p>Tu número de solicitud es: <strong style="font-size: 1.2em;">#${solicitudId}</strong></p>
            <p>Un asesor especializado se contactará contigo en las próximas 24 horas hábiles.</p>
            <p>Recuerda que el interés del simulador es aproximado, puede variar dependiendo la capacidad de endeudamiento</p>
            <p>Reportes en centrales de riesgo, etc.</p>
          </div>
          
          <div class="solicitud-info">
            <div class="info-box">
              <div class="info-label">Monto solicitado</div>
              <div class="info-value">$${monto.toLocaleString('es-CO')}</div>
            </div>
            <div class="info-box">
              <div class="info-label">Plazo</div>
              <div class="info-value">${cuotas} cuotas</div>
            </div>
            <div class="info-box">
              <div class="info-label">Cuota mensual</div>
              <div class="info-value">$${cuotaMensual.toLocaleString('es-CO')}</div>
            </div>
            <div class="info-box">
              <div class="info-label">Total a pagar</div>
              <div class="info-value">$${total.toLocaleString('es-CO')}</div>
            </div>
          </div>
          
          <p>Puedes consultar el estado de tu solicitud en cualquier momento usando tu número de documento.</p>
          
          <a href="https://prestadero.com/estado-solicitud" class="btn">Ver estado de mi solicitud</a>
          
          <div class="contact-info">
            <p>¿Tienes preguntas? Contáctanos:</p>
            <p>📞 +57 1 234 5678<br>
            ✉️ info@prestadero.com.co</p>
          </div>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Prestadero. Todos los derechos reservados.<br>
          Carrera 123 #45-67, Bogotá, Colombia</p>
          <p><a href="https://prestadero.com.co" style="color: #1e5799; text-decoration: none;">Visita nuestro sitio web</a></p>
        </div>
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