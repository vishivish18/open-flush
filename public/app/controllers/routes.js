angular.module('app')
    .config(function($stateProvider, $urlRouterProvider, $locationProvider) {

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

    });
