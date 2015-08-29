angular.module('starter.controllers', [])

        .controller('GreetCtrl', function($scope, $ionicSlideBoxDelegate) {
            $scope.$on("$ionicView.enter", function() {
                $ionicSlideBoxDelegate.$getByHandle("greet-slider").update();
            });
        })
        
        .controller('LoginCtrl', function($scope, $ionicLoading, AccessService, $state) {
            $scope.user = {};
            $scope.doLogin = function() {
                $ionicLoading.show({
                    template: "Loging in..."
                });
                var s = {
                    userName: $scope.user.userName,
                    password: $scope.user.password
                };
                AccessService.doLogin(s).then(function() {
                    $state.go("app.home"), $ionicLoading.hide();
                }, function(n) {
                    $scope.error = n, $ionicLoading.hide();
                });
            };
        })
        
        .controller('RegisterCtrl', function($scope, $state, $ionicLoading, AccessService) {
            $scope.user = {};
            $scope.doRegister = function() {
                $ionicLoading.show({
                    template: "Registering user..."
                });
                var s = {
                    userName: $scope.user.userName,
                    password: $scope.user.password,
                    email: $scope.user.email,
                    displayName: $scope.user.displayName
                };
                AccessService.doRegister(s).then(function() {
                    $state.go("app.home"), $ionicLoading.hide();
                }, function(n) {
                    $scope.error = n, $ionicLoading.hide();
                })
            }
        })

        .controller('ForgotPasswordCtrl', function($scope, $ionicLoading, AccessService) {
            $scope.user = {};
            $scope.recoverPassword = function() {
                $ionicLoading.show({
                    template: "Recovering password..."
                });
                AccessService.forgotPassword($scope.user.email)
                        .then(function(n) {
                            $scope.error = '';
                            $scope.message = '';
                            "error" === n.status ? $scope.error = "Error in sending recover password Email" : $scope.message = "Link for password reset has been emailed to you. Please check your email.";
                            $ionicLoading.hide();
                        }, function(e) {
                            $ionicLoading.show({
                                template: 'Error occured. try after sometime',
                                duration: 3000
                            });
                        });
            };
            
        })

        .controller('AppCtrl', function ($scope, $state, $ionicActionSheet, AccessService) {
            $scope.$on("$ionicView.enter", function() {
                $scope.user = AccessService.getUser();
            });
            $scope.showLogOutMenu = function() {
                $ionicActionSheet.show({
                    destructiveText: "Logout",
                    titleText: "Are you sure you want to logout?",
                    cancelText: "Cancel",
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

        .controller('PostsCtrl', function ($scope, $stateParams, $cordovaSocialSharing, $ionicLoading, PostService, BookmarkService) {
            var filters = [];
            $scope.posts = [];
            $scope.page  = 1;
            $scope.pagesCount = 1;
            $scope.isLoading = false;

            if ($stateParams.categoryId) {
                filters.push('cat='+ $stateParams.categoryId);
            }
            
            $scope.doRefresh = function() {
                $scope.isLoading = true;
                $ionicLoading.show({
                    template: 'Loading posts'
                });
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

            $scope.addBookmark = function (postId, title, date) {
                BookmarkService.addBookmark(postId, title, date);
            };

            $scope.isBookmarked = function (postId) {
                return BookmarkService.isBookmarked(postId);
            };
            $scope.doRefresh();
        })

        .controller('PostCtrl', function ($scope, $stateParams, $sce, $ionicLoading, $cordovaSocialSharing, PostService, AccessService, $ionicScrollDelegate, BookmarkService) {
            $scope.minFontSize   = 12;
            $scope.maxFontSize   = 30;
            $scope.fontSizeSteps = 2;
            
            $scope.fontSize = $scope.minFontSize;
            
            $scope.increase = function() {
                if ($scope.fontSize < $scope.maxFontSize) {
                    $scope.fontSize = $scope.fontSize + $scope.fontSizeSteps;
                }
            };
            
            $scope.decrease = function() {
                if ($scope.fontSize > $scope.minFontSize) {
                    $scope.fontSize = $scope.fontSize - $scope.fontSizeSteps;
                }
            };
            
            $scope.shareAnywhere = function() {
                $cordovaSocialSharing.share($scope.post.title, $scope.post.title, $scope.post.content, $scope.post.link);
            };
            $ionicLoading.show({
                template: 'Loading post'
            });
            $scope.addComment = function() {
                $ionicLoading.show({
                    template: "Submiting comment..."
                });
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
                    $ionicLoading.show({
                        template: 'Error occured. try after sometime',
                        duration: 3000
                    });
                });
            };
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
                
            $scope.addBookmark = function () {
                BookmarkService.addBookmark($scope.post.id, $scope.post.title, $scope.post.date);
            };

            $scope.isBookmarked = function () {
                return $scope.post ? BookmarkService.isBookmarked($scope.post.id) : false;
            };
        })

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

        .controller('SearchCtrl', function ($scope, $http, WORDPRESS_API_URL) {
            $scope.formData = {};
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
            }
        })

        .controller('OfflineCtrl', function ($scope, $state, ConnectivityMonitor) {
            $scope.checkConnection = function() {
                if (ConnectivityMonitor.isOnline()) {
                    $state.go("app.home");
                }
            };
        })
        
        .controller('BookmarkCtrl', function ($scope, $localStorage) {
            $localStorage.$default({bookmarks: {id:[], data: []}});
            $scope.posts = $localStorage.bookmarks.data;
        });