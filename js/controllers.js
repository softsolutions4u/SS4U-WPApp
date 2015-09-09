angular.module('starter.controllers', [])

         /**
          * User login
          *
          * @param {type} $scope        data model
          * @param {type} $ionicLoading 'Loading' image / text
          * @param {type} AccessService Access service for user authentications
          * @param {type} $state        Changestate of the 'view' 
          * @returns null
          */
        .controller('LoginCtrl', function($scope, $ionicLoading, AccessService, $state) {
            $scope.user = {};
            $scope.doLogin = function() {
                //Display 'Logging in...'  text
                $ionicLoading.show({
                    template: "Logging in..."
                });
                var s = {
                    userName: $scope.user.userName,
                    password: $scope.user.password
                };
                //Login user authentication using AccessService
                AccessService.doLogin(s).then(function() {
                    $state.go("app.home"), $ionicLoading.hide();
                }, function(n) {
                    $scope.error = n, $ionicLoading.hide();
                });
            };
        })
        
        /**
         * Register/Sign up
         * 
         * @param {type} $scope        data model
         * @param {type} $state        Changestate of the 'view'
         * @param {type} $ionicLoading 'Loading' image / text
         * @param {type} AccessService Access service for user authentications
         * @returns null
         */
        .controller('RegisterCtrl', function($scope, $state, $ionicLoading, AccessService) {
            $scope.user = {};
            $scope.doRegister = function() {
                //Display 'Registering user...'  text
                $ionicLoading.show({
                    template: "Registering user..."
                });
                var s = {
                    userName: $scope.user.userName,
                    password: $scope.user.password,
                    email: $scope.user.email,
                    displayName: $scope.user.displayName
                };
                //Create a user by using AccessService
                AccessService.doRegister(s).then(function() {
                    $state.go("app.home"), $ionicLoading.hide();
                }, function(n) {
                    $scope.error = n, $ionicLoading.hide();
                });
            };
        })
        
        /**
         * Forgot/Reset password for the user
         * 
         * @param {type} $scope        data model
         * @param {type} $ionicLoading 'Loading' image / text
         * @param {type} AccessService Access service for user authentications
         * @returns null
         */
        .controller('ForgotPasswordCtrl', function($scope, $ionicLoading, AccessService) {
            $scope.user = {};
            $scope.recoverPassword = function() {
                //Display 'Recovering password...'  text
                $ionicLoading.show({
                    template: "Recovering password..."
                });
                //send a forgot password request by using AccessService
                AccessService.forgotPassword($scope.user.email)
                        .then(function(n) {
                            $scope.error = '';
                            $scope.message = '';
                            "error" === n.status ? $scope.error = "Error in sending recover password Email" : $scope.message = "Link for password reset has been emailed to you. Please check your email.";
                            $ionicLoading.hide();
                        }, function(e) {
                            //Display 'Error occured. try after sometime' text
                            $ionicLoading.show({
                                template: 'Error occured. try after sometime',
                                duration: 3000
                            });
                        });
            };
            
        })
        
        /**
         * Logout 
         * 
         * @param {type} $scope            data model
         * @param {type} $state            Changestate of the 'view'
         * @param {type} $ionicActionSheet Slideup pane to choose set of 'options'
         * @param {type} AccessService     Access service for user authentications
         * @returns null
         */
        .controller('AppCtrl', function ($scope, $state, $ionicActionSheet, AccessService) {
            $scope.$on("$ionicView.enter", function() {
                $scope.user = AccessService.getUser();
            });
            $scope.showLogOutMenu = function() {
                //Display 'Logout' action
                $ionicActionSheet.show({
                    destructiveText: "Logout",
                    titleText: "Are you sure you want to logout?",
                    cancelText: "No",
                    cancel: function() {},
                    buttonClicked: function() {
                        return true;
                    },
                    destructiveButtonClicked: function() {
                        AccessService.logOut(), $state.go("login");
                    }
                });
            };
            
        })

        /**
         * View all the recent posts
         * 
         * @param {type} $scope                data model
         * @param {type} $stateParams          parameters
         * @param {type} $cordovaSocialSharing 'Share' option for sharing with different social media
         * @param {type} $ionicLoading         'Loading' image / text
         * @param {type} PostService           'Post service' objects for getting all the posts
         * @returns null
         */
        .controller('PostsCtrl', function ($scope, $stateParams, $cordovaSocialSharing, $ionicLoading, PostService) {
            var filters = [];
            $scope.posts = [];
            $scope.page  = 1;
            $scope.pagesCount = 1;
            $scope.isLoading = false;

            if ($stateParams.categoryId) {
                filters.push('cat='+ $stateParams.categoryId);
            }
            
            //Refresh posts
            $scope.doRefresh = function() {
                $scope.isLoading = true;
                //Display 'Loading posts' text
                $ionicLoading.show({
                    template: 'Loading posts'
                });
                //Get all posts using 'Post service'
                PostService.getPosts(filters, 1)
                    .then(function (res) {
                        $scope.pagesCount = res.pages;

                        var shortenPosts  = PostService.shortenPosts(res.posts);
                        $scope.posts      = shortenPosts;
                        $scope.isLoading  = false;
                        $ionicLoading.hide();
                        $scope.$broadcast('scroll.refreshComplete');
                    }, function(e) {
                        $ionicLoading.show({
                            template: 'Error occured. try after sometime',
                            duration: 3000
                        });
                    });
              };
            //Load more posts
            $scope.loadMorePosts = function() {
                $scope.page += 1;
                PostService.getPosts(filters, $scope.page)
                    .then(function(data) {
                        $scope.pagesCount = data.pages;

                        var posts    = PostService.shortenPosts(data.posts);
                        $scope.posts = $scope.posts.concat(posts);
                        $scope.$broadcast("scroll.infiniteScrollComplete");
                    });
            };

            $scope.moreDataCanBeLoaded = function() {
                return $scope.pagesCount > $scope.page;
            };

            $scope.doRefresh();
        })

        /**
         * View individual post
         * 
         * @param {type} $scope                data model
         * @param {type} $stateParams          state parameters
         * @param {type} $ionicLoading         'Loading' image / text
         * @param {type} $cordovaSocialSharing 'Share' option for sharing with different social media
         * @param {type} PostService           'Post service' objects for getting all the posts
         * @param {type} AccessService         Access service for authentications
         * @param {type} $ionicScrollDelegate  Controlling scrollViews
         * @param {type} BookmarkService       BookmarkService to activate/deactivate bookmark post
         * @returns null
         */
        .controller('PostCtrl', function ($scope, $stateParams, $ionicLoading, $cordovaSocialSharing, PostService, AccessService, $ionicScrollDelegate, BookmarkService) {
            $scope.minFontSize   = 12;
            $scope.maxFontSize   = 30;
            $scope.fontSizeSteps = 2;
            
            $scope.fontSize = $scope.minFontSize;
            
            //Increase size of the text
            $scope.increase = function() {
                var status = 'Maximum text size limit reached';
                if ($scope.fontSize < $scope.maxFontSize) {
                    $scope.fontSize = $scope.fontSize + $scope.fontSizeSteps;
                    status = 'Text size increased';
                } 
                
                $ionicLoading.show({
                    template: status,
                    duration: 1000
                });
            };
            
            //Decrease size of the text
            $scope.decrease = function() {
                var status = 'Minimum text size limit reached';
                if ($scope.fontSize > $scope.minFontSize) {
                    $scope.fontSize = $scope.fontSize - $scope.fontSizeSteps;
                    status = 'Text size decreased';
                }
                $ionicLoading.show({
                    template: status,
                    duration: 1000
                });
            };
            
            //share the post in social media
            $scope.shareAnywhere = function() {
                $cordovaSocialSharing.share($scope.post.title, $scope.post.title, null, $scope.post.url);
            };
            
            //Ionic 'Loading post' text
            $ionicLoading.show({
                template: 'Loading post'
            });
            
            //Add comment for post
            $scope.addComment = function() {
                //Ionic 'Submiting comment...' text
                $ionicLoading.show({
                    template: "Submiting comment..."
                });
                
                //'Leave comment' for individual post
                PostService.submitComment($scope.post.id, $scope.new_comment).then(function(n) {
                    if ("ok" == n.status) {
                        var o = AccessService.getUser(),
                            newPost = {
                                author: {
                                    name: o.data.username
                                },
                                content: $scope.new_comment,
                                date: Date.now(),
                                user_gravatar: o.data.avatar,
                                id: n.comment_id
                            };
                        $scope.comments.push(newPost);
                        $scope.new_comment = ""; 
                        $scope.new_comment_id = n.comment_id;
                        $ionicLoading.hide();
                        $ionicScrollDelegate.scrollBottom(true);
                    }
                }, function(e) {
                    //Ionic 'Error occured. try after sometime' text
                    $ionicLoading.show({
                        template: 'Error occured. try after sometime',
                        duration: 3000
                    });
                });
            };
            
            //Get 'Post' details using postId
            PostService.getPost($stateParams.postId)
                .then(function (data) {
                    if ("ok" === data.status) {
                        $scope.post = data.post;
                        $scope.comments = _.map($scope.post.comments, function(comment) {
                            return comment.author ? (PostService.getUserGravatar(comment.author.id).then(function(n) {
                                comment.user_gravatar = n.avatar;
                            }), comment) : comment;
                        });
                        $ionicLoading.hide();
                    } else {
                        $ionicLoading.show({
                            template: 'Error occured. try after sometime',
                            duration: 3000
                        });
                    }
                }, function(e) {
                    $ionicLoading.show({
                        template: 'Error occured. try after sometime',
                        duration: 3000
                    });
                });
                
            // Add / remove 'Bookmark'     
            $scope.addBookmark = function () {
                BookmarkService.addBookmark($scope.post.id, $scope.post.title, $scope.post.date);
            };
            
            //Check if the post is 'Bookmarked' or not
            $scope.isBookmarked = function () {
                return $scope.post ? BookmarkService.isBookmarked($scope.post.id) : false;
            };
        })
        
        /**
         * View all the categories
         * 
         * @param {type} $scope            data model
         * @param {type} $http             Send http request and receive Return response
         * @param {type} WORDPRESS_API_URL Wordpress API url
         * @returns null
         */
        .controller('CategoryCtrl', function ($scope, $http, WORDPRESS_API_URL) {
            // Get categories
            var categoryApi = WORDPRESS_API_URL + "get_category_index/?callback=JSON_CALLBACK";

            $http.jsonp(categoryApi).
                    success(function (data) {
                        $scope.categories = data.categories;
                    }).
                    error(function () {
                        console.log('Category load error.');
                    });
        })
        
        /**
         * 'Search' post by keyword
         * 
         * @param {type} $scope            data model
         * @param {type} $http             Send http request and receive Return response
         * @param {type} WORDPRESS_API_URL Wordpress API url
         * @returns null
         */
        .controller('SearchCtrl', function ($scope, $http, WORDPRESS_API_URL) {
            $scope.formData = {};
            //Get 'Search' results
            $scope.getResults = function () {
                var searchApi = WORDPRESS_API_URL + 'get_search_results?search=' + $scope.formData.term + '&callback=JSON_CALLBACK';
                $http.jsonp(searchApi).
                        success(function (data) {
                            if ("ok" === data.status) {
                                $scope.posts = data.posts;
                            }
                        }).
                        error(function () {
                            console.log('Search results error.');
                        });
            };
        })
        
        /**
         * Check Network status whether online/offline
         * 
         * @param {type} $scope               data model
         * @param {type} $state               Changestate of the 'view' 
         * @param {type} ConnectivityMonitor  connectivity service to check the network connection
         * @returns null
         */
        .controller('OfflineCtrl', function ($scope, $state, ConnectivityMonitor) {
            $scope.checkConnection = function() {
                if (ConnectivityMonitor.isOnline()) {
                    $state.go("app.home");
                }
            };
        })
        
        /**
         * View 'Bookmark' posts
         * 
         * @param {type} $scope        data model
         * @param {type} $localStorage local storage
         * @returns null
         */
        .controller('BookmarkCtrl', function ($scope, $localStorage) {
            //Get 'Bookmarked' post from local storage
            $localStorage.$default({bookmarks: {id:[], data: []}});
            $scope.posts = $localStorage.bookmarks.data;
        });