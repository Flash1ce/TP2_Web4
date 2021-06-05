'use strict';

var express = require('express');

var routerApiDresseur = express.Router();
var url_base = "http://localhost:8090";
//ORM Mongoose
var mongoose = require('mongoose');
// Connexion à MongoDB avec Mongoose
mongoose.connect('mongodb://localhost:27017/pokecenter', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 10
});

//Importation de modèle Dresseur
var DresseurModel = require('../models/dresseurModels').DresseurModel;
// Importation de modèle Pokemon 
var PokemonModel = require('../models/pokemonModels').PokemonModel;

// Création d'un dresseur
// =======================================================
routerApiDresseur.route('/dresseur')
    // Création d'un dresseur.
    .post(function (req, res) {
        console.log('création du dresseur ' + req.body.nom);

        //création du modèle à partir du body de la requête
        var nouveauDresseur = new DresseurModel(req.body);

        //on sauvegarde dans la BD
        nouveauDresseur.save(function (err) {
            if (err) throw err;

            // Retourne 201, location et le dresseur.
            res.status(201).location(url_base + '/dresseurs/' + nouveauDresseur._id).json(nouveauDresseur);
        });
    })
    // Tout les autres méthode qui ne sont pas préciser.
    .all(function (req, res) {
        console.log('Méthode HTTP non autorisé.');
        res.status(405).end();
    });

// Route de consultation des dresseurs
// =======================================================
routerApiDresseur.route('/dresseurs')
    // Consultation de tous les dresseurs
    .get(function (req, res) {
        console.log('consultation de tous les dresseurs');

        DresseurModel.find({}, function (err, dresseurs) {
            if (err) throw err;
            res.status(200).json(dresseurs);
        });
    })
    // Tout les autres méthode qui ne sont pas préciser.
    .all(function (req, res) {
        console.log('Méthode HTTP non autorisé.');
        res.status(405).end();
    });

routerApiDresseur.route('/dresseurs/:dresseur_id')
    // Consultation d'un dresseur avec sont l'id :dresseur_id.
    .get(function (req, res) {
        console.log('Consultation du dresseur ayant l\'id : ' + req.params.dresseur_id);

        DresseurModel.findById(req.params.dresseur_id, function (err, dresseur) {
            if (err) throw err;
            if (dresseur) res.status(200).json(dresseur);
            else res.status(404).end();
        });
    })
    // Modification du dresseur ayant l'id :dresseur_id.
    .put(function (req, res) {
        console.log('Modification du dresseur ayant l\'id : ' + req.params.dresseur_id);

        DresseurModel.findById(req.params.dresseur_id, function (err, dresseur) {
            if (err) throw err;

            // Valider si le dresseur rechercher existe pas, ont doit le créer.
            if (dresseur === null) {
                // création du dresseur.
                console.log("Création du dresseur no:" + req.params.dresseur_id);

                var nouveauDresseur = new DresseurModel(req.body);

                nouveauDresseur.save(function (err) {
                    if (err) throw err;

                    res.status(201).json(nouveauDresseur);
                });
            } else {
                // Modification du dresseur.
                console.log("Modification du dresseur no:" + req.params.dresseur_id);

                DresseurModel.findByIdAndUpdate(req.params.dresseur_id, req.body, {
                    new: true,
                    runValidators: true
                }, function (err, dresseur) {
                    if (err) throw err;

                    res.status(200).json(dresseur);
                });
            }
        }); // fin du findById
    }) // fin du put
    // Suppression d'un dresseur ayant l'id :dresseur_id.
    .delete(function (req, res) {
        console.log('Suppresion du dresseur ayant l\'id : ' + req.params.dresseur_id);

        // Suppression du dresseur.
        DresseurModel.findByIdAndDelete(req.params.dresseur_id, function (err) {
            if (err) throw err;

            // Création du filter : pokémon doit avoir un emprunt et l'emprunt doi avoir l'id du dresseur.
            var filter = {
                $and: [{
                    emprunt: {
                        $exists: true
                    }
                }, {
                    'emprunt.dresseurId': req.params.dresseur_id
                }]
            };

            PokemonModel.find(filter, function (err, pokemons) {
                if (err) throw err;
                if (pokemons) {
                    // Boucle sur tout les pokémons qui sont emprunté par le dresseur qui est supprimer.
                    pokemons.forEach(pokemon => {
                        // Supprime l'emprunt du pokémon.
                        pokemon.emprunt = undefined;
                        pokemon.save();
                    });
                }
            });
            res.status(204).end();
        });
    }) // fin du delete
    // Tout les autres méthode qui ne sont pas préciser.
    .all(function (req, res) {
        console.log('Méthode HTTP non autorisé.');
        res.status(405).end();
    });

// Consulter tout les emprunt pour un desseur.
// =======================================================================
routerApiDresseur.route('/dresseurs/:dresseur_id/pokemons')
    // Permet de consulter tous les Pokémons empruntés par le dresseur ayant l’id « dresseur_id »
    .get(function (req, res) {
        // Création du filter : pokémon doit avoir un emprunt et l'emprunt doi avoir l'id du dresseur.
        var filter = {
            $and: [{
                emprunt: {
                    $exists: true
                }
            }, {
                'emprunt.dresseurId': req.params.dresseur_id
            }]
        };

        // Recherche des pokémons du dresseur.
        PokemonModel.find(filter, function (err, pokemons) {
            if (err) throw err;
            if (pokemons) res.status(200).json(pokemons); // La liste des pokémon du dresseur.
            else res.status(404).end(); // Le dresseur n'as pas de pokémon
        });
    })
    // Tout les autres méthode qui ne sont pas préciser.
    .all(function (req, res) {
        console.log('Méthode HTTP non autorisé.');
        res.status(405).end();
    });

//exportation de routerAPI
module.exports = routerApiDresseur;