const isLoggedIn = (req, res, next)=> {
    if (req.isAuthenticated()) {
        res.locals.usuarioLogueado = true;
        const usu = req.user.role;
        //console.log(usu);
        return next();
    }
    res.locals.usuarioLogueado = false;
    return res.redirect('/login');
}

const auth = (Permissions) => { //

return (req, res, next) => {
    const usu = req.user.role;
    //console.log(usu);
    if (Permissions.includes(usu)){
        next();
    }
    else {
        res.redirect('/profile')
        }
}
}
module.exports = { isLoggedIn, auth }