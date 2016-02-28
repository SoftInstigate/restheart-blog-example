'use strict';

angular.module('blogApp.auth', ['ngRoute', 'base64'])

        .config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
                $routeProvider
                        .when('/login', {
                            templateUrl: 'components/auth/login.html',
                            controller: 'LoginCtrl'
                        });
            }])

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

                    var credentials = encodeCredentials($scope.cred.id, $scope.cred.pwd);

                    console.log('*** authorization header: ' + credentials);

                    $http.defaults.headers.common["Authorization"] = 'Basic ' + credentials;

                    //promise to return
                    var deferred = $q.defer();

                    var request = $http.get('/_logic/roles/' + $scope.cred.id, {});

                    request.success(function (data, status, headers, config) {
                        console.log('GET /_logic/roles/' + $scope.cred.id);

                        if (!angular.isUndefined(data) && data !== null && !angular.isUndefined(data.authenticated) && data.authenticated) {
                            console.log('*** authenticated.');
                            console.log('*** user roles: ' + data.roles);

                            var authToken = headers('Auth-Token');

                            if (authToken === null) {
                                localStorageService.set('userid', $scope.cred.id);
                                localStorageService.set('creds', credentials);
                                console.log('*** WARNING: credentials stored in local storage. did you enabled restheart auth-token?');
                            } else {
                                localStorageService.set('userid', $scope.cred.id);
                                localStorageService.set('creds', encodeCredentials($scope.cred.id, authToken));
                                console.log('*** auth token stored in local storage: ' + authToken);
                            }

                            $location.path('/posts/');

                            deferred.resolve();
                        }
                        else {
                            console.log('*** authentication failed. wrong credentials.');
                            localStorageService.remove('userid');
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

                        localStorageService.remove('userid');
                        localStorageService.remove('creds');
                        delete $http.defaults.headers.common["Authorization"];

                        if (status == 401) {
                            $scope.authWrongCredentials = true;
                        } else {
                            $scope.authError = true;
                        }

                        //reject promise
                        deferred.reject('authentication failed..');
                    });
                };

                $scope.logout = function () {
                    console.log('***** logging out');

                    if (true) {
                        // this code is just to logout the client
                        // without invalidating the auth token (other user clients can keep working)

                        localStorageService.remove('userid');
                        localStorageService.remove('creds');
                        $scope.auth = false;
                    } else {
                        // this code is to invalidate the auth token

                        var userid = localStorageService.get('userid');

                        // invalidate auth token
                        if (userid !== null) {
                            //promise to return
                            var deferred = $q.defer();

                            var credentials = localStorageService.get('creds');

                            console.log('*** authorization header: ' + credentials);

                            $http.defaults.headers.common["Authorization"] = 'Basic ' + credentials;

                            var request = $http.delete('/_authtokens/' + userid, {});

                            request.success(function (data, status, headers, config) {
                                console.log('***** ' + status);
                                console.log('DELETE /_authtokens/' + userid);

                                delete $http.defaults.headers.common["Authorization"];

                                localStorageService.remove('userid');
                                localStorageService.remove('creds');
                                $scope.auth = false;

                                deferred.resolve();
                            });

                            request.error(function (data, status, header, config) {
                                console.log('*** auth token invalidation failed..');

                                //reject promise
                                deferred.reject('auth token invalidation failed..');
                                console.log(status);
                                console.log(data);
                                console.log(header);
                                console.log(config);

                                localStorageService.remove('userid');
                                localStorageService.remove('creds');
                                $scope.auth = false;
                            });
                        }
                    }
                };

                function encodeCredentials(id, pwd) {
                    return $base64.encode(id + ":" + pwd);
                };
            }]);
