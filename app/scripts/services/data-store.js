(function() {
	'use strict';

	angular
		.module('flightsOTP')
		.factory('DataStore', DataStore);

	DataStore.$inject = ['$http', '$q'];

	function DataStore($http, $q) {
		var services = {
			getFlights : getFlights
		};

		return services;

	  /**
	   * @ngdoc function
	   * @name getFlights
	   * @description Get date from a CSV File
	   */
		function getFlights() {
			var deferred = $q.defer();

			$http.get('../../data/flight_delays.csv')
				.success(function(resp, status) {
					deferred.resolve(resp);
				})
				.error(function(error, status) {
					deferred.reject(error);
				});
			return deferred.promise;
		}

	}

})();
