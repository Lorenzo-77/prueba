const express = require('express');
const reservaController = require('../controllers/reservasController');
const { isLoggedIn, auth } = require('../lib/auth');
const routerReservas = express.Router();

routerReservas.get('/horarios',isLoggedIn,auth("admin"), reservaController.horarios);

routerReservas.get('/lista',isLoggedIn, reservaController.list);

routerReservas.post('/buscar',isLoggedIn, reservaController.buscar);

routerReservas.get('/reservar/:id',isLoggedIn, reservaController.reserva);
routerReservas.post('/cancelar/:id',isLoggedIn, reservaController.cancelar);

routerReservas.get('/acreditacion/:id',isLoggedIn, reservaController.acreditar);
routerReservas.post('/acreditacion/:id',isLoggedIn, reservaController.acreditarr);

module.exports = routerReservas;