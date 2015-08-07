(function () {
  'use strict';

  // create the angular app
  angular.module('myApp', [
    'myApp.controllers',
    'myApp.directives'
    ]);

  // setup dependency injection
  angular.module('d3', []);
  angular.module('myApp.controllers', []);
  angular.module('myApp.directives', ['d3']);


}());

// http://briantford.com/blog/angular-d3
// https://github.com/btford/briantford.com/blob/master/jade/blog/angular-d3.md
// http://www.ng-newsletter.com/posts/d3-on-angular.html
// https://github.com/EpiphanyMachine/d3AngularIntegration
// http://odiseo.net/angularjs/proper-use-of-d3-js-with-angular-directives