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
                AccessService.forgotPassword($scope.user.userName)
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

        .controller('PostsCtrl', function ($scope, $stateParams, $cordovaSocialSharing, $localStorage, $ionicLoading, PostService) {
            var filters = [];
    
            $scope.shareAnywhere = function(message, subject, image, url) {
                $cordovaSocialSharing.share(message, subject, image, url);
            };
            
            $scope.doRefresh = function() {
                $ionicLoading.show({
                    template: 'Loading posts'
                });
                PostService.getPosts(filters)
                    .then(function (res) {
                        var shortenPosts = PostService.shortenPosts(res.posts);                        
                        $scope.posts = shortenPosts;
                        $ionicLoading.hide();
                        $scope.$broadcast('scroll.refreshComplete');
                    }, function(e) {
                        $ionicLoading.show({
                            template: 'Error occured. try after sometime',
                            duration: 3000
                        });
                    });
              };
            
            $scope.addBookmark = function(postId, title, date, featured_image) {
                $localStorage.$default({bookmarks: {id:[], data: []}});
                var bookmarks = $localStorage.bookmarks;
                var index = bookmarks.id.indexOf(postId);
                if (index === -1) {
                    bookmarks.data.push({id: postId, title: title, date: date, featured_image: featured_image});
                    bookmarks.id.push(postId);
                } else {
                    bookmarks.data.splice(index,1);
                    bookmarks.id.splice(index,1);
                }
                $ionicLoading.show({
                    template: 'Bookmark saved',
                    duration: 1000
                });
            };
            
            if ($stateParams.categoryId) {
                filters.push('filter[cat]='+ $stateParams.categoryId);
            }
            if ($stateParams.tagName) {
                filters.push('filter[tag]='+ $stateParams.tagName);
            }
            if ($stateParams.authorId) {
                filters.push('filter[author]='+ $stateParams.authorId);
            }

            $scope.doRefresh();        
        })

        .controller('PostCtrl', function ($scope, $stateParams, $sce, $ionicLoading, $cordovaSocialSharing, PostService, AccessService, $ionicScrollDelegate) {
            $scope.shareAnywhere = function() {
                $cordovaSocialSharing.share($scope.post.title, $scope.post.title, $scope.post.featured_image.source, $scope.post.link);
            };
            $ionicLoading.show({
                template: 'Loading post'
            });
            $scope.addComment = function() {
                $ionicLoading.show({
                    template: "Submiting comment..."
                });
                PostService.submitComment($scope.post.ID, $scope.new_comment).then(function(n) {
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
                    $scope.post = data;
                    // must use trustAsHtml to get raw HTML from WordPress
                    $scope.content = $sce.trustAsHtml(data.content);
                    PostService.getComments(data.ID)
                        .then(function (comments) {
                            $scope.comments = _.map(comments, function(comment) {
                                return comment.author ? (PostService.getUserGravatar(comment.author.ID).then(function(n) {
                                    comment.user_gravatar = n.avatar;
                                }), comment) : comment;
                            });
                            $ionicLoading.hide();
                        }, function(e) {
                            $ionicLoading.show({
                                template: 'Error occured. try after sometime',
                                duration: 3000
                            });
                        });
                }, function(e) {
                    $ionicLoading.show({
                        template: 'Error occured. try after sometime',
                        duration: 3000
                    });
                });
        })

        .controller('CategoryCtrl', function ($scope, $http, WORDPRESS_JSON_API_URL) {
            // Get categories
            var categoryApi = WORDPRESS_JSON_API_URL + 'taxonomies/category/terms?_jsonp=JSON_CALLBACK';

            $http.jsonp(categoryApi).
                    success(function (data, status, headers, config) {
                        $scope.categories = data;
                    }).
                    error(function (data, status, headers, config) {
                        console.log('Category load error.');
                    });
        })

        .controller('TagsCtrl', function ($scope, $http, WORDPRESS_JSON_API_URL) {
            // Get tags
            var tagsApi = WORDPRESS_JSON_API_URL + 'taxonomies/post_tag/terms?_jsonp=JSON_CALLBACK';

            $http.jsonp(tagsApi).
                    success(function (data, status, headers, config) {
                        $scope.tags = data;
                    }).
                    error(function (data, status, headers, config) {
                        console.log('Tags load error.');
                    });
        })

        .controller('AuthorsCtrl', function ($scope, $http, WORDPRESS_JSON_API_URL) {
            // Get authors
            var authorsApi = WORDPRESS_JSON_API_URL + 'users?_jsonp=JSON_CALLBACK';

            $http.jsonp(authorsApi).
                    success(function (data, status, headers, config) {
                        $scope.authors = data;
                    }).
                    error(function (data, status, headers, config) {
                        console.log('Authors load error.');
                    });
        })

        .controller('SearchCtrl', function ($scope, $http, WORDPRESS_JSON_API_URL) {
            $scope.formData = {};
            $scope.getResults = function () {
                var searchApi = WORDPRESS_JSON_API_URL + 'posts?filter[s]=' + $scope.formData.term + '&_jsonp=JSON_CALLBACK';
                $http.jsonp(searchApi).
                        success(function (data, status, headers, config) {
                            $scope.posts = data;
                        }).
                        error(function (data, status, headers, config) {
                            console.log('Search results error.');
                        });
            }
        })

        .controller('ProfileCtrl', function ($scope, $state, $ionicLoading, AccessService) {
            $scope.user = {};
            var userData = AccessService.getUser();

            $scope.user = {
                userName: userData.data.nickname,
                email: userData.data.email,
                displayName: userData.data.displayname
            };
            $scope.doRegister = function() {
                $ionicLoading.show({
                    template: "Updating user..."
                });
                var s = {
                    password: $scope.user.password,
                    email: $scope.user.email,
                    displayName: $scope.user.displayName
                };
                AccessService.doRegister(s).then(function() {
                    $state.go("app.home"), $ionicLoading.hide();
                }, function(n) {
                    $scope.error = n, $ionicLoading.hide();
                });
            };
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