'use strict';

angular.module('blogApp.edit', ['ngRoute', 'base64'])

        .config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
                $routeProvider
                        .when('/login/:postId', {
                            templateUrl: 'components/edit/login.html',
                            controller: 'LoginCtrl'
                        })
                        .when('/edit/:postId', {
                            templateUrl: 'components/edit/edit.html',
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

        .controller('PostEditCtrl', ['$scope', '$routeParams', '$http', '$compile', 'localStorageService', '$q', '$location', function ($scope, $routeParams, $http, $compile, localStorageService, $q, $location) {
                var credentials = localStorageService.get('creds');

                if (angular.isUndefined(credentials) || credentials === null) {
                    $location.path('/login');
                    return;
                }

                $http.defaults.headers.common["Content-Type"] = "application/json";
                $http.defaults.headers.common["Authorization"] = 'Basic ' + credentials;

                //promise to return
                var deferred = $q.defer();

                var request = $http.get('/data/blog/posts/' + $routeParams.postId, {});

                request.success(function (data, status) {
                    console.log("GET " + '/data/blog/posts/' + $routeParams.postId);

                    $scope.post = data;

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
                        $location.path('/posts/' + $routeParams.postId);
                    }

                    //resolve promise
                    deferred.resolve();
                });

                $scope.cancel = function () {
                    if (angular.isUndefined($scope.post) || angular.isUndefined($scope.post._id)) // new post
                        $location.path('/posts');
                    else // existing post
                        $location.path('/posts/' + $scope.post._id.$oid);
                };

                $scope.save = function () {
                    if (!angular.isUndefined($scope.post) && !angular.isUndefined($scope.post._etag)) {
                        $http.defaults.headers.common["If-Match"] = $scope.post._etag.$oid;
                    }
                    
                    var request = $http.post('/data/blog/posts/', $scope.post);

                    request.success(function (data, status, headers, config) {
                        console.log("POST " + '/data/blog/posts/');

                        var loc = headers('Location');

                        if (angular.isUndefined(loc)) { // existing post
                            $location.path('/posts/' + $scope.post._id.$oid);
                        } else { // new post
                            $location.path(loc);
                        }

                        //resolve promise
                        deferred.resolve();
                    });

                    request.error(function (data, status) {
                        if (status === 412) {
                            $scope.saveGhostWrite = true;
                        } else if (status === 401) {
                            $scope.sessionExpired = true;
                            localStorageService.remove('userid');
                            localStorageService.remove('creds');
                            delete $http.defaults.headers.common["Authorization"];
                            $location.path('/login');
                        } else {
                            $scope.saveError = true;
                        }
                            
                        console.log("save failed " + status);
                    });
                };
            }]);