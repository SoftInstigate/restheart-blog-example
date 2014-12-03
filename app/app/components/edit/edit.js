'use strict';

angular.module('blogApp.edit', ['ngRoute', 'base64'])

        .config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
                $routeProvider
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

                var request = $http.get('http://127.0.0.1:8080/data/blog/posts/' + $routeParams.postId, {});

                request.success(function (data, status) {
                    console.log("GET " + 'http://127.0.0.1:8080/data/blog/posts/' + $routeParams.postId);

                    $scope.post = data;

                    //resolve promise
                    deferred.resolve();
                });

                $scope.cancel = function () {
                    if (angular.isUndefined($scope.post) || angular.isUndefined($scope.post._id)) // new post
                        $location.path('/posts');
                    else // existing post
                        $location.path('/posts/' + $scope.post._id);
                };

                $scope.save = function () {
                    if (!angular.isUndefined($scope.post) && !angular.isUndefined($scope.post._etag)) {
                        $http.defaults.headers.common["If-Match"] = $scope.post._etag;
                    }
                    
                    var request = $http.post('http://127.0.0.1:8080/data/blog/posts/', $scope.post);

                    request.success(function (data, status, headers, config) {
                        console.log("POST " + 'http://127.0.0.1:8080/data/blog/posts/');

                        var loc = headers('Location');

                        if (angular.isUndefined(loc)) { // existing post
                            $location.path('/posts/' + $scope.post._id);
                        } else { // new post
                            $location.path(loc);
                        }

                        //resolve promise
                        deferred.resolve();
                    });

                    request.error(function (data, status) {
                        if (status === 412) {
                            $scope.saveGhostWrite = true;
                        } else {
                            $scope.saveError = true;
                        }
                            
                        console.log("save failed " + status);
                    });
                };
            }]);