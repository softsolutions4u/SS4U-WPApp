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
            }]);