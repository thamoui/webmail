require('useful-date');
require('useful-date/locale/en-US.js');

var dossiers = [
	{ value: "RECEPTION", label: 'Boite de réception' },
	{ value: "ARCHIVES", label: "Archives" },
	{ value: "ENVOYES", label: "Envoyés" },
	{ value: "SPAM", label: "Courrier indésirable" }
];

var contacts = [ "Sangoku", "Chichi", "Bulma", "Krilin", "Tenchinan", "Yamcha", "Tortue Géniale", "Maître Kaio", "Picollo", "Sangohan", "Végéta", "Freezer", "Dendé", "Trunks", "C-16", "C-17", "C-18", "Cell", "Sangoten", "Videl", "Kaio Shin", "Boo" ];
var objet1 = [ "Salut", "Bonjour", "What's up", "Bien ou bien", "Yo", "Quoi de neuf", "Ca va", "Give me news", "Hello", "Qu'est-ce que tu veux" ];
var objet2 = [ "mon cher", "gros", "ma gueule", "man", "mec", "mon vieux", "bro", "vieille branche", "tocard", "grand galopin", "fumier" ];
var contenuMail = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent consectetur elementum leo. Curabitur luctus, magna a tempor sodales, orci velit dictum magna, nec pharetra turpis ante vehicula ante. Sed sed libero suscipit, rutrum ligula vel, tempor lorem. Phasellus pulvinar dolor ac velit porttitor pulvinar. Mauris felis quam, consequat at <b>mauris</b>.";

var idProchainMail = 1;
var emailsParDossier = null;

var rand = function(max) {
	return Math.floor(Math.random() * max);
}

var randInArray = function(arr) {
	return arr[rand(arr.length)];
}

var randDateInLastMonth = function() {
	var date = new Date();
	date.setDate(date.getDate() - rand(30));
	date.setHours(rand(24) - 1);
	date.setMinutes(rand(60) - 1);
	return date;
}

exports.genererMails = function() {
	emailsParDossier = {};
	
	for (var i in dossiers) {
		var valDossier = dossiers[i].value;
		emailsParDossier[valDossier] = [];
		var nbMails = rand(10); // Entre 1 et 10 mails
		for (var j = 0; j < nbMails; j++) {

			var mail = {
				id: idProchainMail,
				from: valDossier == "ENVOYES" ? "Rudy" : randInArray(contacts),
				to: valDossier == "ENVOYES" ? randInArray(contacts) : "Rudy",
				subject: randInArray(objet1) + " " + randInArray(objet2),
				date: randDateInLastMonth(),
				content: contenuMail
			};

			emailsParDossier[valDossier].push(mail);

			idProchainMail++;
		}
	}
};

exports.getDossiers = function(req, res) {
	res.send(dossiers);
};

exports.getDossier = function(req, res) {
	var idDossier = req.params.idDossier;
	var emails = emailsParDossier[req.params.idDossier];

	res.send({ value: idDossier, emails: emails});
}

exports.getMail = function(req, res) {
	var dossier = emailsParDossier[req.params.idDossier];
	var mail = null;
	for (var i in dossier) {
		var unMail = dossier[i];
		if (unMail.id == req.params.idMail) {
			mail = unMail;
		}
	}
	
	res.send(mail);
}

exports.envoiMail = function(req, res) {
	var dossierEnvoyes = emailsParDossier["ENVOYES"];
	var mail = req.body;
	mail.id = idProchainMail;
	dossierEnvoyes.push(mail);

	idProchainMail++;
	res.send({ succes: true, email: req.body });
}