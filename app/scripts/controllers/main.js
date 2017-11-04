(function () {
  'use strict';
  /**
   * @ngdoc function
   * @name flightsOTP.controller:MainCtrl
   * @description
   * # MainCtrl
   * Controller of the flightsOTP Home view
   */
  angular
    .module('flightsOTP')
    .controller('MainCtrl', mainCtrl);

    mainCtrl.$inject = ['$scope', '$state', 'DataStore', '$csv'];

    function mainCtrl ($scope, $state, DataStore, $csv) {
      $scope.chosenOrigin = "Choose origin";
      $scope.chosenDest = "Choose destination";
      $scope.selectedOrigin = $scope.chosenOrigin;
      $scope.selectedDest = $scope.chosenDest;
      $scope.validateInputs = validateInputs;

      function validateInputs () {
        if ($scope.selectedOrigin !== $scope.chosenOrigin && $scope.selectedDest !== $scope.chosenDest) {
          $state.go('dashboard.chart', {selectedOrigin: $scope.selectedOrigin, selectedDest: $scope.selectedDest});
        } else {
          $scope.statsForm.origin.$setValidity("empty", false);
          $scope.statsForm.dest.$setValidity("empty", false);
          $scope.invalidInputs = {
            origin: ($scope.selectedOrigin === $scope.chosenOrigin),
            dest: ($scope.selectedDest === $scope.chosenDest)
          };
        }
      }

  // DataStore call function to get flights data
      DataStore.getFlights()
        .then(function(flightsCSV) {
          return convertCsvToJson(flightsCSV);
        })
        .then(function(flightsJSON) {
          getAllDest(flightsJSON);
        })
        .catch(function(err) {
          console.error(err);
        });

        /**
         * @ngdoc function
         * @name getAllDest
         * @param JSON Array of flights data
         * @description Filters all the airports names and stores it in the scope
         */

      function getAllDest (flightsJSON) {
        $scope.allDestArray = [];

        flightsJSON.forEach(function (flightObj) {
          if ($scope.allDestArray.indexOf(flightObj.ORIGIN) === -1) {
            $scope.allDestArray.push(flightObj.ORIGIN);
          }

          if ($scope.allDestArray.indexOf(flightObj.DEST) === -1) {
            $scope.allDestArray.push(flightObj.DEST);
          }
        });
      }

      /**
       * @ngdoc function
       * @name convertCsvToJson
       * @param CSV flights data
       * @description Converts CSV data to JSON Array
       * @return JSON Array
       */
      function convertCsvToJson (flightsCSV) {
        return $csv.convertStringToJson(flightsCSV);
      }

    }
})();
