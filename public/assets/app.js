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

        $scope.playAgain = function() {
            $http.get('api/game/cards')
                .then(function(res) {
                    $scope.cards = res.data;
                }, function(err) {

                })
        }
        $scope.playAgain();




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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsImNvbnRyb2xsZXJzL2Vycm9yQ3RybC5qcyIsImNvbnRyb2xsZXJzL2dhbWVDdHJsLmpzIiwiY29udHJvbGxlcnMvaG9tZUN0cmwuanMiLCJjb250cm9sbGVycy9sb2dpbkN0cmwuanMiLCJjb250cm9sbGVycy9tYXN0ZXJDdHJsLmpzIiwiY29udHJvbGxlcnMvbmF2Q3RybC5qcyIsImNvbnRyb2xsZXJzL3JlZ2lzdGVyQ3RybC5qcyIsImNvbnRyb2xsZXJzL3JvdXRlcy5qcyIsImNvbnRyb2xsZXJzL3ZhbGlkYXRlQ3RybC5qcyIsInNlcnZpY2VzL2F1dGguanMiLCJzZXJ2aWNlcy9wcm9nbml0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsUUFBQSxPQUFBLE1BQUE7QUFDQSxVQUFBOztBQ0RBLFFBQUEsT0FBQTtLQUNBLFdBQUEsc0NBQUEsU0FBQSxRQUFBLFlBQUE7UUFDQSxPQUFBLFFBQUE7UUFDQSxRQUFBLElBQUEsT0FBQTs7Ozs7O0FDSEEsUUFBQSxPQUFBO0tBQ0EsV0FBQSw2Q0FBQSxTQUFBLFFBQUEsT0FBQSxXQUFBOztRQUVBLE9BQUEsWUFBQSxXQUFBO1lBQ0EsTUFBQSxJQUFBO2lCQUNBLEtBQUEsU0FBQSxLQUFBO29CQUNBLE9BQUEsUUFBQSxJQUFBO21CQUNBLFNBQUEsS0FBQTs7OztRQUlBLE9BQUE7Ozs7Ozs7QUNYQSxRQUFBLE9BQUE7S0FDQSxXQUFBLDZDQUFBLFNBQUEsUUFBQSxPQUFBLFdBQUE7Ozs7UUFJQSxPQUFBLFFBQUEsV0FBQTtZQUNBLFFBQUEsSUFBQTtZQUNBLE9BQUEsU0FBQSxLQUFBLE9BQUEsS0FBQSxXQUFBOzs7UUFHQSxPQUFBOzs7Ozs7Ozs7QUNWQSxRQUFBLE9BQUE7S0FDQSxXQUFBLHlEQUFBLFNBQUEsUUFBQSxNQUFBLFdBQUEsVUFBQTtRQUNBLE9BQUEsV0FBQTtRQUNBLE9BQUEsUUFBQSxTQUFBLFVBQUEsVUFBQTtZQUNBLEtBQUEsTUFBQSxVQUFBO2lCQUNBLEtB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VUFBQSxVQUFBOzthQUVBLE9BQUEsTUFBQSxLQUFBLGFBQUE7Z0JBQ0EsTUFBQTtnQkFDQSxVQUFBO2dCQUNBLFVBQUE7Ozs7O1FBS0EsU0FBQSxTQUFBO1lBQ0EsYUFBQSxXQUFBO1lBQ0EsYUFBQSxXQUFBO1lBQ0EsT0FBQSxNQUFBLFNBQUEsUUFBQSxPQUFBO1lBQ0EsV0FBQSxXQUFBO1lBQ0EsV0FBQSxjQUFBO1lBQ0EsVUFBQSxLQUFBOzs7Ozs7UUFNQSxTQUFBLFdBQUEsS0FBQSxJQUFBO1lBQ0EsUUFBQSxlQUFBLGdCQUFBO1lBQ0EsYUFBQSxRQUFBLGNBQUE7WUFDQSxNQUFBLFNBQUEsUUFBQSxPQUFBLFlBQUEsUUFBQSxlQUFBO1lBQ0EsSUFBQSxPQUFBLE9BQUEsT0FBQSxhQUFBO2dCQUNBOzs7O1FBSUEsU0FBQSxXQUFBOzs7O1FBSUEsU0FBQSxhQUFBLEtBQUEsSUFBQTs7O1lBR0EsV0FBQSxjQUFBLElBQUE7WUFDQSxhQUFBLFFBQUEsZUFBQSxXQUFBO1lBQ0EsV0FBQSxXQUFBO1lBQ0EsSUFBQSxPQUFBLE9BQUEsT0FBQSxhQUFBO2dCQUNBOzs7OztRQUtBLFNBQUEsd0JBQUE7WUFDQSxJQUFBLFdBQUEsZUFBQTtnQkFDQSxVQUFBLEtBQUEsV0FBQTttQkFDQTtnQkFDQSxVQUFBLEtBQUE7Ozs7Ozs7O0FDOUVBLFFBQUEsT0FBQTtLQUNBLFFBQUEsNkRBQUEsU0FBQSxPQUFBLFNBQUEsV0FBQSxZQUFBOztRQUVBLE9BQUE7OztZQUdBLGlCQUFBLFNBQUEsUUFBQTtnQkFDQSxPQUFBLFVBQUE7Z0JBQ0EsUUFBQSxJQUFBO2dCQUNBLE9BQUEsUUFBQSxTQUFBLFlBQUE7b0JBQ0EsSUFBQSxPQUFBLFNBQUE7O29CQUVBLE9BQUEsVUFBQTs7O29CQUdBLE1BQUEsSUFBQSxPQUFBO3lCQUNBLEtBQUEsU0FBQSxNQUFBOzRCQUNBLFFBQUEsSUFBQTs7Ozs0QkFJQSxJQUFBLGVBQUE7Z0NBQ0EsV0FBQTsyQkFDQSxTQUFBLEtBQUE7NEJBQ0EsSUFBQSxJQUFBLFVBQUEsS0FBQTtnQ0FDQSxXQUFBLFdBQUE7Ozs7Ozs7O1lBUUEsS0FBQSxTQUFBLFFBQUE7Z0JBQ0EsUUFBQSxJQUFBO2dCQUNBLEtBQUEsZ0JBQUE7Ozs7Ozs7O0FBUUEiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ2FwcCcsW1xuJ25nUm91dGUnLCd1aS5yb3V0ZXInXG5dKSIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuICAgIC5jb250cm9sbGVyKCdlcnJvckN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUpIHtcbiAgICAgICAgJHNjb3BlLmhlbGxvID0gXCJ0aGlzIGlzIGZyb20gdGhlIGNvbnRyb2xsZXIgaGVsbG9cIlxuICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUuaGVsbG8pXG5cblxuXG4gICAgfSlcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuICAgIC5jb250cm9sbGVyKCdnYW1lQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsICRsb2NhdGlvbikge1xuXG4gICAgICAgICRzY29wZS5wbGF5QWdhaW4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRodHRwLmdldCgnYXBpL2dhbWUvY2FyZHMnKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY2FyZHMgPSByZXMuZGF0YTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcblxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgJHNjb3BlLnBsYXlBZ2FpbigpO1xuXG5cblxuXG4gICAgfSlcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuICAgIC5jb250cm9sbGVyKCdob21lQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsIHByb2duaXRvcikge1xuXG5cblxuICAgICAgICAkc2NvcGUuc2V0dXAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiaW4gY2hhdFwiKTtcbiAgICAgICAgICAgICRzY29wZS5nYW1laWQgPSBNYXRoLnJvdW5kKChNYXRoLnJhbmRvbSgpICogMTAwMDAwMCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLnNldHVwKCk7XG5cblxuXG5cblxuXG4gICAgfSlcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuICAgIC5jb250cm9sbGVyKCdsb2dpbkN0cmwnLCBmdW5jdGlvbigkc2NvcGUsIGF1dGgsICRsb2NhdGlvbiwgJHRpbWVvdXQpIHtcbiAgICAgICAgJHNjb3BlLmF1dGhGYWlsID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKHVzZXJuYW1lLCBwYXNzd29yZCkge1xuICAgICAgICAgICAgYXV0aC5sb2dpbih1c2VybmFtZSwgcGFzc3dvcmQpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGF1dGguc3RvcmVUb2tlbihyZXMuZGF0YSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRoLmdldFVzZXIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRoLnBvc3RMb2dpbk9wcyhyZXMuZGF0YSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRoLnBvc3RMb2dpblJvdXRlSGFuZGxlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0dpc3RzIGVycm9yJywgcmVzcG9uc2Uuc3RhdHVzLCByZXNwb25zZS5kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PSA0MDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5hdXRoRmFpbCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkgeyAkc2NvcGUuYXV0aEZhaWwgPSBmYWxzZTsgfSwgMzAwMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5maW5hbGx5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImZpbmFsbHkgZmluaXNoZWQgZ2lzdHNcIik7XG4gICAgICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICB9XG4gICAgfSlcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuICAgIC5jb250cm9sbGVyKCdtYXN0ZXJDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkcm9vdFNjb3BlLCAkcm91dGUsICRodHRwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibWFzdGVyQ3RybFwiKTtcblxuICAgICAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2xvZ2dlZF91c2VyJykpIHsgICAgICAgIFx0XG4gICAgICAgICAgICAkcm9vdFNjb3BlLmN1cnJlbnRVc2VyID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2xvZ2dlZF91c2VyJylcbiAgICAgICAgICAgICRodHRwLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWyd4LWF1dGgnXSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyX3Rva2VuJylcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyX3Rva2VuJykpXG4gICAgICAgIH1cbiAgICAgICAgJHNjb3BlLiRvbignbG9naW4nLCBmdW5jdGlvbihfLCB1c2VyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkxvZ2dlZCBJblwiKTtcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50VXNlciA9IHVzZXJcbiAgICAgICAgICAgICRyb290U2NvcGUuY3VycmVudFVzZXIgPSB1c2VyXG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnbG9nZ2VkX3VzZXInLCAkcm9vdFNjb3BlLmN1cnJlbnRVc2VyLnVzZXJuYW1lKVxuICAgICAgICB9KVxuICAgIH0pXG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuY29udHJvbGxlcignbmF2Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgYXV0aCwgJGxvY2F0aW9uKSB7ICAgICAgICBcbiAgICAgICAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkgeyAgICAgICAgICAgIFxuICAgICAgICAgICAgYXV0aC5sb2dvdXQoKSAgICAgICAgICAgICAgICBcblxuICAgICAgICB9XG4gICAgfSlcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuLmNvbnRyb2xsZXIoJ3JlZ2lzdGVyQ3RybCcsZnVuY3Rpb24oJHNjb3BlLGF1dGgsJGxvY2F0aW9uKXtcblx0JHNjb3BlLm9hdXRoID0gZnVuY3Rpb24ocHJvdmlkZXIpe1xuXHRcdGNvbnNvbGUubG9nKHByb3ZpZGVyKVxuXHRcdHdpbmRvdy5vcGVuKCdodHRwOi8vbG9jYWxob3N0OjE4MDUvYXV0aC8nK3Byb3ZpZGVyKVxuXHR9XG5cblx0JHNjb3BlLnJlZ2lzdGVyID0gZnVuY3Rpb24obmFtZSx1c2VybmFtZSxwYXNzd29yZCl7XG5cdFx0YXV0aC5yZWdpc3RlcihuYW1lLHVzZXJuYW1lLHBhc3N3b3JkKVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcdFx0XHRcblx0XHRcdGF1dGgubG9naW4odXNlcm5hbWUscGFzc3dvcmQpXG5cdFx0XHQkc2NvcGUuJGVtaXQoJ2xvZ2luJyxyZXNwb25zZS5kYXRhKVxuXHRcdFx0JGxvY2F0aW9uLnBhdGgoJy9ob21lJylcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbiAoZXJyKXtcblx0XHRcdGNvbnNvbGUubG9nKGVycilcblx0XHR9KVxuXHR9XG5cbn0pXG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyKSB7XG5cbiAgICAgICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuXG4gICAgICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAgIC8vICAgICAuc3RhdGUoJ2FwcCcsIHtcbiAgICAgICAgLy8gICAgICAgICB1cmw6ICcvJyxcbiAgICAgICAgLy8gICAgICAgICB2aWV3czoge1xuICAgICAgICAvLyAgICAgICAgICAgICAnaGVhZGVyJzoge1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbmF2Lmh0bWwnLFxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ25hdkN0cmwnXG4gICAgICAgIC8vICAgICAgICAgICAgIH0sXG4gICAgICAgIC8vICAgICAgICAgICAgICdjb250ZW50Jzoge1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbG9naW4uaHRtbCcsXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnbG9naW5DdHJsJ1xuICAgICAgICAvLyAgICAgICAgICAgICB9XG4gICAgICAgIC8vICAgICAgICAgfVxuICAgICAgICAvLyAgICAgfSlcblxuICAgICAgICAvLyAuc3RhdGUoJ2FwcC5sb2dpbicsIHtcbiAgICAgICAgLy8gICAgIHVybDogJ2xvZ2luJyxcbiAgICAgICAgLy8gICAgIHZpZXdzOiB7XG4gICAgICAgIC8vICAgICAgICAgJ2hlYWRlcic6IHtcbiAgICAgICAgLy8gICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbmF2Lmh0bWwnLFxuICAgICAgICAvLyAgICAgICAgICAgICBjb250cm9sbGVyOiAnbmF2Q3RybCdcbiAgICAgICAgLy8gICAgICAgICB9LFxuICAgICAgICAvLyAgICAgICAgICdjb250ZW50Jzoge1xuICAgICAgICAvLyAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9sb2dpbi5odG1sJyxcbiAgICAgICAgLy8gICAgICAgICAgICAgY29udHJvbGxlcjogJ2xvZ2luQ3RybCdcblxuICAgICAgICAvLyAgICAgICAgIH1cbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gfSlcblxuICAgICAgICAvLyAuc3RhdGUoJ2FwcC5yZWdpc3RlcicsIHtcbiAgICAgICAgLy8gICAgIHVybDogJ3JlZ2lzdGVyJyxcbiAgICAgICAgLy8gICAgIHZpZXdzOiB7XG4gICAgICAgIC8vICAgICAgICAgJ2NvbnRlbnRAJzoge1xuICAgICAgICAvLyAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3JlZ2lzdGVyLmh0bWwnLFxuICAgICAgICAvLyAgICAgICAgICAgICBjb250cm9sbGVyOiAncmVnaXN0ZXJDdHJsJ1xuICAgICAgICAvLyAgICAgICAgIH1cbiAgICAgICAgLy8gICAgIH1cblxuICAgICAgICAvLyB9KVxuXG4gICAgICAgIC8vIC5zdGF0ZSgnYXBwLnZhbGlkYXRlJywge1xuICAgICAgICAvLyAgICAgdXJsOiAnc2lnbnVwL3ZhbGlkYXRlLzppZCcsXG5cbiAgICAgICAgLy8gICAgIHZpZXdzOiB7XG4gICAgICAgIC8vICAgICAgICAgJ2NvbnRlbnRAJzoge1xuICAgICAgICAvLyAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3VzZXJzL3ZhbGlkYXRlLmh0bWwnLFxuICAgICAgICAvLyAgICAgICAgICAgICBjb250cm9sbGVyOiAndmFsaWRhdGVDdHJsJ1xuICAgICAgICAvLyAgICAgICAgIH1cbiAgICAgICAgLy8gICAgIH1cblxuICAgICAgICAvLyB9KVxuICAgICAgICAgICAgLnN0YXRlKCdob21lJywge1xuICAgICAgICAgICAgdXJsOiAnLycsXG4gICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgIC8vICdoZWFkZXInOiB7XG4gICAgICAgICAgICAgICAgLy8gICAgIHRlbXBsYXRlVXJsOiAnL25hdi5odG1sJyxcbiAgICAgICAgICAgICAgICAvLyAgICAgY29udHJvbGxlcjogJ25hdkN0cmwnXG4gICAgICAgICAgICAgICAgLy8gfSxcbiAgICAgICAgICAgICAgICAnY29udGVudCc6IHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd1c2Vycy9ob21lLmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnaG9tZUN0cmwnXG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgLnN0YXRlKCdob21lLmdhbWUnLCB7XG4gICAgICAgICAgICB1cmw6ICdnYW1lLzppZCcsXG4gICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICdjb250ZW50QCc6IHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd1c2Vycy9nYW1lLmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnZ2FtZUN0cmwnXG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSlcblxuXG5cbiAgICAgICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpXG5cbiAgICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuICAgIC5jb250cm9sbGVyKCd2YWxpZGF0ZUN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRodHRwLCAkc3RhdGVQYXJhbXMpIHtcblxuXG4gICAgICAgICRzY29wZS5sb2FkaW5nID0gdHJ1ZVxuXG4gICAgICAgICRodHRwLmdldCgnYXBpL3VzZXJzL3ZhbGlkYXRlLycgKyAkc3RhdGVQYXJhbXMuaWQpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMpXG4gICAgICAgICAgICAgICAgaWYgKHJlcy5zdGF0dXMgPT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS52ZXJpZmllZCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmxvYWRpbmcgPSBmYWxzZVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS52ZXJpZmllZCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5sb2FkaW5nID0gZmFsc2VcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0pXG5cblxuXG5cbiAgICB9KVxuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgLnNlcnZpY2UoJ2F1dGgnLCBmdW5jdGlvbigkaHR0cCwgJHdpbmRvdywgJGxvY2F0aW9uLCAkcm9vdFNjb3BlKSB7XG5cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZ2V0VXNlcjogZ2V0VXNlcixcbiAgICAgICAgICAgIGxvZ2luOiBsb2dpbixcbiAgICAgICAgICAgIHJlZ2lzdGVyOiByZWdpc3RlcixcbiAgICAgICAgICAgIGxvZ291dDogbG9nb3V0LFxuICAgICAgICAgICAgc3RvcmVUb2tlbjogc3RvcmVUb2tlbixcbiAgICAgICAgICAgIGlzTG9nZ2VkOiBpc0xvZ2dlZCxcbiAgICAgICAgICAgIHBvc3RMb2dpbk9wczogcG9zdExvZ2luT3BzLFxuICAgICAgICAgICAgcG9zdExvZ2luUm91dGVIYW5kbGVyOiBwb3N0TG9naW5Sb3V0ZUhhbmRsZXJcblxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0VXNlcigpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJ2FwaS91c2VycycpXG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBsb2dpbih1c2VybmFtZSwgcGFzc3dvcmQpIHtcblxuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJ2FwaS9zZXNzaW9ucycsIHtcbiAgICAgICAgICAgICAgICB1c2VybmFtZTogdXNlcm5hbWUsXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVnaXN0ZXIobmFtZSwgdXNlcm5hbWUsIHBhc3N3b3JkKSB7XG5cbiAgICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnYXBpL3VzZXJzJywge1xuICAgICAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICAgICAgdXNlcm5hbWU6IHVzZXJuYW1lLFxuICAgICAgICAgICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZFxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuXG5cbiAgICAgICAgZnVuY3Rpb24gbG9nb3V0KCkge1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3VzZXJfdG9rZW4nKTtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdsb2dnZWRfdXNlcicpO1xuICAgICAgICAgICAgZGVsZXRlICRodHRwLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWyd4LWF1dGgnXVxuICAgICAgICAgICAgJHJvb3RTY29wZS5pc0xvZ2dlZCA9IGZhbHNlO1xuICAgICAgICAgICAgJHJvb3RTY29wZS5jdXJyZW50VXNlciA9IG51bGw7XG4gICAgICAgICAgICAkbG9jYXRpb24ucGF0aChcIi9sb2dpblwiKVxuXG5cblxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gc3RvcmVUb2tlbihyZXMsIGNiKSB7XG4gICAgICAgICAgICAkd2luZG93LnNlc3Npb25TdG9yYWdlW1widXNlcl90b2tlblwiXSA9IHJlc1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3VzZXJfdG9rZW4nLCByZXMpO1xuICAgICAgICAgICAgJGh0dHAuZGVmYXVsdHMuaGVhZGVycy5jb21tb25bJ3gtYXV0aCddID0gJHdpbmRvdy5zZXNzaW9uU3RvcmFnZS51c2VyX3Rva2VuXG4gICAgICAgICAgICBpZiAoY2IgJiYgKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykpIHtcbiAgICAgICAgICAgICAgICBjYigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gaXNMb2dnZWQoKSB7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHBvc3RMb2dpbk9wcyhyZXMsIGNiKSB7XG5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJHJvb3RTY29wZS5jdXJyZW50VXNlciA9IHJlcy5uYW1lXG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnbG9nZ2VkX3VzZXInLCAkcm9vdFNjb3BlLmN1cnJlbnRVc2VyKVxuICAgICAgICAgICAgJHJvb3RTY29wZS5pc0xvZ2dlZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAoY2IgJiYgKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykpIHtcbiAgICAgICAgICAgICAgICBjYigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBwb3N0TG9naW5Sb3V0ZUhhbmRsZXIoKSB7XG4gICAgICAgICAgICBpZiAoJHJvb3RTY29wZS5pbnRlbmRlZFJvdXRlKSB7XG4gICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJHJvb3RTY29wZS5pbnRlbmRlZFJvdXRlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9ob21lJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG5cbiAgICB9KVxuIiwiXG5hbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuc2VydmljZSgncHJvZ25pdG9yJywgZnVuY3Rpb24oJGh0dHAsICR3aW5kb3csICRsb2NhdGlvbiwgJHJvb3RTY29wZSkge1xuXG4gICAgICAgIHJldHVybiB7XG5cblxuICAgICAgICAgICAgc2V0U2V0dXBQcm9jZXNzOiBmdW5jdGlvbigkc2NvcGUpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUubG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCRzY29wZSlcbiAgICAgICAgICAgICAgICAkc2NvcGUuc2V0dXAgPSBmdW5jdGlvbihjYWxsYmFja0ZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgkc2NvcGUubG9hZGluZykgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5sb2FkaW5nID0gdHJ1ZTtcblxuXG4gICAgICAgICAgICAgICAgICAgICRodHRwLmdldCgkc2NvcGUuYXBpVXJpKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAvKiAkc2NvcGUuc3RhdGUubGFzdFBhZ2UgPSBkYXRhLmxhc3RfcGFnZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuaXNMYXN0UGFnZSA9ICgkc2NvcGUuc3RhdGUucGFnZU51bSA9PSAkc2NvcGUuc3RhdGUubGFzdFBhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5sb2FkaW5nID0gZmFsc2U7Ki9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2tGbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0ZuKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlcy5zdGF0dXMgPT0gNDA0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgncmVuZGVyNDA0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSxcblxuXG4gICAgICAgICAgICBydW46IGZ1bmN0aW9uKCRzY29wZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiaW4gcHJvZ25pdG9yIHNlcnZpY2VcIilcbiAgICAgICAgICAgICAgICB0aGlzLnNldFNldHVwUHJvY2Vzcygkc2NvcGUpO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG5cbiAgICB9KVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
