'use strict';

import mongoose from "mongoose";

export const dbConnection = async () => {
    try {
        mongoose.connection.on('error', () => {
            console.log('MongoDB - connection error');
            mongoose.disconnect();
        }),
        mongoose.connection.on('connecting', () => {
            console.log('MongoDB | Intendando conexion');
        }),
        mongoose.connection.on('connected', () => {
            console.log('MongoDB | Conectado a MongoDB');
        }),
        mongoose.connection.on('open', () => {
            console.log('MongoDB | Conectado a la Base de Datos');
        }),
        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB | Reconectado a la Base de Datos');
        }),
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB | Desconectado');
        }),
        mongoose.connect(process.env.URI_MONGO, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 50,
        });
    } catch (error) {
        console.log('Error conectandose a la base de datos: ', error);
    }
}