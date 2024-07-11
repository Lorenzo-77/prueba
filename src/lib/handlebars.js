const helpers = {};


helpers.profesor = function(user){
    if (user == "profesor") {
    
        return true;
    }
    else {
        
        return false;
    }
}

helpers.alumno = function(user){
    if (user == "alumno") {
    
        return true;
    }
    else {
        
        return false;
    }
}

helpers.administrador = function(user){
    if (user == "admin") {
    
        return true;
    }
    else {
        
        return false;
    }
}



module.exports = helpers;