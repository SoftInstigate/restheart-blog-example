'use strict';

angular.module('myApp.posts', ['ngRoute'])

        .config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
                $routeProvider
                        .when('/posts', {
                            templateUrl: 'posts/posts.html',
                            controller: 'PostsListCtrl'
                        })
                        .when('/posts/:postId', {
                            templateUrl: 'posts/post.html',
                            controller: 'PostDetailCtrl'
                        });

                // Enable CORS
                $httpProvider.defaults.useXDomain = true;
                delete $httpProvider.defaults.headers.common["X-Requested-With"];
                $httpProvider.defaults.withCredentials = true;
                $httpProvider.defaults.headers.common["Accept"] = "application/hal+json";
                $httpProvider.defaults.headers.common["Content-Type"] = "application/json";
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

        .controller('PostsListCtrl', ['$scope', '$http', 'localStorageService', '$q', function ($scope, $http, localStorageService, $q) {
                console.log('*************** PostsListCtrl');

                var credentials = localStorageService.get('creds');

                if (angular.isUndefined(credentials) || credentials === null)
                {
                    console.log("no credentials in local storage => unauthenticated   x");
                    $scope.auth = false;
                }
                else
                {
                    console.log("credentials found in local storage => authenticated");
                    $scope.auth = true;
                }

                $scope.setCurrentPage = function (num) {
                    var credentials = localStorageService.get('creds');

                    if (angular.isUndefined(credentials) || credentials === null)
                    {
                        console.log("WARN: tried to get posts but not authenticated");
                        return;
                    }

                    $http.defaults.headers.common["Authorization"] = 'Basic ' + credentials;

                    $scope.currentPage = num;

                    //promise to return
                    var deferred = $q.defer();

                    var request = $http.get('http://127.0.0.1:8080/blog/posts?sort_by=-_created_on&count&pagesize=2&page=' + $scope.currentPage, {});

                    request.success(function (data, status, header, config) {
                        console.log('GET http://127.0.0.1:8080/blog/posts?sort_by=-_created_on&count&pagesize=2&page=' + $scope.currentPage);
                        $scope.posts = data;
                        $scope.pages = data._total_pages;
                        //resolve promise
                        deferred.resolve();
                    });
                };

                $scope.formatDate = function (date) {
                    var d = new Date(date);

                    return d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() + " at " + d.getHours() + ":" + d.getMinutes();
                };


                $scope.setCurrentPage(1);
            }])

        .controller('PostDetailCtrl', ['$scope', '$routeParams', '$http', '$compile', 'localStorageService', '$q', function ($scope, $routeParams, $http, $compile, localStorageService, $q) {
                console.log('*************** PostDetailCtrl');
                        
                var credentials = localStorageService.get('creds');

                if (angular.isUndefined(credentials) || credentials === null)
                {
                    console.log('WARN: tried to get post but not logged in');
                    return;
                }

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
            }]);