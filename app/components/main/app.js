'use strict';

// Declare app level module which depends on views, and components
angular.module('blogApp', [
    'ngRoute',
    'blogApp.auth',
    'blogApp.posts',
    'blogApp.edit',
    'LocalStorageModule',
    'textAngular'
])
        .config(['$routeProvider', '$httpProvider', 'localStorageServiceProvider', function ($routeProvider, $httpProvider, localStorageServiceProvider) {
                $routeProvider.otherwise({redirectTo: '/posts'});

                $httpProvider.defaults.useXDomain = true;
                $httpProvider.defaults.withCredentials = true;
                //delete $httpProvider.defaults.headers.common["X-Requested-With"];
                $httpProvider.defaults.headers.common["Accept"] = "application/hal+json";
                $httpProvider.defaults.headers.common["Content-Type"] = "application/json";
                $httpProvider.defaults.headers.common["No-Auth-Challenge"] = "true";
                
                localStorageServiceProvider.setStorageType('sessionStorage');
                localStorageServiceProvider.setPrefix('rh-blog');
            }]);