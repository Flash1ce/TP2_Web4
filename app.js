'use strict';

var express = require('express');
var app = express();

//Permet de récupérer du JSON dans le corps de la requête
var bodyParser = require('body-parser');
app.use(bodyParser.json());


//importe notre routeur du fichier api.js
var routerApiPokemon = require('./routes/apiPokemons.js');
var routerApiDresseur = require('./routes/apiDresseurs.js');
var routerApiEmprunt = require('./routes/apiEmprunts.js');
//indique à notre app d'utiliser le routeur pour toutes les requêtes à partir de la racine du site web
app.use('/', routerApiPokemon);
app.use('/', routerApiDresseur);
app.use('/', routerApiEmprunt);

// Gestion de l'erreur 404.
app.all('*', function (req, res) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(404).send('Erreur 404 : Ressource inexistante !');
});

// Démarrage du serveur.
app.listen(8090, function () {
    console.log('Serveur sur port ' + this.address().port);
});