const path = require('path');

function verusuariosProfe(req, res) {
  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM professors ', (err, professors) => {
      if(err) {
        res.json(err);
      }
      res.render('tasks/todos',{professors});
    });
  });
}

function updateUserProfe(req, res) { //Editar
  const id = req.params.id;
  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM professors WHERE id = ?',[id], (err,  x) => {
      if(err) {
        res.json(err);
      }
      res.render('tasks/editar',{ x}); //res.render('crear/createMateria',{profesores});
    });
  });
}

function updateUserProfe2(req, res) {
  const id = req.params.id;
  const { name, lastname, dni, email, role } = req.body; // Obtener los datos del cuerpo de la solicitud
  req.getConnection((err, conn) => {
    conn.query('UPDATE professors SET name=?, lastname=?, dni=?, email=?, role=? WHERE id=?', [name, lastname, dni, email, role, id], (err, result) => {
      if (err) {
        res.json(err);
        return;
      }
      
      res.redirect('/');
    });
  });
}
    
function deleteUserProfe(req, res) {
}

function deleteUserProfe2(req, res) {
  const id = req.params.id;
  req.getConnection((err, conn) => {
    conn.query('DELETE FROM professors WHERE id = ?', [id], (err) => {
      if(err) {
        res.json(err);
      }
      res.redirect('/');
    });
  });
}

// Alumnos

function verusuariosAlum(req, res) {
  req.getConnection((err, conn) => {
    conn.query('SELECT id, name, lastname, credit, DATE_FORMAT(credit_expiration, "%d/%m/%Y") AS formatted_credit_expiration FROM partners', (err, partners) => {
      if(err) {
        res.json(err);
      }
      res.render('tasks/alumnos',{partners});
    });
  });
}

function updateUserAlum(req, res) { //Editar
  const id = req.params.id;
  console.log(id)
  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM partners WHERE id = ?',[id], (err, x) => {
      if(err) {
        res.json(err);
      }
     // console.log(x)
      res.render('tasks/editar',{x}); //res.render('crear/createMateria',{profesores});
    });
  });
}

function updateUserAlum2(req, res) {
  const id = req.params.id;
  const { name, lastname, dni, email, role } = req.body; // Obtener los datos del cuerpo de la solicitud
  req.getConnection((err, conn) => {
    conn.query('UPDATE partners SET name=?, lastname=?, dni=?, email=?, role=? WHERE id=?', [name, lastname, dni, email, role, id], (err, result) => {
      if (err) {
        res.json(err);
        return;
      }
      
      res.redirect('/');
    });
  });
}
    
function deleteUserAlum(req, res) {
}

function deleteUserAlum2(req, res) {
  const id = req.params.id;
  req.getConnection((err, conn) => {
    conn.query('DELETE FROM partners WHERE id = ?', [id], (err) => {
      if(err) {
        res.json(err);
      }
      res.redirect('/');
    });
  });
}

module.exports = {
  
  verusuariosProfe: verusuariosProfe,
  updateUserProfe: updateUserProfe,
  updateUserProfe2:updateUserProfe2,
  deleteUserProfe: deleteUserProfe,
  deleteUserProfe2: deleteUserProfe2,

  verusuariosAlum: verusuariosAlum,
  updateUserAlum: updateUserAlum,
  updateUserAlum2: updateUserAlum2,
  deleteUserAlum: deleteUserAlum,
  deleteUserAlum2: deleteUserAlum2
}