'use strict';

angular.module('blogApp.posts', ['ngRoute'])

        .config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
                $routeProvider
                        .when('/posts', {
                            templateUrl: 'components/posts/posts.html',
                            controller: 'PostsListCtrl'
                        })
                        .when('/posts/:postId', {
                            templateUrl: 'components/posts/post.html',
                            controller: 'PostDetailCtrl'
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

        .controller('PostsListCtrl', ['$scope', '$http', '$q', function ($scope, $http, $q) {
                $scope.setCurrentPage = function (num) {
                    $scope.currentPage = num;

                    //promise to return
                    var deferred = $q.defer();

                    var request = $http.get('/data/blog/posts?sort_by=-_id&count&pagesize=4&page=' + $scope.currentPage, {});

                    request.success(function (data) {
                        console.log('GET /data/blog/posts?sort_by=-_id&count&pagesize=4&page=' + $scope.currentPage);
                        $scope.posts = data;
                        $scope.pages = data._total_pages;

                        //resolve promise
                        deferred.resolve();

                    });

                    request.error(function (data, status) {
                        if (status === 404) {
                            $scope.errorNotFound = true;
                        } else if (status === 401) {
                            $scope.sessionExpired = true;
                            localStorageService.remove('userid');
                            localStorageService.remove('creds');
                            delete $http.defaults.headers.common["Authorization"];
                            console.log("session expired");
                            $location.path('/posts');
                        }

                        //resolve promise
                        deferred.resolve();
                    });
                };

                $scope.setCurrentPage(1);
            }])

        .controller('PostDetailCtrl', ['$scope', '$routeParams', '$http', '$compile', 'localStorageService', '$q', function ($scope, $routeParams, $http, $compile, localStorageService, $q) {
                var credentials = localStorageService.get('creds');

                if (angular.isUndefined(credentials) || credentials === null) {
                    $scope.auth = false;
                } else {
                    $scope.auth = true;
                }

                //promise to return
                var deferred = $q.defer();

                var request = $http.get('/data/blog/posts/' + $routeParams.postId, {});

                request.success(function (data, status) {
                    console.log("GET " + '/data/blog/posts/' + $routeParams.postId);

                    $scope.post = data;
                    $scope.content = $compile(data);
                    //resolve promise
                    deferred.resolve();
                });

                request.error(function (data, status) {
                    if (status === 401) {
                        $scope.sessionExpired = true;
                        localStorageService.remove('userid');
                        localStorageService.remove('creds');
                        delete $http.defaults.headers.common["Authorization"];
                        console.log("session expired");
                        $location.path('/posts');
                    } 
                });
            }]);