angular.module("Webmail", [ "ngSanitize", "ui.tinymce", "MailServiceRest", "MesFiltres", "MesDirectives" ])
/*.factory('myHttpInterceptor', 
})*/


.config(function($httpProvider, $sceProvider) {
	// $sceProvider.enabled(false);

	$httpProvider.interceptors.push(function($q, $rootScope) {
		var nbReqs = 0;
		return {
			'request': function(config) {
				$rootScope.chargementEnCours = true;
				nbReqs++;
				return config;
			},
			// 'requestError': function(rejection) {
			// },
			'response': function(response) {
				if (--nbReqs == 0) {
					$rootScope.chargementEnCours = false;
				}
				return response;
			},
			'responseError': function(rejection) {
				if (--nbReqs == 0) {
					$rootScope.chargementEnCours = false;
				}
				return $q.reject(rejection);
			}
		};
	});
})
.controller("WebmailCtrl", function($rootScope, $scope, $location, $filter, mailService) {

	// chargement

	$rootScope.chargementEnCours = false;
	
	// tri

	$scope.champTri = null;
	$scope.triDescendant = false;
	$scope.triEmails = function(champ) {
		if ($scope.champTri == champ) {
			$scope.triDescendant = !$scope.triDescendant;
		} else {
			$scope.champTri = champ;
			$scope.triDescendant = false;
		}	
	}

	$scope.cssChevronsTri = function(champ) {
		return {
			glyphicon: $scope.champTri == champ,
			'glyphicon-chevron-up' : $scope.champTri == champ && !$scope.triDescendant,
			'glyphicon-chevron-down' : $scope.champTri == champ && $scope.triDescendant 
		};
	}

	// recherche

	$scope.recherche = null;
	$scope.razRecherche = function() {
		$scope.recherche = null;
	}

	// création d'emails

	$scope.afficherNouveauMail = false;
	

	$scope.envoiMail = function(nouveauMail) {

		mailService.envoiMail(nouveauMail);
		$location.path("/");
		
	}

	// navigation

	$scope.vueCourante = null;
	$scope.dossierCourant = null;
	$scope.emailSelectionne = null;

	$scope.versEmail = function(dossier, email) {
		$location.path("/" + dossier.value + "/" + email.id);
	}

	$scope.selectionDossier = function(valDossier) {

		$scope.dossiers.forEach(function(dossier) {
			if (dossier.value == valDossier) {
				dossier.needsUpdate = false;
			}
		});

		$scope.vueCourante = "vueDossier";
		$scope.dossierCourant = mailService.getDossier(valDossier);
	}

	$scope.selectionEmail = function(valDossier, idEmail) {
		$scope.vueCourante = "vueContenuMail";
		$scope.emailSelectionne = mailService.getMail(valDossier, idEmail);
	};


	$scope.$watch(function() {
		return $location.path();
	}, function(newPath) {
		var tabPath = newPath.split("/");
		if (tabPath.length > 1 && tabPath[1]) {
			if (tabPath[1] == "nouveauMail") {
				$scope.vueCourante = "vueNouveauMail";
				$scope.$broadcast("initFormNouveauMail");
			} else {
				var valDossier = tabPath[1];
				if (tabPath.length > 2) {
					var idMail = tabPath[2];
					$scope.selectionEmail(valDossier, idMail);
				} else {
					$scope.selectionDossier(valDossier);
				}
			}
		} else {
			$scope.vueCourante = null;
		}
	});

	$scope.dossiers = mailService.getDossiers();
	
	var socket = io("http://localhost");
	socket.on("connect", function(data) {
		console.log("Connexion avec le serveur réussie !");
	});
	socket.on("newmail", function(idDossier) {
		console.log("un message est arrivé dans le dossier : " + idDossier);
		if ($scope.dossierCourant && idDossier == $scope.dossierCourant.value) {
			$scope.dossierCourant = mailService.getDossier(idDossier);
		} else {
			for (var i = 0; i < $scope.dossiers.length; i++) {
				var unDossier = $scope.dossiers[i];
				if (unDossier.value == idDossier) {
					unDossier.needsUpdate = true;
				}
			}
			$scope.$apply();
		}
	});
});