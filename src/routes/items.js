const express = require('express');
const ItemsController = require('../controllers/ItemsController');
const { isLoggedIn, auth } = require('../lib/auth');
const router = express.Router();

router.get('/', (req, res) => {
        res.render('galeria/index');
});

//Profesores ABM
router.get('/verProfesores',isLoggedIn,auth("admin"), ItemsController.verusuariosProfe);
router.get('/editar/:id',isLoggedIn,auth("admin"), ItemsController.updateUserProfe);
router.post('/editar/:id',isLoggedIn,auth("admin"), ItemsController.updateUserProfe2);
router.get('/eliminar/:id',isLoggedIn,auth("admin"), ItemsController.deleteUserProfe );
router.post('/eliminar/:id',isLoggedIn,auth("admin"), ItemsController.deleteUserProfe2);
//Alumnos ABM
router.get('/verAlumnos',isLoggedIn,auth("admin"), ItemsController.verusuariosAlum);
router.get('/editarr/:id',isLoggedIn,auth("admin"), ItemsController.updateUserAlum);
router.post('/editarr/:id',isLoggedIn,auth("admin"), ItemsController.updateUserAlum2);
router.get('/eliminarr/:id',isLoggedIn,auth("admin"), ItemsController.deleteUserAlum);
router.post('/eliminarr/:id',isLoggedIn,auth("admin"), ItemsController.deleteUserAlum2);

module.exports = router;