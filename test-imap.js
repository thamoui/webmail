var Imap = require("browserbox");
var propertiesReader = require("properties-reader");

var Promise = require("es6-promise").Promise;

var props = propertiesReader(__dirname + "/.properties");

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


var imap = new Imap(props.get("imap.host"), props.get("imap.port"), {
	auth: {
		user: props.get("imap.user"),
		pass: props.get("imap.password")
	},
	useSecureTransport: props.get("imap.secure")
});

imap.onauth = function() {
	console.log("Authentification réussie");

	imap.listMailboxes().then(function(mailboxes) {
		var dossiers = getTousDossiers(mailboxes.children);
		console.log(dossiers);
		return imap.selectMailbox(dossiers[0].value, { readOnly: true });
	}, function(erreur) {
		console.log("Erreur dans la récupération des dossiers : " + erreur);
	}).then(function(info) {
		return imap.listMessages("1:*", [ "uid", "flags", "body[]" ]);
	}, function(erreur) {
		console.log("Erreur dans la sélection d'un dossier");
	}).then(function(messages) {
		console.log(messages);
	}, function(erreur) {
		console.log("Erreur dans la récupération des messages");
	});

	// imap.listMailboxes(function(erreur, mailboxes) {
	// 	if (erreur) {
	// 		console.log("Erreur dans la récupération des dossiers : " + erreur);
	// 		return;
	// 	}

	// 	var dossiers = getTousDossiers(mailboxes.children);

	// 	imap.selectMailbox(dossiers[0].value, { readOnly: true }, function(erreur, info) {
	// 		if (erreur) {
	// 			console.log("Erreur dans la sélection d'un dossier");
	// 			return;
	// 		}

	// 		imap.listMessages("1:*", [ "uid", "flags", "body[]" ], function(erreur, messages) {
	// 			if (erreur) {
	// 				console.log("Erreur dans la récupération des messages");
	// 				return;
	// 			}

	// 			console.log(messages);
	// 		})
	// 	});
	// });
};

imap.onerror = function(erreur) {
	console.log("Erreur : " + erreur);
};

imap.onclose = function() {
	console.log("Fin de la connexion");
};

imap.onupdate = function(type, value) {

};

imap.connect();