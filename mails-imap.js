var Imap = require("browserbox");
var propertiesReader = require("properties-reader");
var MailParser = require("mailparser").MailParser;

var Promise = require("es6-promise").Promise;

var props = propertiesReader(__dirname + "/.properties");

var connexionSimple = null;
var connexionsDossiers = {};

var io = null;

exports.setIo = function(obj) {
	io = obj;
}

function formatNomEmail(users) {
	return users.map(function(user) {
		return user.name ? user.name : user.address
	}).join(", ");
}

function getTousDossiers(dossiers) {
	var tousDossiers = [];

	dossiers.forEach(function(item) {
		var path = item.path;
		var nom = item.name == "INBOX" ? "Boite de réception" : item.name;
		tousDossiers.push({
			label: nom,
			value: path
		});
		if (item.children && item.children.length > 0) {
			tousDossiers = tousDossiers.concat(getTousDossiers(item.children));
		}
	});

	return tousDossiers;
}

function getConnexion(callbackSucces, callbackErreur) {
	var imap = new Imap(props.get("imap.host"), props.get("imap.port"), {
		auth: {
			user: props.get("imap.user"),
			pass: props.get("imap.password")
		},
		useSecureTransport: props.get("imap.secure")
	});

	imap.connect();

	imap.onauth = callbackSucces;

	imap.onerror = callbackErreur;

	imap.onclose = function() {
		console.log("Fin de la connexion");
	};

	return imap;
}

exports.connexionSimple = function(req, res, next) {
	if (connexionSimple && connexionSimple.authenticated) {
		console.log("Connexion existante");
		req.connexionImap = connexionSimple;
		next();
	} else {
		console.log("Connexion à créer");
		var connexion = getConnexion(function() {
			req.connexionImap = connexion;
			connexionSimple = connexion;
			next();
		}, function(erreur) {
			res.status(503).send("Impossible de se connecter au serveur IMAP : " + erreur);
			connexion.close();
		});
	}

}

exports.connexionDossier = function(req, res, next) {
	var idDossier = req.params.idDossier;
	var connexionDossier = connexionsDossiers[idDossier];

	if (connexionDossier && connexionDossier.authenticated && connexionDossier.selectedMailbox == idDossier) {
		console.log("Connexion dossier existante");
		req.connexionImap = connexionDossier;
		next();
	} else {
		var connexion = getConnexion(function() {

			connexion.selectMailbox(idDossier, { readOnly: true }).then(function(info) {

				connexion.onupdate = function(type, valeur) {
					if (type == "exists") {
						info.exists = valeur;

						io.emit("newmail", idDossier);
					} else if (type == "expunge") {
						info.exists--;
					}
				};

				connexion.mailbox = info;
				req.connexionImap = connexion;
				connexionsDossiers[idDossier] = connexion;
				next();
			}, function(erreur) {
				res.status(404).send("Le dossier demandé est introuvable : " + erreur);
				connexion.close();
			})

		}, function(erreur) {
			res.status(503).send("Impossible de se connecter au serveur IMAP : " + erreur);
			connexion.close();
		});
	}
}

exports.getDossiers = function(req, res) {
	var imap = req.connexionImap;

	imap.listMailboxes().then(function(mailboxes) {
		var dossiers = getTousDossiers(mailboxes.children);
		res.send(dossiers);
	}, function(erreur) {
		console.log("Erreur dans la récupération des dossiers : " + erreur);
	})

}

exports.getDossier = function(req, res) {
	var imap = req.connexionImap;
	var idDossier = req.params.idDossier;

	if (imap.mailbox.exists == 0) {
		res.send({ value: idDossier, emails: [] });
		return;
	}

	imap.listMessages("1:*", [ "uid", "flags", "envelope" ]).then(function(messages) {
		var emails = messages.map(function(msg) {
			return {
				id: msg.uid,
				from: formatNomEmail(msg.envelope.from),
				to: formatNomEmail(msg.envelope.to),
				subject: msg.envelope.subject,
				date: new Date(msg.envelope.date)
			};
		})

		res.send({ value: idDossier, emails: emails });

	}, function(erreur) {
		res.status(500).send("Une erreur s'est produite lors de la récupération des mails : " + erreur);
		imap.close();
	});
}

exports.getMail = function(req, res) {
	var imap = req.connexionImap;
	var idDossier = req.params.idDossier;
	var idMail = req.params.idMail;

	imap.listMessages(idMail, [ "uid", "flags", "envelope", "bodystructure", "body[]" ], { byUid: true }).then(function(messages) {
		var msg = messages[0];

		var mp = new MailParser();

		mp.on("end", function(emailParse) {
			res.send({
				id: msg.uid,
				from: formatNomEmail(msg.envelope.from),
				to: formatNomEmail(msg.envelope.to),
				subject: msg.envelope.subject,
				date: new Date(msg.envelope.date),
				content: emailParse.html ? emailParse.html : emailParse.text
			});
		})

		mp.write(msg['body[]']);
		mp.end();			

	}, function(erreur) {
		res.status(500).send("Une erreur s'est produite lors de la récupération des mails : " + erreur);
	});
}