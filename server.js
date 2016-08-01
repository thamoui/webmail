var http = require("http");
var fs = require("fs");

var mime = require("mime");

var express = require("express");

var serviceRecupMails = require(__dirname + "/mails-imap.js");
var serviceEnvoiMails = require(__dirname + "/mails-smtp.js");

// middlewares
var logger = require("morgan");
var serveStatic = require("serve-static");
var favicon = require("serve-favicon");
var bodyParser = require("body-parser");

var PORT = 80;

var app = express();

app.use(favicon(__dirname + "/app/favicon.ico"));
app.use(logger(":method :url"));
app.use(serveStatic(__dirname + "/app"));

app.use(bodyParser.json());

// API

var api = express();

// Envoyer un mail
// POST /api/envoi
api.post("/envoi", serviceEnvoiMails.envoiMail);

// api.use(serviceRecupMails.connexion);

// Récupérer la liste des dossiers
// GET /api/dossiers
api.get("/dossiers", serviceRecupMails.connexionSimple);
api.get("/dossiers", serviceRecupMails.getDossiers);

// Récupérer un dossier
// GET /api/dossiers/idDossier
api.get("/dossiers/:idDossier", serviceRecupMails.connexionDossier);
api.get("/dossiers/:idDossier", serviceRecupMails.getDossier);

// Récupérer un mail
// GET /api/dossiers/idDossier/idMail
api.get("/dossiers/:idDossier/:idMail", serviceRecupMails.connexionDossier);
api.get("/dossiers/:idDossier/:idMail", serviceRecupMails.getMail);


app.use("/api", api);

var server = http.createServer(app).listen(PORT);
var io = require("socket.io")(server);

serviceRecupMails.setIo(io);

console.log("Serveur démarré sur le port " + PORT);