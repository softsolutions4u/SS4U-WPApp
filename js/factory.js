angular.module("starter.factory", [])
        .factory('ConnectivityMonitor', function ($rootScope, $cordovaNetwork, $state) {

            return {
                isOnline: function () {
                    if (ionic.Platform.isWebView()) {
                        return $cordovaNetwork.isOnline();
                    } else {
                        return navigator.onLine;
                    }
                },
                ifOffline: function () {
                    if (ionic.Platform.isWebView()) {
                        return !$cordovaNetwork.isOnline();
                    } else {
                        return !navigator.onLine;
                    }
                },
                startWatching: function () {

                    if (ionic.Platform.isWebView()) {

                        $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
                            $state.go('app.home');
                        });

                        $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
                            $state.go('offline');
                        });

                    } else {

                        window.addEventListener("online", function (e) {
                            $state.go('app.home');
                        }, false);

                        window.addEventListener("offline", function (e) {
                            $state.go('offline');
                        }, false);
                    }
                }
            };
        });