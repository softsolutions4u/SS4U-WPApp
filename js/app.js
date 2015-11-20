// Ionic Starter App
angular.module("underscore", []).factory("_", function() {
    return window._
}),
angular.module('starter', ['ionic','ionic.service.core','ionic.service.analytics', 'ngCordova', 'ngStorage', 'starter.directives', 'starter.controllers', 'starter.services', 'starter.factory', 'starter.filters', 'starter.config', 'underscore', 'angularMoment', 'youtube-embed'])
        .run(function ($ionicPlatform, AccessService, $state, $rootScope, ConnectivityMonitor, $ionicAnalytics, $cordovaKeyboard, $cordovaSplashscreen, PushNotificationService) {
            $ionicPlatform.ready(function () {
                if (ionic.Platform.isWebView()) {
                    $cordovaSplashscreen.hide();
                }
                
                //Start watching the network status
                ConnectivityMonitor.startWatching();
                
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
                if (window.StatusBar) {
                    // org.apache.cordova.statusbar required
                    StatusBar.styleDefault();
                }

                PushNotificationService.register();
                $ionicAnalytics.register();

            });
            
            /*
             * When we change the navigation menu, each menu will be redirected to respective pages.
               This is accomplished by using Statechange and Stateprovider event which is  activated when the state is changed.
             */
            $rootScope.$on("$stateChangeStart", function(event, toState) {
                //Check whether the network is online/offline mode
                if (ConnectivityMonitor.ifOffline()) {
                    toState.name !== 'offline' ? $state.go("offline") : '';
                    return;
                }
                
                if (typeof toState.data.eventName !== 'undefined') {
                    $ionicAnalytics.track(toState.data.eventName);
                }
                
                //Check whether the user is logged in or not
                AccessService.userIsLoggedIn().then(function(res) {
                    if ( toState.data.auth ) {
                        res === false && (event.preventDefault(), $state.go("greet"));
                    } else {
                        res === true && (event.preventDefault(), $state.go("app.home", {}, { reload: true }));
                    }
                });
            });
            
            //Hide the footer content when the keyboard is visible
            if (ionic.Platform.isWebView()) {
                $rootScope.$watch(function() {
                    return $cordovaKeyboard.isVisible();
                }, function(value) {
                    $rootScope.keyboardOpen = value;
                });
            }
        })
       
        /**
         * Define all the navigations  and respective contents.
         * 
         * @param {type} $stateProvider       interfaces to declare states for your app.
         * @param {type} $urlRouterProvider   watching the $location change
         * @param {type} $ionicConfigProvider configuration phase of the app
         * @returns null
         */
        .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
            $ionicConfigProvider.views.forwardCache(true);
            $stateProvider
                    
                    .state('greet', {
                        url: "/",
                        templateUrl: "templates/greet.html",
                        data: {
                            auth: 0,
                            eventName : 'Greet'
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
                        cache: false,
                        data: {
                            auth: 0,
                            eventName : 'Register'
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
                            auth: 0,
                            eventName : 'Forgot password'
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
                            auth: 1,
                            eventName : 'Search'
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
                            auth: 1,
                            eventName : 'Categories'
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
                            auth: 1,
                            eventName : 'Categories'
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
                            auth: 1,
                            eventName : 'Home'
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
                            auth: 1,
                            eventName : 'Recent Posts'
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
                            auth: 1,
                            eventName : 'Post detail'
                        }
                    })

                    .state('app.settings', {
                        url: "/settings",
                        views: {
                            menuContent: {
                                templateUrl: "templates/settings.html",
                                controller: 'SettingsCtrl'
                            }
                        },
                        data: {
                            auth: 1,
                            eventName : 'Settings'
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
                            auth: 1,
                            eventName : 'Bookmarks'
                        }
                    });
                    
                    // if none of the above states are matched, use this as the fallback
                    n = JSON.parse(window.localStorage.user || null);
                    null !== n && null !== n.cookie
                    ? $urlRouterProvider.otherwise('/app/home')
                    : $urlRouterProvider.otherwise('/');
        });
