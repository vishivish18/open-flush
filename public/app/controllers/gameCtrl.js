angular.module('app')
    .controller('gameCtrl', function($scope, $http, $location) {

        $scope.playAgain = function() {
            $http.get('api/game/cards')
                .then(function(res) {
                    $scope.cards = res.data;
                }, function(err) {

                })
        }
        $scope.playAgain();




    })
