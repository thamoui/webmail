var propertiesReader = require("properties-reader");

var props = propertiesReader(__dirname + "/.properties");

var smtp = require("emailjs");

function getConnexion() {
	return smtp.server.connect({
		user: props.get("smtp.user"),
		password: props.get("smtp.password"),
		host: props.get("smtp.host"),
		port: props.get("smtp.port"),
		ssl: props.get("smtp.secure")
	});
}

exports.envoiMail = function(req, res) {
	var email = req.body;

	var connexion = getConnexion();
	connexion.send({
		from: props.get("email.name") + " <" + props.get("email.address") + ">",
		to: email.to,
		subject: email.subject,
		text: email.content,
		attachment: [
			{ data : email.content, alternative: true }
		]
	}, function(erreur, resultat) {
		if (erreur) {
			res.status(500).send("Une erreur s'est produite lors de l'envoi de l'e-mail : " + erreur);
		} else {
			res.send({ succes: true, email: email });
		}
	});
}