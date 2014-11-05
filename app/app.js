'use strict';

// Declare app level module which depends on views, and components
angular.module('blogApp', [
    'ngRoute',
    'myApp.posts',
    'LocalStorageModule'
])
        .config(['$routeProvider', '$httpProvider', 'localStorageServiceProvider', function ($routeProvider, $httpProvider, localStorageServiceProvider) {
                $routeProvider.otherwise({redirectTo: '/posts'});

                $httpProvider.defaults.useXDomain = true;
                $httpProvider.defaults.withCredentials = true;
                //delete $httpProvider.defaults.headers.common["X-Requested-With"];
                $httpProvider.defaults.headers.common["Accept"] = "application/hal+json";
                $httpProvider.defaults.headers.common["Content-Type"] = "application/json";
                
                localStorageServiceProvider.setStorageType('sessionStorage');
            }])
        
        .controller('LoginCtrl', ['$scope', '$http', 'localStorageService', '$q', '$timeout', function ($scope, $http, localStorageService, $q, $timeout) {
                console.log('*************** LoginCtrl');
                        
                var _credentials = localStorageService.get('creds');

                if (angular.isUndefined(_credentials) || _credentials === null)
                {
                    console.log("no credentials in local storage => unauthenticated");
                    $scope.auth = false;
                }
                else
                {
                    console.log("credentials found in local storage => authenticated yyy " + _credentials);
                    $scope.auth = true;
                }

                $scope.login = function (credentials) {
                    console.log('*** logging in ');

                    $http.defaults.headers.common["Authorization"] = 'Basic ' + credentials;

                    //promise to return
                    var deferred = $q.defer();

                    var request = $http.get('http://127.0.0.1:8080/_logic/roles/mine', {});

                    request.success(function (data, status, header, config) {
                        console.log('GET http://127.0.0.1:8080/_logic/roles/mine');
                        
                        if (!angular.isUndefined(data) && data !== null && !angular.isUndefined(data.authenticated) && data.authenticated)
                        {
                            console.log('*** authenticated.');
                            console.log('*** user roles: ' + data.roles);
                            localStorageService.set('creds', credentials);
                            $scope.auth = true;
                            deferred.resolve();
                        }
                        else
                        {
                            console.log('*** authentication failed. wrong credentials.');
                            localStorageService.remove('creds');
                            delete $http.defaults.headers.common["Authorization"];
                            $scope.auth = false;

                            //reject promise
                            deferred.reject('authentication failed..');
                        }
                    });

                    request.error(function (data, status, header, config) {
                        console.log('authentication error');
                        console.log(status);
                        console.log(data);
                        console.log(header);
                        console.log(config);

                        localStorageService.remove('creds');
                        delete $http.defaults.headers.common["Authorization"];
                        $scope.auth = false;

                        //reject promise
                        deferred.reject('authentication failed..');
                    });
                };

                $scope.logout = function () {
                    localStorageService.remove('creds');
                    delete $http.defaults.headers.common["Authorization"];
                    $scope.auth = false;
                };
            }]);