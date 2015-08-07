(function () {
    'use strict';

    angular.module('myApp.controllers')
        .controller('ResultsCtrl', ['$scope', '$http', function ($scope, $http) {
            $scope.title = "ResultsCtrl";
            $scope.d3Data = [
                {name: "Person1", score: 98},
                {name: "Person2", score: 96},
                {name: "Person3", score: 48}
            ];
            $scope.d3OnClick = function (item) {
                alert(JSON.stringify(item));
            };

            $scope.matrixValues=null;

            $scope.labels = null;



            $http.get('data.json').then(function(resultPromise){

                var data = resultPromise.data;
                var labels = data.labels;
                var values = data.values;

                $scope.matrixValues = convert_to_json_array(values,labels);
                $scope.labels = labels;

            });

            function convert_to_json_array(data_value,mapping){
                var results =[];

                for (var row=0; row<data_value.length; row++ ){
                    for (var col=0; col<data_value.length; col++ ){
                        var result={};
                        result['actual_label'] = mapping[row];
                        result['predicted_label'] = mapping[col];
                        result['actual']= row;
                        result['predicted']= col;
                        result['value'] = data_value[row][col];
                        results.push(result)
                    }
                }

                return results;

            }

            $scope.models= [
                 {'name':' Linear Regression','cm_file': 'data.json','proba_file':''}
                ,{'name':' Logistic Regression','cm_file': 'data.json','proba_file':''}


            ]


        }]);

}());
