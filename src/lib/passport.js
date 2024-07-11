const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const pool = require('../database');
const helpers = require('./helpers');

passport.use('local.auth', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, async (req, email, password, done) => {

    let Admin = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    let Profe = await pool.query('SELECT * FROM professors WHERE email = ?', [email]);
    let Alumno = await pool.query('SELECT * FROM partners WHERE email = ?', [email]);

    if(Admin.length > 0){
     
      const rows = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
     if (rows.length > 0) {
      const user = rows[0];
      console.log(user)
      const validPassword = await helpers.matchPassword(password, user.password)
      if (validPassword) {
        done(null, user);
      } else {
        done(null, false, {error:'Error password Incorrecto'});
      }
    } else {
      return done(null, false, {error: 'Error: usuario no existe'});
    }
  } else if(Profe.length > 0){
    const rows = await pool.query('SELECT * FROM professors WHERE email = ?', [email]);
    if (rows.length > 0) {
      const user = rows[0];
      const validPassword = await helpers.matchPassword(password, user.password)
      if (validPassword) {
        done(null, user);
      } else {
        done(null, false, {error:'Error password Incorrecto'});
      }
    } else {
      return done(null, false, {error: 'Error: usuario no existe'});
    }
  } else if(Alumno.length > 0){
    const rows = await pool.query('SELECT * FROM partners WHERE email = ?', [email]);
    if (rows.length > 0) {
      const user = rows[0];
      const validPassword = await helpers.matchPassword(password, user.password)
      if (validPassword) {
        done(null, user);
      } else {
        done(null, false, {error:'Error password Incorrecto'});
      }
    } else {
      return done(null, false, {error: 'Error: usuario no existe'});
    }
  }
}));


passport.use('local.registrate', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  const { name, lastname, dni, role } = req.body;
  const newUser = {
      name,
      lastname,
      dni,
      email,
      password,
      role,
      system_created: new Date() // Otra opción: utiliza la fecha actual
  };
      newUser.password = await helpers.encryptPassword(password);
      const result = await pool.query('INSERT INTO users SET ?', [newUser]);
      newUser.user_id = result.insertId;
      return done(null, newUser);
       
}));

//creacion de alumnos y profesores
passport.use('local.registrateUser', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  const { name, lastname, dni, role } = req.body;
  console.log(role);
  if (role == "alumno"){
    const newUser = {
      name,
      lastname,
      dni,
      email,
      password,
      role,
      system_created: new Date() // Otra opción: utiliza la fecha actual
  };
  newUser.password = await helpers.encryptPassword(password);
  const result = await pool.query('INSERT INTO partners SET ?', [newUser]);
  newUser.id = result.insertId;
  return  done(null);
} else if ( role == "profesor"){
  const newUser = {
    name,
    lastname,
    dni,
    email,
    password,
    role,
    system_created: new Date() // Otra opción: utiliza la fecha actual
};
  newUser.password = await helpers.encryptPassword(password);
  const result = await pool.query('INSERT INTO professors SET ?', [newUser]);
  newUser.id = result.insertId;
  return  done(null);
}  
}));

passport.serializeUser((user, done) => {
  done(null, {
     id: user.id,
     role: user.role,
     email: user.email
 });
});

passport.deserializeUser(async (user, done) =>{
   
  const rows = await pool.query('SELECT * FROM users where email = ?' , [user.email]);
  done(null, rows[0]);
});

passport.deserializeUser(async (user, done) =>{
  
  const rows = await pool.query('SELECT * FROM professors where email = ?' , [user.email]);
  done(null, rows[0]);
});

passport.deserializeUser(async (user, done) =>{
  
  const rows = await pool.query('SELECT * FROM partners where email = ?' , [user.email]);
  done(null, rows[0]);
});
