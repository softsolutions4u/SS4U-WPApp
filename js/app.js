// Ionic Starter App
angular.module("underscore", []).factory("_", function() {
    return window._
}),
angular.module('starter', ['ionic', 'ngCordova', 'ngStorage', 'starter.directives', 'starter.controllers', 'starter.services', 'starter.factory', 'starter.filters', 'starter.config', 'underscore', 'angularMoment', 'youtube-embed'])
        .run(function ($ionicPlatform, AccessService, $state, $rootScope, ConnectivityMonitor) {
            $ionicPlatform.ready(function () {
                //Start watching the network status
                ConnectivityMonitor.startWatching();
                AccessService.userIsLoggedIn().then(function(result) {
                    result === true ? $state.go("app.home") : $state.go("greet");
                });
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
                if (window.StatusBar) {
                    // org.apache.cordova.statusbar required
                    StatusBar.styleDefault();
                }
            });
            $rootScope.$on("$stateChangeStart", function(event, toState) {
                //Check whether the network is online/offline mode
                if (ConnectivityMonitor.ifOffline()) {
                    toState.name !== 'offline' ? $state.go("offline") : '';
                    return;
                }
                
                //Check whether the user is logged in or not
                AccessService.userIsLoggedIn().then(function(res) {
                    if ( toState.data.auth ) {
                        res === false && (event.preventDefault(), $state.go("greet"));
                    } else {
                        res === true && (event.preventDefault(), $state.go("app.home"));
                    }
                });
            });
        })

        .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
            $ionicConfigProvider.views.forwardCache(true);
            $stateProvider
                    
                    .state('greet', {
                        url: "/",
                        templateUrl: "templates/greet.html",
                        data: {
                            auth: 0
                        }
                    })
                    
                    .state('offline', {
                        url: "/offline",
                        templateUrl: "templates/offline.html",
                        controller: 'OfflineCtrl',
                        data: {
                            auth: 0
                        }
                    })
                    
                    .state("register", {
                        url: "/register",
                        templateUrl: "templates/register.html",
                        controller: "RegisterCtrl",
                        data: {
                            auth: 0
                        }
                    })
                    
                    .state('login', {
                        url: "/login",
                        templateUrl: "templates/login.html",
                        controller: 'LoginCtrl',
                        cache: false,
                        data: {
                            auth: 0
                        }
                    })
                    
                    .state('forgot_password', {
                        url: "/forgot-password",
                        templateUrl: "templates/forgot-password.html",
                        controller: 'ForgotPasswordCtrl',
                        data: {
                            auth: 0
                        }
                    })
                    
                    .state('app', {
                        url: "/app",
                        abstract: true,
                        templateUrl: "templates/menu.html",
                        controller: 'AppCtrl',
                        data: {
                            auth: 1
                        }
                    })

                    .state('app.search', {
                        url: "/search",
                        views: {
                            menuContent: {
                                templateUrl: "templates/search.html",
                                controller: 'SearchCtrl'
                            }
                        },
                        data: {
                            auth: 1
                        }
                    })

                    .state('app.categories', {
                        url: "/categories",
                        views: {
                            menuContent: {
                                templateUrl: "templates/categories.html",
                                controller: 'CategoryCtrl',
                            }
                        },
                        data: {
                            auth: 1
                        }
                    })

                    .state('app.category', {
                        url: "/categories/:categoryId",
                        views: {
                            menuContent: {
                                templateUrl: "templates/posts.html",
                                controller: 'PostsCtrl'
                            }
                        },
                        data: {
                            auth: 1
                        }
                    })
                    
                    .state('app.home', {
                        url: "/home",
                        views: {
                            menuContent: {
                                templateUrl: "templates/home.html",
                                controller: 'PostsCtrl'
                            }
                        },
                        data: {
                            auth: 1
                        }
                    })
                    .state('app.posts', {
                        url: "/posts",
                        views: {
                            menuContent: {
                                templateUrl: "templates/posts.html",
                                controller: 'PostsCtrl'
                            }
                        },
                        data: {
                            auth: 1
                        }
                    })

                    .state('app.post', {
                        url: "/posts/:postId",
                        views: {
                            menuContent: {
                                templateUrl: "templates/post.html",
                                controller: 'PostCtrl'
                            }
                        },
                        data: {
                            auth: 1
                        }
                    })

                    .state('app.bookmarks', {
                        url: "/bookmarks",
                        views: {
                            menuContent: {
                                templateUrl: "templates/bookmarks.html",
                                controller: 'BookmarkCtrl'
                            }
                        },
                        data: {
                            auth: 1
                        }
                    });
            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/app/home');
        });
