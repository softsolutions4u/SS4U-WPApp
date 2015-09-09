angular.module("starter.factory", [])

        /**
         * Network connectivity monitor
         * 
         * @param {type} $rootScope      rootscope
         * @param {type} $cordovaNetwork coredovaNetwork
         * @param {type} $state          switch the state of the view
         * @returns {factory_L5.factoryAnonym$1}
         */
        .factory('ConnectivityMonitor', function ($rootScope, $cordovaNetwork, $state) {

            return {
                //Check network connection is online
                isOnline: function () {
                    if (ionic.Platform.isWebView()) {
                        return $cordovaNetwork.isOnline();
                    } else {
                        return navigator.onLine;
                    }
                },
                //Check network connection is offline
                ifOffline: function () {
                    if (ionic.Platform.isWebView()) {
                        return !$cordovaNetwork.isOnline();
                    } else {
                        return !navigator.onLine;
                    }
                },
                //Check the network connection status
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