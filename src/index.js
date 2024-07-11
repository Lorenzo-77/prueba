const express = require('express');
const { engine } = require('express-handlebars');
const myconnection = require('express-myconnection');
const mysql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const MySQLStore = require('express-mysql-session')(session);
const { PORT } = require('./config');

const loginRoutes = require('./routes/login');
const itemsRoutes = require('./routes/items');
const reservasRoutes = require('./routes/reservas');

const { database } = require('./keys');

require('./lib/passport');

var Handlebars = require("handlebars");
var MomentHandler = require("handlebars.moment");

MomentHandler.registerHelpers(Handlebars);

const app = express();
app.set('port', PORT);

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', engine({
  extname: '.hbs',
  helpers: require('./lib/handlebars')
}));
app.set('view engine', 'hbs');

app.use(myconnection(mysql, database, 'pool'));

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
  store: new MySQLStore(database)
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  app.locals.user = req.user;
  next();
});

// Rutas principales
app.use('/', itemsRoutes);
app.use('/', loginRoutes);
app.use('/', reservasRoutes);

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));


// Middleware de manejo de errores de base de datos
app.use((err, req, res, next) => {
  if (err.code === 'ECONNREFUSED') {
    console.error('Error de conexión a la base de datos:', err);
    res.status(500).send(`
      <html>
      <head>
        <title>Error 500 - Error de conexión</title>
      </head>
      <body style="text-align: center; margin-top: 50px;">
        <h1>Error 500 - Error de conexión a la base de datos</h1>
        <p>Lo sentimos, pero no pudimos conectarnos a la base de datos.</p>
        <img src="/img/error500.png" alt="Error de conexión" style="width: 50%; height: auto;">
        <p>Por favor, intenta de nuevo más tarde.</p>
      </body>
      </html>
    `);
  } else {
    next(err); // Pasar el error al siguiente middleware
  }
});

// Middleware de manejo de errores generales
app.use((err, req, res, next) => {
  console.error('Error general:', err);
  res.status(500).send(`
    <html>
    <head>
      <title>Error 500 - Error Interno</title>
    </head>
    <body style="text-align: center; margin-top: 50px;">
      <h1>Error 500 - Error Interno</h1>
      <p>Lo sentimos, ha ocurrido un error en el servidor.</p>
      <p>Por favor, intenta de nuevo más tarde.</p>
    </body>
    </html>
  `);
});

// Manejo de errores 404 (al final de las rutas)
app.use((req, res, next) => {
  res.status(404).send(`
    <html>
    <head>
      <title>404 - Página no encontrada</title>
    </head>
    <body style="text-align: center; margin-top: 50px;">
      <h1>404 - Página no encontrada</h1>
     
      <p>Lo sentimos, pero la página que estás buscando no existe.</p>
      <a href="/">Volver a la página principal</a>
    </body>
    </html>
  `);
});

// Iniciar el servidor
app.listen(app.get('port'), () => {
  console.log('Listening on port ', app.get('port'));
});

//* crear formulario al registrarse los Alumnos */
//* franco_meloni@outlook.com ProClub1270* */