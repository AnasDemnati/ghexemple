!function(){"use strict";function chartCtrl(DataStore,$scope,$timeout,$stateParams,$filter,$csv){function filterByOrgDest(flightsJSON,org,dest){var filteredFlights=[];return flightsJSON.forEach(function(flightObj){flightObj.ORIGIN===org&&flightObj.DEST===dest&&filteredFlights.push(flightObj)}),filteredFlights}function convertCsvToJson(flightsCSV){return $csv.convertStringToJson(flightsCSV)}function getDateAndTime(callback){$scope.dayArray=[],$scope.filteredFlights.forEach(function(flightObj){var flDate=$filter("date")(flightObj.FL_DATE,"dd-MM-yyyy");-1===$scope.dayArray.indexOf(flDate)&&($scope.dayArray.push(flDate),prepareData(flightObj.FL_DATE))}),callback()}function getOverAllDelayRatio(){var sumRatio=0,numOfRatios=0;return $scope.delaysRatioArray.forEach(function(lvloneArray){lvloneArray.forEach(function(ratio){isNaN(ratio)||null===ratio||(sumRatio+=parseFloat(ratio),numOfRatios++)})}),sumRatio/=numOfRatios,isNaN(sumRatio)?"N/A":sumRatio.toFixed(2)}function prepareData(flDate){var percentValue,delays=[],delaysRatio=[],departureTime=[];$scope.filteredFlights.forEach(function(flightObj){flightObj.FL_DATE===flDate&&(percentValue=parseInt(flightObj.ARR_DELAY)/parseInt(flightObj.CRS_ELAPSED_TIME)*100,delays.push(parseInt(flightObj.ARR_DELAY)),delaysRatio.push(percentValue.toFixed(2)),departureTime.push(flightObj.CRS_DEP_TIME),$scope.delayDistanceArray.push({x:flightObj.DISTANCE,y:flightObj.ARR_DELAY,r:5}))}),$scope.maxFlightsPerDay=$scope.maxFlightsPerDay>delays.length?$scope.maxFlightsPerDay:delays.length,$scope.delaysArray.push(delays),$scope.delaysRatioArray.push(delaysRatio),$scope.departureTimeArray.push(departureTime),$scope.inversedDepartureTimeArray=[],$scope.inversedDepartureTimeArray=inverseData($scope.departureTimeArray,$scope.inversedDepartureTimeArray)}function inverseData(dataArray,inversedDataArray){return dataArray.forEach(function(lvlOneItem,lvlOneIndex){if(lvlOneItem.length<$scope.maxFlightsPerDay)for(var i=lvlOneItem.length;i<$scope.maxFlightsPerDay;)lvlOneItem[i]=null,i++;lvlOneItem.forEach(function(lvlTwoItem,lvlTwoIndex){void 0===inversedDataArray[lvlTwoIndex]&&(inversedDataArray[lvlTwoIndex]=[]),inversedDataArray[lvlTwoIndex][lvlOneIndex]=lvlTwoItem})}),inversedDataArray}function getDelays(){return $scope.inversedDelaysArray=[],$scope.inversedDelaysArray=inverseData($scope.delaysArray,$scope.inversedDelaysArray),$scope.inversedDelaysArray}function getDelaysRatio(){return $scope.inversedDelaysRatioArray=[],$scope.inversedDelaysRatioArray=inverseData($scope.delaysRatioArray,$scope.inversedDelaysRatioArray),$scope.inversedDelaysRatioArray}$scope.delaysArray=[],$scope.delaysRatioArray=[],$scope.departureTimeArray=[],$scope.delayDistanceArray=[],$scope.selectedOrigin=$stateParams.selectedOrigin,$scope.selectedDest=$stateParams.selectedDest,DataStore.getFlights().then(function(flightsCSV){return convertCsvToJson(flightsCSV)}).then(function(flightsJSON){return filterByOrgDest(flightsJSON,$scope.selectedOrigin,$scope.selectedDest)}).then(function(filteredFlights){$scope.filteredFlights=filteredFlights,$scope.maxFlightsPerDay=0,getDateAndTime(function(){$scope.bar={labels:$scope.dayArray,series:[],data:getDelays(),options:{scales:{xAxes:[{stacked:!0,barPercentage:1,categoryPercentage:1,scaleLabel:{display:!0,labelString:"Day and Time"}}],yAxes:[{stacked:!1,scaleLabel:{display:!0,labelString:"Delay (Minutes)"}}]},scaleBeginAtZero:!1,pan:{enabled:!0,mode:"x",rangeMin:{x:1e4,y:200}},zoom:{enabled:!0,mode:"x"},responsive:!0,legend:{position:"top",display:!1},tooltips:{enabled:!0,mode:"x",callbacks:{label:function(tooltipItem,data){var datasetLabel=(data.labels[tooltipItem.index],data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]),timeLabel=$scope.inversedDepartureTimeArray[tooltipItem.datasetIndex][tooltipItem.index];return timeLabel="undefined"===timeLabel||void 0===timeLabel||null===timeLabel?"N/A":timeLabel.replace(":","h"),isNaN(datasetLabel)?datasetLabel="N/A":datasetLabel+=" Mins",timeLabel+" : "+datasetLabel}}}}},$scope.barRatio={labels:$scope.dayArray,series:[],data:getDelaysRatio(),options:{scales:{xAxes:[{stacked:!0,barPercentage:1,categoryPercentage:1,scaleLabel:{display:!0,labelString:"Day and Time"}}],yAxes:[{stacked:!1,scaleLabel:{display:!0,labelString:"Delay ratio (%)"}}]},scaleBeginAtZero:!1,pan:{enabled:!0,mode:"x",rangeMin:{x:1e4,y:200}},zoom:{enabled:!0,mode:"x"},responsive:!0,legend:{position:"top",display:!1},tooltips:{enabled:!0,mode:"x",callbacks:{label:function(tooltipItem,data){var datasetLabel=(data.labels[tooltipItem.index],data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]),timeLabel=$scope.inversedDepartureTimeArray[tooltipItem.datasetIndex][tooltipItem.index];return timeLabel="undefined"===timeLabel||void 0===timeLabel||null===timeLabel?"N/A":timeLabel.replace(":","h"),isNaN(datasetLabel)?datasetLabel="N/A":datasetLabel+=" %",timeLabel+" : "+datasetLabel}}}}},$scope.scatter={labels:[],series:[],data:[$scope.delayDistanceArray],options:{scales:{xAxes:[{stacked:!0,barPercentage:1,categoryPercentage:1,scaleLabel:{display:!0,labelString:"Distance (Km)"}}],yAxes:[{stacked:!0,scaleLabel:{display:!0,labelString:"Delay (Minutes)"}}]},scaleBeginAtZero:!1,pan:{enabled:!0,mode:"xy",rangeMin:{x:1e3,y:200}},zoom:{enabled:!0,mode:"xy"},responsive:!0,legend:{position:"top",display:!1},tooltips:{enabled:!0,mode:"single",callbacks:{label:function(tooltipItem,data){var datasetLabel=data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];return"Distance : "+datasetLabel.x+", Delay : "+datasetLabel.y}}}}},$scope.overAllDelayRatio=getOverAllDelayRatio()})}).catch(function(err){console.error(err)})}angular.module("flightsOTP").controller("ChartCtrl",chartCtrl),chartCtrl.$inject=["DataStore","$scope","$timeout","$stateParams","$filter","$csv"]}();