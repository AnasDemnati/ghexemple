(function () {
  'use strict';
  /**
   * @ngdoc function
   * @name flightsOTP.controller:ChartCtrl
   * @description
   * # ChartCtrl
   * Controller of the flightsOTP Stats view
   */
  angular
    .module('flightsOTP')
    .controller('ChartCtrl', chartCtrl);

    chartCtrl.$inject = ['DataStore', '$scope', '$timeout', '$stateParams', '$filter', '$csv'];

    function chartCtrl (DataStore, $scope, $timeout, $stateParams, $filter, $csv) {
      $scope.delaysArray = [];
      $scope.delaysRatioArray = [];
      $scope.departureTimeArray = [];
      $scope.delayDistanceArray = [];
      $scope.selectedOrigin = $stateParams.selectedOrigin;
      $scope.selectedDest = $stateParams.selectedDest;

      DataStore.getFlights()
        .then(function(flightsCSV) {
          return convertCsvToJson(flightsCSV);
        })
        .then(function(flightsJSON) {
          return filterByOrgDest(flightsJSON, $scope.selectedOrigin, $scope.selectedDest);
        })
        .then(function(filteredFlights) {
          $scope.filteredFlights = filteredFlights;
          $scope.maxFlightsPerDay = 0;

          getDateAndTime(function () {
            $scope.bar = {
              labels: $scope.dayArray,
              series: [],
              data: getDelays(),
              options: {
                scales: {
                  xAxes: [{
                    stacked: true,
                    barPercentage: 1.0,
                    categoryPercentage: 1.0,
                    scaleLabel: {
                        display: true,
                        labelString: 'Day and Time'
                    }
                  }],
                  yAxes: [{
                      stacked: false,
                      scaleLabel: {
                          display: true,
                          labelString: 'Delay (Minutes)'
                      }
                  }]
                },
                scaleBeginAtZero: false,
                pan: {
                  enabled: true,
                  mode: 'x',
                  rangeMin: {
                    x: 10000,
                    y: 200
                  }
                },
                zoom: {
                  enabled: true,
                  mode: 'x'
                },
                responsive: true,
                legend: {
                    position: 'top',
                    display: false
                },
                tooltips: {
                  enabled: true,
                  mode: 'x',
                  callbacks: {
                    label: function(tooltipItem, data) {
                      var label = data.labels[tooltipItem.index];
                      var datasetLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                      var timeLabel = $scope.inversedDepartureTimeArray[tooltipItem.datasetIndex][tooltipItem.index];
                      if (timeLabel === "undefined" || timeLabel === undefined || timeLabel === null) {
                        timeLabel = "N/A";
                      } else {
                        timeLabel = timeLabel.replace(":", "h");
                      }

                      if (!isNaN(datasetLabel)) {
                        datasetLabel += ' Mins';
                      } else {
                        datasetLabel = "N/A";
                      }

                      return timeLabel + ' : ' + datasetLabel;
                    }
                  }
                }
              }
            };

            $scope.barRatio = {
              labels: $scope.dayArray,
              series: [],
              data: getDelaysRatio(),
              options: {
                scales: {
                  xAxes: [{
                    stacked: true,
                    barPercentage: 1.0,
                    categoryPercentage: 1.0,
                    scaleLabel: {
                        display: true,
                        labelString: 'Day and Time'
                    }
                  }],
                  yAxes: [{
                      stacked: false,
                      scaleLabel: {
                          display: true,
                          labelString: 'Delay ratio (%)'
                      }
                  }]
                },
                scaleBeginAtZero: false,
                pan: {
                  enabled: true,
                  mode: 'x',
                  rangeMin: {
                    x: 10000,
                    y: 200
                  }
                },
                zoom: {
                  enabled: true,
                  mode: 'x'
                },
                responsive: true,
                legend: {
                    position: 'top',
                    display: false
                },
                tooltips: {
                  enabled: true,
                  mode: 'x',
                  callbacks: {
                    label: function(tooltipItem, data) {
                      var label = data.labels[tooltipItem.index];
                      var datasetLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                      var timeLabel = $scope.inversedDepartureTimeArray[tooltipItem.datasetIndex][tooltipItem.index];
                      if (timeLabel === "undefined" || timeLabel === undefined || timeLabel === null) {
                        timeLabel = "N/A";
                      } else {
                        timeLabel = timeLabel.replace(":", "h");
                      }
                      if (!isNaN(datasetLabel)) {
                        datasetLabel += ' %';
                      } else {
                        datasetLabel = "N/A";
                      }
                      return timeLabel + ' : ' + datasetLabel;
                    }
                  }
                }
              }
            };

            $scope.scatter = {
              labels: [],
              series: [],
              data: [
                $scope.delayDistanceArray
              ],
              options: {
                scales: {
                  xAxes: [{
                    stacked: true,
                    barPercentage: 1.0,
                    categoryPercentage: 1.0,
                    scaleLabel: {
                        display: true,
                        labelString: 'Distance (Km)'
                    }
                  }],
                  yAxes: [{
                      stacked: true,
                      scaleLabel: {
                          display: true,
                          labelString: 'Delay (Minutes)'
                      }
                  }]
                },
                scaleBeginAtZero: false,
                pan: {
                  enabled: true,
                  mode: 'xy',
                  rangeMin: {
                    x: 1000,
                    y: 200
                  }
                },
                zoom: {
                  enabled: true,
                  mode: 'xy'
                },
                responsive: true,
                legend: {
                    position: 'top',
                    display: false
                },
                tooltips: {
                  enabled: true,
                  mode: 'single',
                  callbacks: {
                    label: function(tooltipItem, data) {
                      var datasetLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];

                      return 'Distance : ' + datasetLabel.x + ', Delay : ' + datasetLabel.y;
                    }
                  }
                }
              }
            };

            $scope.overAllDelayRatio = getOverAllDelayRatio();
          });
        })
        .catch(function(err) {
            console.error(err);
        });

      /**
       * @ngdoc function
       * @name filterByOrgDest
       * @param JSON Array flights data
       * @param String Flight origin
       * @param String Flight destination
       * @description Fliters the flights that have the same pair of origin and destination
       * @return JSON Array
       */
      function filterByOrgDest (flightsJSON, org, dest) {
        var filteredFlights = [];

        flightsJSON.forEach(function (flightObj) {
         if (flightObj.ORIGIN === org && flightObj.DEST === dest) {
           filteredFlights.push(flightObj);
         }
        });

        return filteredFlights;
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

      /**
       * @ngdoc function
       * @name getDateAndTime
       * @param Callback function
       * @description Store in scope all the dates from data
       */
      function getDateAndTime (callback) {
        $scope.dayArray = [];

        $scope.filteredFlights.forEach(function (flightObj) {
          var flDate = $filter('date')(flightObj.FL_DATE, "dd-MM-yyyy");
          if ($scope.dayArray.indexOf(flDate) === -1) {
            $scope.dayArray.push(flDate);
            prepareData(flightObj.FL_DATE);
          }
        });

        callback();
      }

      /**
       * @ngdoc function
       * @name getOverAllDelayRatio
       * @description Calculate overall ratio of the selected pairs origin and destination
       * @return Float value
       */
      function getOverAllDelayRatio () {
        var sumRatio = 0, numOfRatios = 0;

        $scope.delaysRatioArray.forEach(function (lvloneArray) {
          lvloneArray.forEach(function (ratio) {
            if (!isNaN(ratio) && ratio !== null) {
              sumRatio += parseFloat(ratio);
              numOfRatios++;
            }
          });
        });
        sumRatio /= numOfRatios;

        return (isNaN(sumRatio)? "N/A" : sumRatio.toFixed(2));
      }

      /**
       * @ngdoc function
       * @name prepareData
       * @param date
       * @description Prepares the delays, ratio and distance array
       */
      function prepareData (flDate) {
        var delays = [], delaysRatio = [], departureTime = [], percentValue;

        $scope.filteredFlights.forEach(function (flightObj) {
          if (flightObj.FL_DATE === flDate) {
            percentValue = (parseInt(flightObj.ARR_DELAY) / parseInt(flightObj.CRS_ELAPSED_TIME))*100;
            delays.push(parseInt(flightObj.ARR_DELAY));
            delaysRatio.push(percentValue.toFixed(2));
            departureTime.push(flightObj.CRS_DEP_TIME);
            $scope.delayDistanceArray.push({
              x: flightObj.DISTANCE,
              y: flightObj.ARR_DELAY,
              r: 5
            });
          }
        });

        $scope.maxFlightsPerDay = ($scope.maxFlightsPerDay > delays.length)? $scope.maxFlightsPerDay : delays.length;

        $scope.delaysArray.push(delays);
        $scope.delaysRatioArray.push(delaysRatio);
        $scope.departureTimeArray.push(departureTime);
        $scope.inversedDepartureTimeArray = [];
        $scope.inversedDepartureTimeArray = inverseData ($scope.departureTimeArray, $scope.inversedDepartureTimeArray);
      }

      /**
       * @ngdoc function
       * @name inverseData
       * @param array
       * @param array
       * @description inverse array to suit the chart input
       * @return Array
       */
      function inverseData (dataArray, inversedDataArray) {

        dataArray.forEach(function (lvlOneItem, lvlOneIndex) {
          if (lvlOneItem.length < $scope.maxFlightsPerDay) {
            var i = lvlOneItem.length;

            while (i < $scope.maxFlightsPerDay) {
              lvlOneItem[i] = null;
              i++;
            }

          }

          lvlOneItem.forEach(function (lvlTwoItem, lvlTwoIndex) {
            if (inversedDataArray[lvlTwoIndex] === undefined) {
              inversedDataArray[lvlTwoIndex] = [];
            }
            inversedDataArray[lvlTwoIndex][lvlOneIndex] = lvlTwoItem;
          });
        });

        return inversedDataArray;
      }

      /**
       * @ngdoc function
       * @name getDelays
       * @description Call inverse function
       * @return Array
       */
      function getDelays () {
        $scope.inversedDelaysArray = [];

        $scope.inversedDelaysArray = inverseData ($scope.delaysArray, $scope.inversedDelaysArray);

        return $scope.inversedDelaysArray;
      }

      /**
       * @ngdoc function
       * @name getDelaysRatio
       * @description Call inverse function
       * @return Array
       */
      function getDelaysRatio () {
        $scope.inversedDelaysRatioArray = [];

        $scope.inversedDelaysRatioArray = inverseData ($scope.delaysRatioArray, $scope.inversedDelaysRatioArray);

        return $scope.inversedDelaysRatioArray;
      }
    }
})();
