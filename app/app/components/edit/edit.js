'use strict';

angular.module('blogApp.edit', ['ngRoute', 'base64'])

        .config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
                $routeProvider
                        .when('/login', {
                            templateUrl: 'app/components/edit/login.html',
                            controller: 'LoginCtrl'
                        })
                        .when('/login/:postId', {
                            templateUrl: 'app/components/edit/login.html',
                            controller: 'LoginCtrl'
                        })
                        .when('/edit/:postId', {
                            templateUrl: 'app/components/edit/edit.html',
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

                $http.defaults.headers.common["Authorization"] = 'Basic ' + credentials;

                //promise to return
                var deferred = $q.defer();

                var request = $http.get('http://127.0.0.1:8080/data/blog/posts/' + $routeParams.postId, {});

                request.success(function (data, status) {
                    console.log("GET " + 'http://127.0.0.1:8080/data/blog/posts/' + $routeParams.postId);

                    $scope.post = data;

                    //resolve promise
                    deferred.resolve();
                });
            }]);