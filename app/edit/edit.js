'use strict';

angular.module('blogApp.edit', ['ngRoute', 'base64'])

        .config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
                $routeProvider
                        .when('/login', {
                            templateUrl: 'edit/login.html',
                            controller: 'LoginCtrl'
                        })
                        .when('/login/:postId', {
                            templateUrl: 'edit/login.html',
                            controller: 'LoginCtrl'
                        })
                        .when('/edit/:postId', {
                            templateUrl: 'edit/edit.html',
                            controller: 'PostEditCtrl'
                        });

                // Enable CORS
                $httpProvider.defaults.useXDomain = true;
                delete $httpProvider.defaults.headers.common["X-Requested-With"];
                $httpProvider.defaults.withCredentials = true;
                $httpProvider.defaults.headers.common["Accept"] = "application/hal+json";
                $httpProvider.defaults.headers.common["Content-Type"] = "application/json";
                $httpProvider.defaults.headers.common["No-Auth-Challenge"] = "true";
            }])

        .config(['$compileProvider', function ($compileProvider) {
                // configure new 'compile' directive by passing a directive
                // factory function. The factory function injects the '$compile'
                $compileProvider.directive('compile', function ($compile) {
                    // directive factory creates a link function
                    return function (scope, element, attrs) {
                        scope.$watch(
                                function (scope) {
                                    // watch the 'compile' expression for changes
                                    return scope.$eval(attrs.compile);
                                },
                                function (value) {
                                    // when the 'compile' expression changes
                                    // assign it into the current DOM
                                    element.html(value);

                                    // compile the new DOM and link it to the current
                                    // scope.
                                    // NOTE: we only compile .childNodes so that
                                    // we don't get into infinite loop compiling ourselves
                                    $compile(element.contents())(scope);
                                }
                        );
                    };
                });
            }])


        .controller('PostEditCtrl', ['$scope', '$routeParams', '$http', '$compile', 'localStorageService', '$q', '$location', function ($scope, $routeParams, $http, $compile, localStorageService, $q, $location) {
                console.log('*************** PostEditCtrl');

                var credentials = localStorageService.get('creds');

                if (angular.isUndefined(credentials) || credentials === null) {
                    $location.path('/login');
                    return;
                }
                else
                    $scope.auth = true;

                $http.defaults.headers.common["Authorization"] = 'Basic ' + credentials;

                //promise to return
                var deferred = $q.defer();

                var request = $http.get('http://127.0.0.1:8080/blog/posts/' + $routeParams.postId, {});

                request.success(function (data, status) {
                    console.log("GET " + 'http://127.0.0.1:8080/blog/posts/' + $routeParams.postId);

                    $scope.post = data;
                    $scope.content = $compile(data);
                    //resolve promise
                    deferred.resolve();
                });
            }])
        
        .controller('LoginCtrl', ['$scope', '$routeParams', '$location', '$http', 'localStorageService', '$q', '$base64', function ($scope, $routeParams, $location, $http, localStorageService, $q, $base64) {
                console.log('*************** LoginCtrl');
                        
                var _credentials = localStorageService.get('creds');

                if (angular.isUndefined(_credentials) || _credentials === null)
                {
                    $scope.auth = false;
                }
                else
                {
                    $scope.auth = true;
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
                        
                        if (!angular.isUndefined(data) && data !== null && !angular.isUndefined(data.authenticated) && data.authenticated)
                        {
                            console.log('*** authenticated.');
                            console.log('*** user roles: ' + data.roles);
                            localStorageService.set('creds', credentials);
                            $scope.auth = true;
                            deferred.resolve();
                            
                            if ($routeParams.postId)
                            {
                                $location.path('/edit/' + $routeParams.postId);
                            }
                        }
                        else
                        {
                            console.log('*** authentication failed. wrong credentials.');
                            localStorageService.remove('creds');
                            delete $http.defaults.headers.common["Authorization"];
                            $scope.auth = false;
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
                        $scope.auth = false;
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