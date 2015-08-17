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

            $scope.matrixValues = null;

            $scope.labels = null;
            $scope.activeModel = null;


            $http.get('data/models.json').then(function (resultPromise) {
                $scope.models = resultPromise.data['models'];

            });


            $scope.modelChanged = function () {
                var activeModelCmData = $scope.activeModel.cm_file;

                $scope.matrixValues = null;

                $http.get(activeModelCmData).then(function (resultPromise) {

                    var data = resultPromise.data;
                    var labels = data.labels;
                    var values = data.values;

                    $scope.matrixValues = convert_to_json_array(values, labels);
                    $scope.labels = labels;

                });

            };


            function convert_to_json_array(data_value, mapping) {
                var results = [];

                for (var row = 0; row < data_value.length; row++) {
                    for (var col = 0; col < data_value.length; col++) {
                        var result = {};
                        result['actual_label'] = mapping[row];
                        result['predicted_label'] = mapping[col];
                        result['actual'] = row;
                        result['predicted'] = col;
                        result['value'] = data_value[row][col];
                        results.push(result)
                    }
                }

                return results;

            }



            function getImages(actualLabel,predictedLabel){
                //get all images belonging to class
            }

            $scope.images = [{"url":"../data/train/1.png" },{"url":"../data/train/2.png"},{"url":"../data/train/1.png" },{"url":"../data/train/2.png"},{"url":"../data/train/1.png" },{"url":"../data/train/2.png"},{"url":"../data/train/1.png" },{"url":"../data/train/2.png"} ];
            $scope.probabilities = [{"class":"cat", "proba":0.8}, {"class":"dog", "proba":0.7}];

        }]);

}());
