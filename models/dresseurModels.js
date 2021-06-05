// ORM mongoose
var mongoose = require('mongoose');


// Création du shéma Dresseur
var dresseurSchema = new mongoose.Schema({
    nom: {
        type: String,
        require: true
    },
    prenom: {
        type: String,
        require: true
    },
    ddn: {
        type: String,
        require: true
    }
});

// Crée le modèle à partir du schéma et l'Exporte pour pouvoir l'utiliser dans le reste du projet
module.exports.DresseurModel = mongoose.model('Dresseur', dresseurSchema);