angular.module('app',[
'ngRoute','ui.router'
])
angular.module('app')
    .controller('errorCtrl', ["$scope", "$rootScope", function($scope, $rootScope) {
        $scope.hello = "this is from the controller hello"
        console.log($scope.hello)



    }])

angular.module('app')
    .controller('gameCtrl', ["$scope", "$http", "$location", function($scope, $http, $location) {






    }])

angular.module('app')
    .controller('homeCtrl', ["$scope", "$http", "prognitor", function($scope, $http, prognitor) {



        $scope.setup = function() {
            console.log("in chat");
            $scope.gameid = Math.round((Math.random() * 1000000));
        }

        $scope.setup();






    }])

angular.module('app')
    .controller('loginCtrl', ["$scope", "auth", "$location", "$timeout", function($scope, auth, $location, $timeout) {
        $scope.authFail = false;
        $scope.login = function(username, password) {
            auth.login(username, password)
                .then(function(res) {
                    auth.storeToken(res.data, function() {
                        auth.getUser()
                            .then(function(res) {
                                auth.postLoginOps(res.data, function() {
                                    auth.postLoginRouteHandler();
                                });
                            })
                    });

                })
                .catch(function(response) {
                    console.error('Gists error', response.status, response.data);
                    if (response.status == 401) {
                        $scope.authFail = true
                        $timeout(function() { $scope.authFail = false; }, 3000);
                    }
                })
                .finally(function() {
                    console.log("finally finished gists");
                });


        }
    }])

angular.module('app')
    .controller('masterCtrl', ["$scope", "$rootScope", "$route", "$http", function($scope, $rootScope, $route, $http) {
        console.log("masterCtrl");

        if (localStorage.getItem('logged_user')) {        	
            $rootScope.currentUser = localStorage.getItem('logged_user')
            $http.defaults.headers.common['x-auth'] = localStorage.getItem('user_token')
            console.log(localStorage.getItem('user_token'))
        }
        $scope.$on('login', function(_, user) {
            console.log("Logged In");
            $scope.currentUser = user
            $rootScope.currentUser = user
            localStorage.setItem('logged_user', $rootScope.currentUser.username)
        })
    }])

angular.module('app')
    .controller('navCtrl', ["$scope", "auth", "$location", function($scope, auth, $location) {        
        $scope.logout = function() {            
            auth.logout()                

        }
    }])

angular.module('app')
.controller('registerCtrl',["$scope", "auth", "$location", function($scope,auth,$location){
	$scope.oauth = function(provider){
		console.log(provider)
		window.open('http://localhost:1805/auth/'+provider)
	}

	$scope.register = function(name,username,password){
		auth.register(name,username,password)
		.then(function(response){			
			auth.login(username,password)
			$scope.$emit('login',response.data)
			$location.path('/home')
		})
		.catch(function (err){
			console.log(err)
		})
	}

}])

angular.module('app')
    .config(["$stateProvider", "$urlRouterProvider", "$locationProvider", function($stateProvider, $urlRouterProvider, $locationProvider) {

        $urlRouterProvider.otherwise('/');

        $stateProvider
        //     .state('app', {
        //         url: '/',
        //         views: {
        //             'header': {
        //                 templateUrl: '/nav.html',
        //                 controller: 'navCtrl'
        //             },
        //             'content': {
        //                 templateUrl: '/login.html',
        //                 controller: 'loginCtrl'
        //             }
        //         }
        //     })

        // .state('app.login', {
        //     url: 'login',
        //     views: {
        //         'header': {
        //             templateUrl: '/nav.html',
        //             controller: 'navCtrl'
        //         },
        //         'content': {
        //             templateUrl: '/login.html',
        //             controller: 'loginCtrl'

        //         }
        //     }
        // })

        // .state('app.register', {
        //     url: 'register',
        //     views: {
        //         'content@': {
        //             templateUrl: 'register.html',
        //             controller: 'registerCtrl'
        //         }
        //     }

        // })

        // .state('app.validate', {
        //     url: 'signup/validate/:id',

        //     views: {
        //         'content@': {
        //             templateUrl: 'users/validate.html',
        //             controller: 'validateCtrl'
        //         }
        //     }

        // })
            .state('home', {
            url: '/',
            views: {
                // 'header': {
                //     templateUrl: '/nav.html',
                //     controller: 'navCtrl'
                // },
                'content': {
                    templateUrl: 'users/home.html',
                    controller: 'homeCtrl'

                }
            }
        })

        .state('home.game', {
            url: 'game/:id',
            views: {
                'content@': {
                    templateUrl: 'users/game.html',
                    controller: 'gameCtrl'

                }
            }

        })



        $locationProvider.html5Mode(true)

    }]);

angular.module('app')
    .controller('validateCtrl', ["$scope", "$http", "$stateParams", function($scope, $http, $stateParams) {


        $scope.loading = true

        $http.get('api/users/validate/' + $stateParams.id)
            .then(function(res) {
                console.log(res)
                if (res.status == 200) {
                    $scope.verified = true
                    $scope.loading = false
                } else {
                    $scope.verified = false
                    $scope.loading = false
                }

            })




    }])

angular.module('app')
    .service('auth', ["$http", "$window", "$location", "$rootScope", function($http, $window, $location, $rootScope) {


        return {
            getUser: getUser,
            login: login,
            register: register,
            logout: logout,
            storeToken: storeToken,
            isLogged: isLogged,
            postLoginOps: postLoginOps,
            postLoginRouteHandler: postLoginRouteHandler

        }

        function getUser() {
            return $http.get('api/users')
        }

        function login(username, password) {

            return $http.post('api/sessions', {
                username: username,
                password: password
            })
        }

        function register(name, username, password) {

             return $http.post('api/users', {
                name: name,
                username: username,
                password: password
            })
        }


        function logout() {
            localStorage.removeItem('user_token');
            localStorage.removeItem('logged_user');
            delete $http.defaults.headers.common['x-auth']
            $rootScope.isLogged = false;
            $rootScope.currentUser = null;
            $location.path("/login")



        }

        function storeToken(res, cb) {
            $window.sessionStorage["user_token"] = res
            localStorage.setItem('user_token', res);
            $http.defaults.headers.common['x-auth'] = $window.sessionStorage.user_token
            if (cb && (typeof cb === 'function')) {
                cb();
            }
        }

        function isLogged() {

        }

        function postLoginOps(res, cb) {

            
            $rootScope.currentUser = res.name
            localStorage.setItem('logged_user', $rootScope.currentUser)
            $rootScope.isLogged = true;
            if (cb && (typeof cb === 'function')) {
                cb();
            }
            
        }

        function postLoginRouteHandler() {
            if ($rootScope.intendedRoute) {
                $location.path($rootScope.intendedRoute);
            } else {
                $location.path('/home');
            }
        }
        

    }])


angular.module('app')
    .service('prognitor', ["$http", "$window", "$location", "$rootScope", function($http, $window, $location, $rootScope) {

        return {


            setSetupProcess: function($scope) {
                $scope.loading = false;
                console.log($scope)
                $scope.setup = function(callbackFn) {
                    if ($scope.loading) return;

                    $scope.loading = true;


                    $http.get($scope.apiUri)
                        .then(function(data) {
                            console.log(data)
                           /* $scope.state.lastPage = data.last_page;
                            $scope.isLastPage = ($scope.state.pageNum == $scope.state.lastPage);
                            $scope.loading = false;*/
                            if (callbackFn !== undefined)
                                callbackFn(data);
                        }, function(res) {
                            if (res.status == 404) {
                                $rootScope.$broadcast('render404');
                            }

                        });
                };
            },


            run: function($scope) {
                console.log("in prognitor service")
                this.setSetupProcess($scope);

            }
        }



    }])

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsImNvbnRyb2xsZXJzL2Vycm9yQ3RybC5qcyIsImNvbnRyb2xsZXJzL2dhbWVDdHJsLmpzIiwiY29udHJvbGxlcnMvaG9tZUN0cmwuanMiLCJjb250cm9sbGVycy9sb2dpbkN0cmwuanMiLCJjb250cm9sbGVycy9tYXN0ZXJDdHJsLmpzIiwiY29udHJvbGxlcnMvbmF2Q3RybC5qcyIsImNvbnRyb2xsZXJzL3JlZ2lzdGVyQ3RybC5qcyIsImNvbnRyb2xsZXJzL3JvdXRlcy5qcyIsImNvbnRyb2xsZXJzL3ZhbGlkYXRlQ3RybC5qcyIsInNlcnZpY2VzL2F1dGguanMiLCJzZXJ2aWNlcy9wcm9nbml0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsUUFBQSxPQUFBLE1BQUE7QUFDQSxVQUFBOztBQ0RBLFFBQUEsT0FBQTtLQUNBLFdBQUEsc0NBQUEsU0FBQSxRQUFBLFlBQUE7UUFDQSxPQUFBLFFBQUE7UUFDQSxRQUFBLElBQUEsT0FBQTs7Ozs7O0FDSEEsUUFBQSxPQUFBO0tBQ0EsV0FBQSw2Q0FBQSxTQUFBLFFBQUEsT0FBQSxXQUFBOzs7Ozs7Ozs7QUNEQSxRQUFBLE9BQUE7S0FDQSxXQUFBLDZDQUFBLFNBQUEsUUFBQSxPQUFBLFdBQUE7Ozs7UUFJQSxPQUFBLFFBQUEsV0FBQTtZQUNBLFFBQUEsSUFBQTtZQUNBLE9BQUEsU0FBQSxLQUFBLE9BQUEsS0FBQSxXQUFBOzs7UUFHQSxPQUFBOzs7Ozs7Ozs7QUNWQSxRQUFBLE9BQUE7S0FDQSxXQUFBLHlEQUFBLFNBQUEsUUFBQSxNQUFBLFdBQUEsVUFBQTtRQUNBLE9BQUEsV0FBQTtRQUNBLE9BQUEsUUFBQSxTQUFBLFVBQUEsVUFBQTtZQUNBLEtBQUEsTUFBQSxVQUFBO2lCQUNBLEtBQUEsU0FBQSxLQUFBO29CQUNBLEtBQUEsV0FBQSxJQUFBLE1BQUEsV0FBQTt3QkFDQSxLQUFBOzZCQUNBLEtBQUEsU0FBQSxLQUFBO2dDQUNBLEtBQUEsYUFBQSxJQUFBLE1BQUEsV0FB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c0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ2FwcCcsW1xuJ25nUm91dGUnLCd1aS5yb3V0ZXInXG5dKSIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuICAgIC5jb250cm9sbGVyKCdlcnJvckN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUpIHtcbiAgICAgICAgJHNjb3BlLmhlbGxvID0gXCJ0aGlzIGlzIGZyb20gdGhlIGNvbnRyb2xsZXIgaGVsbG9cIlxuICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUuaGVsbG8pXG5cblxuXG4gICAgfSlcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuICAgIC5jb250cm9sbGVyKCdnYW1lQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsICRsb2NhdGlvbikge1xuXG5cblxuXG5cblxuICAgIH0pXG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuY29udHJvbGxlcignaG9tZUN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRodHRwLCBwcm9nbml0b3IpIHtcblxuXG5cbiAgICAgICAgJHNjb3BlLnNldHVwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImluIGNoYXRcIik7XG4gICAgICAgICAgICAkc2NvcGUuZ2FtZWlkID0gTWF0aC5yb3VuZCgoTWF0aC5yYW5kb20oKSAqIDEwMDAwMDApKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5zZXR1cCgpO1xuXG5cblxuXG5cblxuICAgIH0pXG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuY29udHJvbGxlcignbG9naW5DdHJsJywgZnVuY3Rpb24oJHNjb3BlLCBhdXRoLCAkbG9jYXRpb24sICR0aW1lb3V0KSB7XG4gICAgICAgICRzY29wZS5hdXRoRmFpbCA9IGZhbHNlO1xuICAgICAgICAkc2NvcGUubG9naW4gPSBmdW5jdGlvbih1c2VybmFtZSwgcGFzc3dvcmQpIHtcbiAgICAgICAgICAgIGF1dGgubG9naW4odXNlcm5hbWUsIHBhc3N3b3JkKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgICAgICBhdXRoLnN0b3JlVG9rZW4ocmVzLmRhdGEsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXV0aC5nZXRVc2VyKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0aC5wb3N0TG9naW5PcHMocmVzLmRhdGEsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0aC5wb3N0TG9naW5Sb3V0ZUhhbmRsZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdHaXN0cyBlcnJvcicsIHJlc3BvbnNlLnN0YXR1cywgcmVzcG9uc2UuZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT0gNDAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuYXV0aEZhaWwgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHsgJHNjb3BlLmF1dGhGYWlsID0gZmFsc2U7IH0sIDMwMDApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZmluYWxseShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJmaW5hbGx5IGZpbmlzaGVkIGdpc3RzXCIpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgfVxuICAgIH0pXG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuY29udHJvbGxlcignbWFzdGVyQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHJvb3RTY29wZSwgJHJvdXRlLCAkaHR0cCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm1hc3RlckN0cmxcIik7XG5cbiAgICAgICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdsb2dnZWRfdXNlcicpKSB7ICAgICAgICBcdFxuICAgICAgICAgICAgJHJvb3RTY29wZS5jdXJyZW50VXNlciA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdsb2dnZWRfdXNlcicpXG4gICAgICAgICAgICAkaHR0cC5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vblsneC1hdXRoJ10gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlcl90b2tlbicpXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlcl90b2tlbicpKVxuICAgICAgICB9XG4gICAgICAgICRzY29wZS4kb24oJ2xvZ2luJywgZnVuY3Rpb24oXywgdXNlcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJMb2dnZWQgSW5cIik7XG4gICAgICAgICAgICAkc2NvcGUuY3VycmVudFVzZXIgPSB1c2VyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLmN1cnJlbnRVc2VyID0gdXNlclxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2xvZ2dlZF91c2VyJywgJHJvb3RTY29wZS5jdXJyZW50VXNlci51c2VybmFtZSlcbiAgICAgICAgfSlcbiAgICB9KVxuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgLmNvbnRyb2xsZXIoJ25hdkN0cmwnLCBmdW5jdGlvbigkc2NvcGUsIGF1dGgsICRsb2NhdGlvbikgeyAgICAgICAgXG4gICAgICAgICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHsgICAgICAgICAgICBcbiAgICAgICAgICAgIGF1dGgubG9nb3V0KCkgICAgICAgICAgICAgICAgXG5cbiAgICAgICAgfVxuICAgIH0pXG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbi5jb250cm9sbGVyKCdyZWdpc3RlckN0cmwnLGZ1bmN0aW9uKCRzY29wZSxhdXRoLCRsb2NhdGlvbil7XG5cdCRzY29wZS5vYXV0aCA9IGZ1bmN0aW9uKHByb3ZpZGVyKXtcblx0XHRjb25zb2xlLmxvZyhwcm92aWRlcilcblx0XHR3aW5kb3cub3BlbignaHR0cDovL2xvY2FsaG9zdDoxODA1L2F1dGgvJytwcm92aWRlcilcblx0fVxuXG5cdCRzY29wZS5yZWdpc3RlciA9IGZ1bmN0aW9uKG5hbWUsdXNlcm5hbWUscGFzc3dvcmQpe1xuXHRcdGF1dGgucmVnaXN0ZXIobmFtZSx1c2VybmFtZSxwYXNzd29yZClcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XHRcdFx0XG5cdFx0XHRhdXRoLmxvZ2luKHVzZXJuYW1lLHBhc3N3b3JkKVxuXHRcdFx0JHNjb3BlLiRlbWl0KCdsb2dpbicscmVzcG9uc2UuZGF0YSlcblx0XHRcdCRsb2NhdGlvbi5wYXRoKCcvaG9tZScpXG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24gKGVycil7XG5cdFx0XHRjb25zb2xlLmxvZyhlcnIpXG5cdFx0fSlcblx0fVxuXG59KVxuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuXG4gICAgICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcblxuICAgICAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAvLyAgICAgLnN0YXRlKCdhcHAnLCB7XG4gICAgICAgIC8vICAgICAgICAgdXJsOiAnLycsXG4gICAgICAgIC8vICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgLy8gICAgICAgICAgICAgJ2hlYWRlcic6IHtcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL25hdi5odG1sJyxcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICduYXZDdHJsJ1xuICAgICAgICAvLyAgICAgICAgICAgICB9LFxuICAgICAgICAvLyAgICAgICAgICAgICAnY29udGVudCc6IHtcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2xvZ2luLmh0bWwnLFxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ2xvZ2luQ3RybCdcbiAgICAgICAgLy8gICAgICAgICAgICAgfVxuICAgICAgICAvLyAgICAgICAgIH1cbiAgICAgICAgLy8gICAgIH0pXG5cbiAgICAgICAgLy8gLnN0YXRlKCdhcHAubG9naW4nLCB7XG4gICAgICAgIC8vICAgICB1cmw6ICdsb2dpbicsXG4gICAgICAgIC8vICAgICB2aWV3czoge1xuICAgICAgICAvLyAgICAgICAgICdoZWFkZXInOiB7XG4gICAgICAgIC8vICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL25hdi5odG1sJyxcbiAgICAgICAgLy8gICAgICAgICAgICAgY29udHJvbGxlcjogJ25hdkN0cmwnXG4gICAgICAgIC8vICAgICAgICAgfSxcbiAgICAgICAgLy8gICAgICAgICAnY29udGVudCc6IHtcbiAgICAgICAgLy8gICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbG9naW4uaHRtbCcsXG4gICAgICAgIC8vICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdsb2dpbkN0cmwnXG5cbiAgICAgICAgLy8gICAgICAgICB9XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vIH0pXG5cbiAgICAgICAgLy8gLnN0YXRlKCdhcHAucmVnaXN0ZXInLCB7XG4gICAgICAgIC8vICAgICB1cmw6ICdyZWdpc3RlcicsXG4gICAgICAgIC8vICAgICB2aWV3czoge1xuICAgICAgICAvLyAgICAgICAgICdjb250ZW50QCc6IHtcbiAgICAgICAgLy8gICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdyZWdpc3Rlci5odG1sJyxcbiAgICAgICAgLy8gICAgICAgICAgICAgY29udHJvbGxlcjogJ3JlZ2lzdGVyQ3RybCdcbiAgICAgICAgLy8gICAgICAgICB9XG4gICAgICAgIC8vICAgICB9XG5cbiAgICAgICAgLy8gfSlcblxuICAgICAgICAvLyAuc3RhdGUoJ2FwcC52YWxpZGF0ZScsIHtcbiAgICAgICAgLy8gICAgIHVybDogJ3NpZ251cC92YWxpZGF0ZS86aWQnLFxuXG4gICAgICAgIC8vICAgICB2aWV3czoge1xuICAgICAgICAvLyAgICAgICAgICdjb250ZW50QCc6IHtcbiAgICAgICAgLy8gICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd1c2Vycy92YWxpZGF0ZS5odG1sJyxcbiAgICAgICAgLy8gICAgICAgICAgICAgY29udHJvbGxlcjogJ3ZhbGlkYXRlQ3RybCdcbiAgICAgICAgLy8gICAgICAgICB9XG4gICAgICAgIC8vICAgICB9XG5cbiAgICAgICAgLy8gfSlcbiAgICAgICAgICAgIC5zdGF0ZSgnaG9tZScsIHtcbiAgICAgICAgICAgIHVybDogJy8nLFxuICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAvLyAnaGVhZGVyJzoge1xuICAgICAgICAgICAgICAgIC8vICAgICB0ZW1wbGF0ZVVybDogJy9uYXYuaHRtbCcsXG4gICAgICAgICAgICAgICAgLy8gICAgIGNvbnRyb2xsZXI6ICduYXZDdHJsJ1xuICAgICAgICAgICAgICAgIC8vIH0sXG4gICAgICAgICAgICAgICAgJ2NvbnRlbnQnOiB7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndXNlcnMvaG9tZS5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ2hvbWVDdHJsJ1xuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIC5zdGF0ZSgnaG9tZS5nYW1lJywge1xuICAgICAgICAgICAgdXJsOiAnZ2FtZS86aWQnLFxuICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAnY29udGVudEAnOiB7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndXNlcnMvZ2FtZS5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ2dhbWVDdHJsJ1xuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pXG5cblxuXG4gICAgICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKVxuXG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuY29udHJvbGxlcigndmFsaWRhdGVDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCwgJHN0YXRlUGFyYW1zKSB7XG5cblxuICAgICAgICAkc2NvcGUubG9hZGluZyA9IHRydWVcblxuICAgICAgICAkaHR0cC5nZXQoJ2FwaS91c2Vycy92YWxpZGF0ZS8nICsgJHN0YXRlUGFyYW1zLmlkKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzKVxuICAgICAgICAgICAgICAgIGlmIChyZXMuc3RhdHVzID09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudmVyaWZpZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5sb2FkaW5nID0gZmFsc2VcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudmVyaWZpZWQgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubG9hZGluZyA9IGZhbHNlXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KVxuXG5cblxuXG4gICAgfSlcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuICAgIC5zZXJ2aWNlKCdhdXRoJywgZnVuY3Rpb24oJGh0dHAsICR3aW5kb3csICRsb2NhdGlvbiwgJHJvb3RTY29wZSkge1xuXG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGdldFVzZXI6IGdldFVzZXIsXG4gICAgICAgICAgICBsb2dpbjogbG9naW4sXG4gICAgICAgICAgICByZWdpc3RlcjogcmVnaXN0ZXIsXG4gICAgICAgICAgICBsb2dvdXQ6IGxvZ291dCxcbiAgICAgICAgICAgIHN0b3JlVG9rZW46IHN0b3JlVG9rZW4sXG4gICAgICAgICAgICBpc0xvZ2dlZDogaXNMb2dnZWQsXG4gICAgICAgICAgICBwb3N0TG9naW5PcHM6IHBvc3RMb2dpbk9wcyxcbiAgICAgICAgICAgIHBvc3RMb2dpblJvdXRlSGFuZGxlcjogcG9zdExvZ2luUm91dGVIYW5kbGVyXG5cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGdldFVzZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCdhcGkvdXNlcnMnKVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gbG9naW4odXNlcm5hbWUsIHBhc3N3b3JkKSB7XG5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCdhcGkvc2Vzc2lvbnMnLCB7XG4gICAgICAgICAgICAgICAgdXNlcm5hbWU6IHVzZXJuYW1lLFxuICAgICAgICAgICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZFxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlZ2lzdGVyKG5hbWUsIHVzZXJuYW1lLCBwYXNzd29yZCkge1xuXG4gICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJ2FwaS91c2VycycsIHtcbiAgICAgICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSxcbiAgICAgICAgICAgICAgICBwYXNzd29yZDogcGFzc3dvcmRcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuXG4gICAgICAgIGZ1bmN0aW9uIGxvZ291dCgpIHtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd1c2VyX3Rva2VuJyk7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnbG9nZ2VkX3VzZXInKTtcbiAgICAgICAgICAgIGRlbGV0ZSAkaHR0cC5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vblsneC1hdXRoJ11cbiAgICAgICAgICAgICRyb290U2NvcGUuaXNMb2dnZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICRyb290U2NvcGUuY3VycmVudFVzZXIgPSBudWxsO1xuICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoXCIvbG9naW5cIilcblxuXG5cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHN0b3JlVG9rZW4ocmVzLCBjYikge1xuICAgICAgICAgICAgJHdpbmRvdy5zZXNzaW9uU3RvcmFnZVtcInVzZXJfdG9rZW5cIl0gPSByZXNcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd1c2VyX3Rva2VuJywgcmVzKTtcbiAgICAgICAgICAgICRodHRwLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWyd4LWF1dGgnXSA9ICR3aW5kb3cuc2Vzc2lvblN0b3JhZ2UudXNlcl90b2tlblxuICAgICAgICAgICAgaWYgKGNiICYmICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpKSB7XG4gICAgICAgICAgICAgICAgY2IoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGlzTG9nZ2VkKCkge1xuXG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBwb3N0TG9naW5PcHMocmVzLCBjYikge1xuXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICRyb290U2NvcGUuY3VycmVudFVzZXIgPSByZXMubmFtZVxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2xvZ2dlZF91c2VyJywgJHJvb3RTY29wZS5jdXJyZW50VXNlcilcbiAgICAgICAgICAgICRyb290U2NvcGUuaXNMb2dnZWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKGNiICYmICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpKSB7XG4gICAgICAgICAgICAgICAgY2IoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcG9zdExvZ2luUm91dGVIYW5kbGVyKCkge1xuICAgICAgICAgICAgaWYgKCRyb290U2NvcGUuaW50ZW5kZWRSb3V0ZSkge1xuICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCRyb290U2NvcGUuaW50ZW5kZWRSb3V0ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvaG9tZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuXG4gICAgfSlcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgLnNlcnZpY2UoJ3Byb2duaXRvcicsIGZ1bmN0aW9uKCRodHRwLCAkd2luZG93LCAkbG9jYXRpb24sICRyb290U2NvcGUpIHtcblxuICAgICAgICByZXR1cm4ge1xuXG5cbiAgICAgICAgICAgIHNldFNldHVwUHJvY2VzczogZnVuY3Rpb24oJHNjb3BlKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUpXG4gICAgICAgICAgICAgICAgJHNjb3BlLnNldHVwID0gZnVuY3Rpb24oY2FsbGJhY2tGbikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmxvYWRpbmcpIHJldHVybjtcblxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubG9hZGluZyA9IHRydWU7XG5cblxuICAgICAgICAgICAgICAgICAgICAkaHR0cC5nZXQoJHNjb3BlLmFwaVVyaSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogJHNjb3BlLnN0YXRlLmxhc3RQYWdlID0gZGF0YS5sYXN0X3BhZ2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmlzTGFzdFBhZ2UgPSAoJHNjb3BlLnN0YXRlLnBhZ2VOdW0gPT0gJHNjb3BlLnN0YXRlLmxhc3RQYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUubG9hZGluZyA9IGZhbHNlOyovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrRm4gIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tGbihkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXMuc3RhdHVzID09IDQwNCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3JlbmRlcjQwNCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0sXG5cblxuICAgICAgICAgICAgcnVuOiBmdW5jdGlvbigkc2NvcGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImluIHByb2duaXRvciBzZXJ2aWNlXCIpXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTZXR1cFByb2Nlc3MoJHNjb3BlKTtcblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cblxuXG4gICAgfSlcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
