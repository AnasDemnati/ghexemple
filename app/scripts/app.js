'use strict';
/**
 * @ngdoc overview
 * @name flightsOTP
 * @description
 * # flightsOTP
 *
 * Main module of the application.
 */
angular
  .module('flightsOTP', [
    'oc.lazyLoad',
    'ui.router',
    'ui.bootstrap',
    'angular-loading-bar',
    'ngcsv',
  ])
  .config(['$stateProvider','$urlRouterProvider','$ocLazyLoadProvider',function ($stateProvider,$urlRouterProvider,$ocLazyLoadProvider) {

    $ocLazyLoadProvider.config({
      debug:false,
      events:true,
    });

    $urlRouterProvider.otherwise('/dashboard/home');

    $stateProvider
      .state('dashboard', {
        url:'/dashboard',
        templateUrl: 'views/dashboard/main.html',
        resolve: {
          loadMyDirectives:function($ocLazyLoad){
            return $ocLazyLoad.load(
            {
                name:'flightsOTP',
                files:[
                  'scripts/directives/header/header.js',
                  'scripts/directives/dashboard/stats/stats.js'
                ]
            }),
            $ocLazyLoad.load(
            {
               name:'toggle-switch',
               files:["bower_components/angular-toggle-switch/angular-toggle-switch.min.js",
                      "bower_components/angular-toggle-switch/angular-toggle-switch.css"
                  ]
            }),
            $ocLazyLoad.load(
            {
              name:'ngAnimate',
              files:['bower_components/angular-animate/angular-animate.js']
            })
            $ocLazyLoad.load(
            {
              name:'ngCookies',
              files:['bower_components/angular-cookies/angular-cookies.js']
            })
            $ocLazyLoad.load(
            {
              name:'ngResource',
              files:['bower_components/angular-resource/angular-resource.js']
            })
            $ocLazyLoad.load(
            {
              name:'ngSanitize',
              files:['bower_components/angular-sanitize/angular-sanitize.js']
            })
            $ocLazyLoad.load(
            {
              name:'ngTouch',
              files:['bower_components/angular-touch/angular-touch.js']
            })
          }
      }
  })
      .state('dashboard.home',{
        url:'/home',
        controller: 'MainCtrl',
        templateUrl:'views/dashboard/home.html',
        resolve: {
          loadMyFiles:function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name:'flightsOTP',
              files:[
              'scripts/controllers/main.js',
              'scripts/services/data-store.js'
              ]
            });
          }
        }
      })
      .state('dashboard.chart', {
        templateUrl:'views/chart.html',
        url:'/chart/:selectedOrigin/:selectedDest',
        controller:'ChartCtrl',
        resolve: {
          loadMyFile:function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name:'chart.js',
              files:[
                'bower_components/chart.js/dist/Chart.min.js',
                'bower_components/angular-chart.js/dist/angular-chart.min.js',
                'bower_components/chartjs-plugin-zoom/chartjs-plugin-zoom.min.js'
              ]
            }),
            $ocLazyLoad.load({
                name:'flightsOTP',
                files:[
                  'scripts/controllers/chartContoller.js',
                  'scripts/services/data-store.js'
                ]
            });
          }
        }
      });
  }]);
