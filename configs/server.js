"use strict";

import { createAdminUser } from '../src/helpers/create-admin-user.js';
import http from 'http';
import { Server } from 'socket.io';
import { socketHandler } from '../src/sockets/socket.handler.js';
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { dbConnection } from "./mongo.js";
import auhtRoutes from '../src/auth/auth.routes.js'
import companyRoutes from '../src/companies/company.routes.js'
import jobRoutes from '../src/jobs/job.routes.js';
import applicationRoutes from '../src/applications/application.routes.js';
import messageRoutes from '../src/messages/message.routes.js';
import notificationRoutes from '../src/notifications/notification.routes.js';
import userRoutes from '../src/users/user.routes.js'


const middlewares = (app) => {
  app.use(cors());
  app.use(express.json());
  app.use(helmet());
  app.use(morgan("dev"));
};

const routes = (app) => {
    app.use('/EmpleaYa/v2/auth', auhtRoutes)
    app.use('/EmpleaYa/v2/companies', companyRoutes)
    app.use('/EmpleaYa/v2/jobs', jobRoutes)
    app.use('/EmpleaYa/v2/applications', applicationRoutes);
    app.use('/EmpleaYa/v2/messages', messageRoutes);
    app.use('/EmpleaYa/v2/notifications', notificationRoutes);
    app.use('/EmpleaYa/v2/users', userRoutes);
};

const conectarDB = async () => {
  try {
    await dbConnection();
    console.log("Conexion a la base de datos exitosa");
  } catch (error) {
    console.log("Error connecting to the database: ", error);
    proccess.exit(1);
  }
};

export const initServer = async () => {
  const app = express();
  const port = process.env.PORT || 8000;

  const server = http.createServer(app); // ⬅️ usamos esto en vez de app.listen
  const io = new Server(server, {
    cors: {
      origin: '*'
    }
  });

  socketHandler(io); // ⬅️ manejamos los eventos

  // Guardamos el io en la app para accederlo luego
  app.set('socketio', io);

  try {
    middlewares(app);
    conectarDB();
    routes(app);
    await createAdminUser(); // ⬅️ Aquí se crea el admin por defecto

    server.listen(port); // ⬅️ levantamos el server HTTP con Socket.io
    console.log(`Server running on port: ${port}`);
  } catch (e) {
    console.log(`Error starting the server: ${e}`);
  }
};
