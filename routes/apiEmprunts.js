'use strict';

var express = require('express');

var routerApiEmprunt = express.Router();

//ORM Mongoose
var mongoose = require('mongoose');
// Connexion à MongoDB avec Mongoose
mongoose.connect('mongodb://localhost:27017/pokecenter', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 10
});

//Importation de modèle Pokemon
var PokemonModel = require('../models/pokemonModels').PokemonModel;

// pour UN emprunt
// =======================================================
routerApiEmprunt.route('/pokemons/:pokemon_id/emprunt')
    //Consultation d'un emprunt
    .get(function (req, res) {
        console.log('consultation de l\'emprunt du pokemon no: ' + req.params.pokemon_id);

        PokemonModel.findById(req.params.pokemon_id, function (err, pokemon) {
            if (err) throw err;
            // Vérification si le pokemon existe et si il est emprunté.
            if (pokemon && pokemon.emprunt)
                // Le pokémon existe et est emprunté.
                res.status(200).json(pokemon.emprunt);
            else {
                // Le pokémon est disponible ou n'existe pas.
                res.status(404).end();
            }
        });
    })
    // Permet de créer ou modifier l’emprunt sur le Pokémon ayant l’id « pokemon_id » 
    // (l’associer à un dresseur et le rendre non-disponible)
    .put(function (req, res) {
        console.log('Création ou modification de l\'emprunt du pokémon ayant l\'id : ' + req.params.pokemon_id);
        PokemonModel.findById(req.params.pokemon_id, function (err, pokemon) {
            if (err) throw err;

            // Validé si le pokémon a un emprunt.
            if (pokemon.emprunt === undefined) {
                console.log('L\'emprunt est créé.');
                // Récupère le pokémons avec sont id, puis lui créé un emprunt.
                PokemonModel.findByIdAndUpdate(req.params.pokemon_id, {
                    "emprunt": req.body
                }, {
                    new: true,
                    runValidators: true
                }, function (err, pokemon) {
                    if (err) throw err;
                    res.status(201).json(pokemon.emprunt);
                });
            } else {
                console.log('L\'emprunt est modifié.');
                // Récupère le pokémons avec sont id, puis lui modifie sont un emprunt.
                PokemonModel.findByIdAndUpdate(req.params.pokemon_id, {
                    "emprunt": req.body
                }, {
                    new: true,
                    runValidators: true
                }, function (err, pokemon) {
                    if (err) throw err;
                    res.status(200).json(pokemon.emprunt);
                });
            }
        });
    }) // fin du put
    // Permet de supprimer l’emprunt d’un Pokémon (il redevient disponible)
    .delete(function (req, res) {
        console.log('Supprimer l\'emprunt du pokemon ayant l\'id : ' + req.params.pokemon_id);
        PokemonModel.findById(req.params.pokemon_id, function (err, pokemon) {
            if (err) throw err;

            // Validé si le pokémon existe et a un emprunt.
            if (pokemon && pokemon.emprunt) {
                console.log('L\'emprunt est supprimé.');

                // Supprime l'emprunt.
                pokemon.emprunt = undefined;
                pokemon.save();

                res.status(204).end();
            } else {
                // Le pokemon n'existe pas ou n'a pas d'emprunt.
                res.status(404).end();
            }
        });
    })
    // Tout les autres méthode qui ne sont pas préciser.
    .all(function (req, res) {
        console.log('Méthode HTTP non autorisé.');
        res.status(405).end();
    });

// exportation de routerAPI
module.exports = routerApiEmprunt;