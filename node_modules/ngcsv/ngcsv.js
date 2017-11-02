// todo: options for header and delimiter (other csv types)

(function(){

  'use strict';

  angular.module('ngcsv',[])
  .service('$csv',function(){

    var service = {};

    // Convert CSV string to JSON
    service.convertStringToJson = function (csvString) {

      var rows    = [];
      var json    = [];
      var headers = [];

      // Explode csvString to rows array based on newline character
      rows  = csvString.match(/[^\r\n]+/g);

      // Get headers from first row
      headers   = rows[0].replace(/"/g,"").split(',');
      // console.log(headers);

      // Iterate each rows, explode its properties
      // Convert to JSON
      for (var i = 1; i < rows.length; i++) {

        var params  = [];
        var element = {};

        params  = rows[i].replace(/"/g,"").split(',');
        for (var j = 0; j < params.length; j++) {
          if (headers[j] === "CRS_DEP_TIME" || headers[j] === "CRS_ARR_TIME") {
            params[j] = params[j].substr(0, params[j].length-2) + ":" + params[j].substr(params[j].length-2);
          }
          element[ headers[j]? headers [j] : 'other' ] = params[j];
        }

        json.push( element );

      }

      return json;

    };

    return service;

  });

})();
