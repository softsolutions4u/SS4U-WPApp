angular.module("starter.services", [])

        /**
         * User authentication
         * 
         * @param {type} e  rootscope
         * @param {type} n  Send http request and return response
         * @param {type} t  Service which helps you run functions asynchronously
         * @param {type} o  Wordpress API url
         * @returns null
         */
        .service("AccessService", ["$rootScope", "$http", "$q", "WORDPRESS_API_URL", function (e, n, t, o) {
            //Validate user authentication using  authentication cookie saved user mobile device
            this.validateAuth = function (e) {
                var s = t.defer();
                return n.jsonp(o + "user/validate_auth_cookie/?cookie=" + e.cookie + "&callback=JSON_CALLBACK").success(function (e) {
                    s.resolve(e);
                }).error(function (e) {
                    s.reject(e);
                }), s.promise;
            }, 
            //User login authentication credentials
            this.doLogin = function (e) {
                var n = t.defer(),
                    o = t.defer(),
                    s = this;
                return s.requestNonce("user", "generate_auth_cookie").then(function (e) {
                    o.resolve(e);
                }, function(e) {
                    n.reject('Error occured. try after sometime');
                }), o.promise.then(function (t) {
                    s.generateAuthCookie(e.userName, e.password, t).then(function (e) {
                        if ("error" === e.status)
                            n.reject(e.error);
                        else {
                            var t = {
                                cookie: e.cookie,
                                data: e.user,
                                user_id: e.user.id
                            };
                            s.saveUser(t), s.updateUserAvatar().then(function () {
                                n.resolve(t);
                            }, function(e) {
                                n.reject('Error occured. try after sometime');
                            });
                        }
                    }, function(e) {
                        n.reject('Error occured. try after sometime');
                    });
                }), n.promise;
            },
            //Create a user with given credentials
            this.doRegister = function (e) {
                var n = t.defer(),
                        o = t.defer(),
                        s = this;
                return s.requestNonce("user", "register").then(function (e) {
                    o.resolve(e);
                }, function(e) {
                    n.reject('Error occured. try after sometime');
                }), o.promise.then(function (t) {
                    s.registerUser(e.userName, e.email, e.displayName, e.password, t).then(function (t) {
                        "error" === t.status ? n.reject(t.error) : s.doLogin(e).then(function () {
                            n.resolve(e);
                        });
                    }, function(e) {
                        n.reject('Error occured. try after sometime');
                    });
                }), n.promise;
            },
            //Generate a token for make a request in WordPress
            this.requestNonce = function (e, s) {
                var i = t.defer();
                return n.jsonp(o + "get_nonce/?controller=" + e + "&method=" + s + "&callback=JSON_CALLBACK").success(function (e) {
                    i.resolve(e.nonce);
                }).error(function (e) {
                    i.reject(e);
                }), i.promise;
            },
            //Send a forgot/reset password request with given email
            this.forgotPassword = function (e) {
                var s = t.defer();
                return n.jsonp(o + "user/retrieve_password/?user_login=" + e + "&callback=JSON_CALLBACK").success(function (e) {
                    s.resolve(e);
                }).error(function (e) {
                    s.reject(e);
                }), s.promise;
            }, 
            //Generate authentication cookie using username, password, nounce
            this.generateAuthCookie = function (e, s, i) {
                var a = t.defer();
                return n.jsonp(o + "user/generate_auth_cookie/?username=" + e + "&password=" + s + "&nonce=" + i + "&callback=JSON_CALLBACK").success(function (e) {
                    a.resolve(e);
                }).error(function (e) {
                    a.reject(e);
                }), a.promise;
            }, this.saveUser = function (e) {
                window.localStorage.user = JSON.stringify(e)
            }, this.getUser = function () {
                return {
                    avatar: JSON.parse(window.localStorage.user_avatar || null),
                    data: JSON.parse(window.localStorage.user || null).data,
                    cookie: JSON.parse(window.localStorage.user || null).cookie
                }
            }, this.registerUser = function (e, s, i, a, r) {
                var l = t.defer();
                return n.jsonp(o + "user/register/?username=" + e + "&email=" + s + "&display_name=" + i + "&user_pass=" + a + "&nonce=" + r + "&callback=JSON_CALLBACK").success(function (e) {
                    l.resolve(e);
                }).error(function (e) {
                    l.reject(e);
                }), l.promise;
            }, this.userIsLoggedIn = function () {
                var e = t.defer(),
                        n = JSON.parse(window.localStorage.user || null);
                return null !== n && null !== n.cookie ? this.validateAuth(n).then(function (n) {
                    e.resolve(n.valid);
                }, function(n) {
                    e.reject('Error occured. try after sometime');
                }) : e.resolve(!1), e.promise;
            }, this.logOut = function () {
                window.localStorage.user = null, window.localStorage.user_avatar = null
            }, this.updateUserAvatar = function () {
                var e = t.defer(),
                    s = JSON.parse(window.localStorage.user || null);
                return n.jsonp(o + "user/get_avatar/?user_id=" + s.user_id + "&type=full&callback=JSON_CALLBACK").success(function (n) {
                    window.localStorage.user_avatar = JSON.stringify(n.avatar), e.resolve(n.avatar)
                }).error(function (n) {
                    e.reject(n);
                }), e.promise;
            };
        }])
         
         /**
          * Post service that performs get posts, submit comment, user avatar, shorten posts
          * 
          * @param {type} $http             Send http request and receive return response
          * @param {type} $q                Service which helps you run functions asynchronously
          * @param {type} WORDPRESS_API_URL Wordpress API url
          * @param {type} AccessService     Access service for authentications
          * @returns null
          */
        .service("PostService", function($http, $q, WORDPRESS_API_URL, AccessService){
            //Get all the posts from WordPress API url
            this.getPosts = function(filters, pageId) {
                var filterQuery = '',
                    postsApi,
                    defer = $q.defer();

                if (filters.length) {
                    filterQuery = '&' + filters.join('&');
                }
                postsApi = WORDPRESS_API_URL + 'get_recent_posts/?page=' + pageId + '&callback=JSON_CALLBACK'+ filterQuery;
                return $http.jsonp(postsApi).success(function(e) {
                    defer.resolve(e);
                }).error(function(e) {
                    defer.reject(e);
                }), defer.promise;
            };
            
            //Get the post from WordPress API url by using postId
            this.getPost = function(postId) {
                var postApi,
                    defer = $q.defer();
                postApi = WORDPRESS_API_URL + 'get_post/?callback=JSON_CALLBACK&id=' + postId;
                return $http.jsonp(postApi).success(function(e) {
                    defer.resolve(e);
                }).error(function(e) {
                    defer.reject(e);
                }), defer.promise;
            };
            
            //Submit a comment for post
            this.submitComment = function(postId, content) {
                var a = $q.defer(),
                    r = AccessService.getUser();
                return $http.jsonp(WORDPRESS_API_URL + "user/post_comment/?post_id=" + postId + "&cookie=" + r.cookie + "&comment_status=1&content=" + content + "&callback=JSON_CALLBACK").success(function(e) {
                    a.resolve(e);
                }).error(function(e) {
                    a.reject(e);
                }), a.promise;
            };
            
            //Get the user profile picture
            this.getUserGravatar = function(userId) {
                var s = $q.defer();
                return $http.jsonp(WORDPRESS_API_URL + "user/get_avatar/?user_id=" + userId + "&type=full&callback=JSON_CALLBACK").success(function(e) {
                    s.resolve(e);
                }).error(function(e) {
                    s.reject(e);
                }), s.promise;
            };
            
            //Make a post content to shortens posts
            this.shortenPosts = function(posts) {
                var wordCount = 1000;
                return _.map(posts, function(post) {
                    if (post.content.length > wordCount) {
                        var content = post.content.substr(0, wordCount);
                            content = content.substr(0, Math.min(content.length, content.lastIndexOf("</p>")));
                        post.content = content;
                    }
                    return post;
                });
            };
        })
        
        /**
         * Add/Remove Bookmark post
         * 
         * @param {type} $localStorage  local storage
         * @param {type} $ionicLoading  'Loading' image / text
         * @returns {undefined}
         */
        .service('BookmarkService', function($localStorage, $ionicLoading) {
            
            //Check if the 'post' is Bookmarked or not
            this.isBookmarked = function(postId) {
                $localStorage.$default({bookmarks: {id:[], data: []}});
                var bookmarks = $localStorage.bookmarks;
                var index = bookmarks.id.indexOf(parseInt(postId));
                return index !== -1;
            };
            
            //Add / remove the Bookmark of the post
            this.addBookmark = function(postId, title, date) {
                $ionicLoading.show({
                    template: 'Loading...'
                });
                //Initialize Bookmarks to save in local storage of the device
                $localStorage.$default({bookmarks: {id:[], data: []}});
                var bookmarks = $localStorage.bookmarks;
                var postId = parseInt(postId);
                var index = bookmarks.id.indexOf(postId);
                if (index === -1) {
                    //Add Bookmark post to local storage of the device
                    bookmarks.data.push({id: postId, title: title, date: date});
                    bookmarks.id.push(postId);
                    bookmarkStatus = 'Bookmarked';
                } else {
                    //Remove bookmark post from local storage of the device
                    bookmarks.data.splice(index,1);
                    bookmarks.id.splice(index,1);
                    bookmarkStatus = 'Unbookmarked';
                }
                //Show Ionic 'Loading Bookmark' text
                $ionicLoading.show({
                    template: bookmarkStatus,
                    duration: 1000
                });
            };
        })

        .service('PushNotificationService', ['$rootScope', '$state', '$cordovaPush', 'GCM_PROJECT_ID', 'WordpressPushService', function($rootScope, $state, $cordovaPush, GCM_PROJECT_ID, WordpressPushService) {
                this.register = function() {
                    var config = null;
                    if (ionic.Platform.isAndroid()) {
                        config = {
                            "senderID": GCM_PROJECT_ID
                        };
                    }

                    if (config === null) {
                        return;
                    }
                    $cordovaPush.register(config);
                };

                // Notification Received
                $rootScope.$on('$cordovaPush:notificationReceived', function (event, notification) {
                    switch (notification.event) {
                        case "registered":
                            notification.regid.length > 0 && WordpressPushService.storeDeviceToken("android", notification.regid);
                            break;
                        case "message":
                            if (notification.foreground) {
                                WordpressPushService.handleForeGroundNotification(notification);
                            } else {
                                if (notification.payload && (notification.payload.type === 'new' || notification.payload.type === 'edit')) {
                                    $state.go('app.post', {postId: notification.payload.postId});
                                }
                            }
                            break;
                        case "error":
                            break;
                    }
                });
        }])

        .service('WordpressPushService', ['$http', '$q', '$state', '$ionicPopup', '$localStorage', 'WORDPRESS_API_URL', function($http, $q, $state, $ionicPopup, $localStorage, WORDPRESS_API_URL) {
            this.storeDeviceToken = function(platform, token) {
                var s = $q.defer();
                return $http.jsonp(WORDPRESS_API_URL + 'ipa_push/register/?id=' + token +'&callback=JSON_CALLBACK').success(function(e) {
                    $localStorage.gcmTokenId = token;
                    s.resolve(e);
                }).error(function(e) {
                    s.reject(e);
                }), s.promise;
            };

            this.handleForeGroundNotification = function(notification) {
                if (notification.payload && (notification.payload.type === 'new' || notification.payload.type === 'edit')) {
                    var title = notification.payload.type === 'new' ? 'New Post added' : 'Post is updated';
                    var confirmPopup = $ionicPopup.confirm({
                        title: title,
                        template: notification.payload.title + ' ' + notification.payload.message
                    });
                    confirmPopup.then(function(res) {
                        if(res) {
                          $state.go('app.post', {postId: notification.payload.postId});
                        }
                        confirmPopup.close();
                    });
                }
            };
        }])
        .service('settingsService', ['$http', '$q', 'WORDPRESS_API_URL', '$localStorage', function ($http, $q, WORDPRESS_API_URL, $localStorage) {
            this.changeNotificationStatus = function (status) {
                var s = $q.defer();
                var notificationStatusApi = WORDPRESS_API_URL + 'ipa_push/change_status/?id=' + $localStorage.gcmTokenId + '&status=' + status + '&callback=JSON_CALLBACK';
                return $http.jsonp(notificationStatusApi).success(function (e) {
                  s.resolve(e);
                }).error(function (e) {
                  s.reject(e);
                }), s.promise;
            };

            this.getNotificationStatus = function () {
                var g = $q.defer();
                var notificationStatusApi = WORDPRESS_API_URL + 'ipa_push/get_status/?id=' + $localStorage.gcmTokenId + '&callback=JSON_CALLBACK';
                return $http.jsonp(notificationStatusApi).success(function (e) {
                  g.resolve(e);
                }).error(function (e) {
                  g.reject(e);
                }), g.promise;
              };
          }]);
