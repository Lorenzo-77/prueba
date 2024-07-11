const pool = require('../database');
function horarios(req, res) {
    res.render('reservas/horarios')
  }

  function list(req, res) {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const fecha_actual = today.toLocaleDateString('es-ES', options);
    const fecha_actual_formatted = today.toISOString().split('T')[0];
    
    const fecha = req.query.fecha ? new Date(req.query.fecha) : today;
    const id_partner = req.user.id; // Asumiendo que tienes el id del partner en req.user.id

    const diaActual = fecha.getDay(); // Obtiene el día de la fecha seleccionada
    const diaMap = { 0: 7, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 };
    const idDiaActual = diaMap[diaActual];

    const horaActual = fecha.toTimeString().split(' ')[0];

    req.getConnection((err, conn) => {
        if (err) {
            console.error('Error connecting to database:', err);
            return res.status(500).json({ error: 'Database connection error' });
        }
        conn.query(`SELECT c.id AS clase_id, p.name AS nombre_profesor, d.nombre_dia, 
        TIME_FORMAT(h.hora, '%H:%i') AS hora,(14 - COUNT(t.id)) AS cupos_disponibles,
        CASE WHEN EXISTS (SELECT 1 FROM turno WHERE id_partner = ? AND id_clase = c.id AND fecha = ?) THEN 1 ELSE 0 END AS reservado
        FROM clases AS c
        JOIN professors AS p ON c.id_profesor = p.id
        JOIN dias AS d ON c.id_dia = d.id
        JOIN horarios AS h ON c.id_horario = h.id
        LEFT JOIN turno AS t ON c.id = t.id_clase
        WHERE c.id_dia = ? AND h.hora >= ?
        GROUP BY c.id, p.name, d.nombre_dia, h.hora
        ORDER BY h.hora`, [id_partner, fecha_actual_formatted, idDiaActual, horaActual], (err, lista) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ error: 'Query execution error' });
            }
           
            res.render('reservas/listDias', { lista, fecha_actual, fecha_actual_formatted });
        });
    });
}

function reserva(req, res) {
    const id_clase = req.params.id;
    const id_partner = req.user.id;
    const fecha = new Date().toISOString().split('T')[0]; // toma el dia de hoy y le da formato 
    // ver el tema para reservar con el dia que el usuario busca alternativamente
    
    const data = { id_partner, id_clase, fecha };

    req.getConnection((err, conn) => {
        if (err) {
            return res.status(500).send(err);
        }
        conn.query(
            'SELECT * FROM turno WHERE id_partner = ? AND id_clase = ? AND fecha = ?',
            [id_partner, id_clase, fecha],
            (err, results) => {
                if (err) {
                    return res.status(500).send(err);
                }
                if (results.length > 0) {
                    return res.status(400).send('Ya has reservado esta clase en esta fecha.');
                }
                conn.query('INSERT INTO turno SET ?', [data], (err, result) => {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    const creditosDescontados = 1;
                    conn.query(
                        'UPDATE partners SET creditos = creditos - ? WHERE id = ?',
                        [creditosDescontados, id_partner],
                        (err, updateResult) => {
                            if (err) {
                                return res.status(500).send(err);
                            }

                            res.redirect('/lista');
                        }
                    );
                });
            }
        );
    });
}




function buscar(req, res) {
  const { fecha } = req.body;
  const selectedDate = new Date(fecha + 'T00:00:00');
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fecha_actual = selectedDate.toLocaleDateString('es-ES', options);
  const fecha_actual_formatted = selectedDate.toISOString().split('T')[0];
  const id_partner = req.user.id;

  const diaSemana = selectedDate.getDay();
  const diaMap = {0: 7, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 };
  const idDiaSeleccionado = diaMap[diaSemana];

  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    conn.query(
      `SELECT c.id AS clase_id, p.name AS nombre_profesor, d.nombre_dia, 
       TIME_FORMAT(h.hora, '%H:%i') AS hora, (14 - COUNT(t.id)) AS cupos_disponibles,
       CASE WHEN EXISTS (SELECT 1 FROM turno WHERE id_partner = ? AND id_clase = c.id AND fecha = ?) THEN 1 ELSE 0 END AS reservado
       FROM clases AS c
       JOIN professors AS p ON c.id_profesor = p.id
       JOIN dias AS d ON c.id_dia = d.id
       JOIN horarios AS h ON c.id_horario = h.id
       LEFT JOIN turno AS t ON c.id = t.id_clase AND t.fecha = ?
       WHERE c.id_dia = ?
       GROUP BY c.id, p.name, d.nombre_dia, h.hora
       ORDER BY h.hora`,
      [id_partner, fecha_actual_formatted, fecha_actual_formatted, idDiaSeleccionado],
      (err, lista) => {
        if (err) {
          console.error('Error executing query:', err);
          return res.status(500).json({ error: 'Query execution error' });
        }

        res.render('reservas/listDias', { 
          lista, 
          fecha_actual, 
          fecha_seleccionada: fecha,
          fecha_actual_formatted 
        });
      }
    );
  });
}


 function cancelar(req, res) {
    const id_clase = req.params.id;
    const id_partner = req.user.id; 
    req.getConnection((err, conn) => {
      if (err) {
          return res.status(500).send(err);
      }
      conn.query(
          'DELETE FROM turno WHERE id_partner = ? AND id_clase = ?',[id_partner, id_clase],
          (err, results) => {
              if (err) {
                  return res.status(500).send(err);
              }
              const creditosRestaurados = 1;
                  conn.query(
                      'UPDATE partners SET creditos = creditos + ? WHERE id = ?',[creditosRestaurados, id_partner],
                      (err, updateResult) => {
                          if (err) {
                              return res.status(500).send(err);
                          }

                          res.redirect('/lista');
                      }
                  );
              });
          }
      );

  }
  
function acreditar(req, res) {
  const id = req.params.id;
  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM partners WHERE id = ?',[id], (err, partner) => {
      if(err) {
        res.json(err);
      }
     // console.log(x)
      res.render('tasks/acreditar',{partner}); //res.render('crear/createMateria',{profesores});
    });
  });
}

function acreditarr(req, res) {
  const id = req.params.id;
  const { credit } = req.body;
  
  // Obtener la fecha actual
  const fechaActual = new Date();
  
  // Calcular la fecha de vencimiento (30 días después)
  const fechaVencimiento = new Date(fechaActual);
  fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
  
  // Formatear la fecha de vencimiento en 'YYYY-MM-DD'
  const fechaVencimientoFormatted = fechaVencimiento.toISOString().split('T')[0];

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).send(err);
    }

    // Actualizar los créditos y la fecha de vencimiento en la base de datos
    conn.query('UPDATE partners SET creditos = ?, credit_expiration = ? WHERE id = ?', [credit, fechaVencimientoFormatted, id], (err, partner) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.redirect('/verAlumnos');
    });
  });
}

module.exports = {
    horarios: horarios,
    list: list,
    reserva: reserva,
    cancelar,cancelar,
    buscar:buscar,
    acreditar:acreditar,
    acreditarr:acreditarr

}


