angular.module('app')
    .controller('homeCtrl', function($scope, $http, prognitor) {



        $scope.setup = function() {
            console.log("in chat");
            $scope.gameid = Math.round((Math.random() * 1000000));
        }

        $scope.setup();






    })
