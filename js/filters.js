angular.module("starter.filters", [])
        .filter("rawHtml", ["$sce", function ($sce) {
            return function (text) {
                return $sce.trustAsHtml(text);
            };
        }]);