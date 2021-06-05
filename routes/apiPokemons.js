'use strict';

var express = require('express');

var routerApiPokemon = express.Router();
var url_base = "http://localhost:8090";
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

//exécuté à chaque requête à l'APi
routerApiPokemon.use(function (req, res, next) {
    //Log les requêtes
    console.log(req.method, req.url);
    //permet de poursuivre le traitement de la requête
    next();
});

// Route de création d'un pokemon
// =======================================================
routerApiPokemon.route('/pokemon')
    .post(function (req, res) {
        console.log('création du pokemon ' + req.body.nom);

        // Création du modèle à partir du body de la requête
        var nouveauPokemon = new PokemonModel(req.body);

        nouveauPokemon.save(function (err) {
            if (err) throw err;

            // Retourne 201, nouveau pokémon et la location.
            res.status(201).location(url_base + '/pokemons/' + nouveauPokemon._id).json(nouveauPokemon);
        });
    })
    // Tout les autres méthode qui ne sont pas préciser.
    .all(function (req, res) {
        console.log('Méthode HTTP non autorisé.');
        res.status(405).end();
    });

// Route de consultation des pokemons
// filtre les Pokémons pour n’afficher que ceux qui sont disponibles ou empruntés.
// Les paramètres ?disponible=true ou =false sont gérez.
// =======================================================
routerApiPokemon.route('/pokemons')
    // Consultation des pokémons disponible, emprunté ou tous.
    .get(function (req, res) {
        // Consultation des pokémons qui sont disponible ?disponible=true
        console.log('consultation de tous les pokemons');
        var filter = {};
        if (req.query.disponible === 'true') filter = {
            emprunt: undefined
        };
        else if (req.query.disponible === 'false') filter = {
            emprunt: {
                $exists: true
            }
        };

        PokemonModel.find(filter, function (err, pokemons) {
            if (err) throw err;
            if (pokemons) res.status(200).json(pokemons);
            else res.status(404).end();
        });
    })
    // Tout les autres méthode qui ne sont pas préciser.
    .all(function (req, res) {
        console.log('Méthode HTTP non autorisé.');
        res.status(405).end();
    });

routerApiPokemon.route('/pokemons/:pokemon_id')
    // Permet de consulter le Pokémons ayant l’id « pokemon_id ».
    .get(function (req, res) {
        console.log('Consultation du pokemon ayant l\'id : ' + req.params.pokemon_id);
        PokemonModel.findById(req.params.pokemon_id, function (err, pokemon) {
            if (err) throw err;
            if (pokemon) res.status(200).json(pokemon);
            else res.status(404).end();
        });
    })
    // Permet de modifier le pokémons ayant l'id « pokemon_id ».
    .put(function (req, res) {
        console.log('Modification ou création du pokémon ayant l\'id : ' + req.params.pokemon_id);
        PokemonModel.findById(req.params.pokemon_id, function (err, pokemon) {
            if (err) throw err;

            // Valider si le pokemon rechercher existe, sinon le créé.
            if (pokemon === null) {
                console.log('création du pokemon : ' + req.body.nom);

                // Création du modèle à partir du body de la requête
                var nouveauPokemon = new PokemonModel(req.body);

                nouveauPokemon.save(function (err) {
                    if (err) throw err;

                    // Retourne 201, nouveau pokémon et la location.
                    res.status(201).location(url_base + '/pokemons/' + nouveauPokemon._id).json(nouveauPokemon);
                });
            } // Si le pokémon existe ont le modifie.
            else {
                // Modification du pokémon.
                console.log('Modification du pokémon ayant l\'id : ' + req.params.pokemon_id);
                PokemonModel.findByIdAndUpdate(req.params.pokemon_id, req.body, {
                    new: true,
                    runValidators: true
                }, function (err, pokemon) {
                    if (err) throw err;
                    res.status(200).json(pokemon);
                });
            }
        });
    }) // fin du put.
    // Permet de supprimer un pokémon ayant l'id « pokemon_id ».
    .delete(function (req, res) {
        // supprimer le pokemons ayant l'id « pokemon_id ».
        console.log('Supprime le pokemon ayant l\'id : ' + req.params.pokemon_id);

        PokemonModel.findByIdAndDelete(req.params.pokemon_id, function (err) {
            if (err) throw err;
            res.status(204).end();
        });
    })
    // Tout les autres méthode qui ne sont pas préciser.
    .all(function (req, res) {
        console.log('Méthode HTTP non autorisé.');
        res.status(405).end();
    });

// exportation de routerAPI
module.exports = routerApiPokemon;