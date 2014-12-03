'use strict';

angular.module('blogApp.auth', ['ngRoute', 'base64'])

        .controller('LoginCtrl', ['$scope', '$routeParams', '$location', '$http', 'localStorageService', '$q', '$base64', function ($scope, $routeParams, $location, $http, localStorageService, $q, $base64) {
                console.log('*************** LoginCtrl');

                $scope.isLoggedin = function () {
                    var _credentials = localStorageService.get('creds');

                    if (angular.isUndefined(_credentials) || _credentials === null) {
                        return false;
                    }
                    else {
                        return true;
                    }
                }

                $scope.login = function () {
                    $scope.authError = false;
                    $scope.authWrongCredentials = false;

                    var credentials = $base64.encode($scope.cred.id + ":" + $scope.cred.pwd);

                    console.log('*** authorization header: ' + credentials);

                    $http.defaults.headers.common["Authorization"] = 'Basic ' + credentials;

                    //promise to return
                    var deferred = $q.defer();

                    var request = $http.get('http://127.0.0.1:8080/_logic/roles/mine', {});

                    request.success(function (data, status, header, config) {
                        console.log('GET http://127.0.0.1:8080/_logic/roles/mine');

                        if (!angular.isUndefined(data) && data !== null && !angular.isUndefined(data.authenticated) && data.authenticated) {
                            console.log('*** authenticated.');
                            console.log('*** user roles: ' + data.roles);
                            localStorageService.set('creds', credentials);

                            $location.path('/posts/');
                            
                            deferred.resolve();
                        }
                        else {
                            console.log('*** authentication failed. wrong credentials.');
                            localStorageService.remove('creds');
                            delete $http.defaults.headers.common["Authorization"];
                            $scope.authWrongCredentials = true;

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
                        $scope.authError = true;

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