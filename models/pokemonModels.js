//ORM Mongoose
var mongoose = require('mongoose');


//création du schéma emprunt
var empruntSchema = new mongoose.Schema({
    dresseurId: {
        type: String,
        required: true
    },
    dateRetour: {
        type: Date,
        required: true
    },
}, {
    _id: false
});

//création du schéma pokemon
// pas besoin de spécifier un _id, mongoose le fera pour nous ! 
var pokemonSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    emprunt: empruntSchema
});

// Crée le modèle à partir du schéma et l'Exporte pour pouvoir l'utiliser dans le reste du projet
module.exports.PokemonModel = mongoose.model('Pokemon', pokemonSchema);