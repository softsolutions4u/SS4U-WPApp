angular.module("starter.directives", [])
        .directive("ionYoutubeVideo", ["$ionicPlatform", "youtubeEmbedUtils", function ($ionicPlatform, youtubeEmbedUtils) {
                return {
                    restrict: "E",
                    scope: {
                        videoId: "@"
                    },
                    controller: ["$scope", function ($scope) {
                            $scope.playerVars = {
                                rel: 0,
                                showinfo: 0
                            }, $ionicPlatform.on("pause", function () {
                                var e = youtubeEmbedUtils.ready;
                                e && $scope.ytVideo.stopVideo();
                            });
                        }],
                    templateUrl: "templates/youtube-video.html",
                    replace: false
                };
            }])
        .directive("postDetails", ["$timeout", "_", "$compile", function ($timeout, _, $compile) {
                return {
                    restrict: "A",
                    scope: {},
                    link: function (scope, el, attr) {
                        function isYoutubeUrl(url) {
                            var exp = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11,})(?:\S+)?$/gim;
                            return url.match(exp) ? RegExp.$1 : false;
                        }
                        $timeout(function () {
                            var iframes = el.find("iframe");
                            iframes.length > 0 && angular.forEach(iframes, function (iframe) {
                                var i = angular.element(iframe),
                                    s = i.length > 0 && !_.isUndefined(i[0].src) ? isYoutubeUrl(i[0].src) : false;
                                if (s !== false) {
                                    var r = $compile("<ion-youtube-video video-id='" + s + "'></ion-youtube-video>")(scope);
                                    i.parent().append(r);
                                    i.remove();
                                }
                            });
                        }, 1000);
                    }
                };
            }])
        .directive("stopImageClickEvent", function ($timeout) {
            return {
                restrict: 'A',
                link: function (scope, element, attr) {
                    $timeout(function () {
                        var elem = element.prop("tagName") === 'IMG' ? element : element.find('img');
                        if (elem.length !== 0) {
                            elem.bind('click', function (e) {
                                e.preventDefault();
                            });
                        }
                    }, 1000);
                }
            };
        })
        .directive("replaceProfileImageSrc", function($timeout) {
            return {
                restrict: 'A',
                link: function (scope, element, attr) {
                    $timeout(function () {
                        var elemSrc = element.prop("tagName") === 'IMG' ? element.attr("src") : '';
                        if (elemSrc.length > 0) {
                            if (elemSrc.indexOf('http') !== 0) {
                                element.attr("src", elemSrc.replace(elemSrc.slice(0, elemSrc.indexOf('.')), 'http://www'));
                            }
                        }
                    }, 2000);
                }
            };
        });
        