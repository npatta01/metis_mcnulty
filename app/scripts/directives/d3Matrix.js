(function () {
    'use strict';

    angular.module('myApp.directives')
        .directive('d3Matrix', ['d3', function (d3) {
            return {
                restrict: 'EA',
                scope: {
                    data: "=",
                    labels: "=",
                    onClick: "&"
                },
                link: function (scope, iElement, iAttrs) {

                    var actuals = scope.labels;
                    var predicted = actuals;
                    var data = scope.data;

                    var buckets = 9;
                    var colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"]; // alternatively colorbrewer.YlGnBu[9]

                    var colorScale = d3.scale.quantile()
                        .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
                        .range(colors);

                    var margin = {top: 100, right: 50, bottom: 50, left: 50};
                    var width = 800;
                    var height = 400;

                    var svg = d3.select(iElement[0])
                        .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    //.attr("width", "100%");

                    // on window resize, re-render d3 canvas
                    window.onresize = function () {
                        return scope.$apply();
                    };
                    scope.$watch(function () {
                            return angular.element(window)[0].innerWidth;
                        }, function () {
                            return scope.render(scope.data);
                        }
                    );

                    // watch for data changes and re-render
                    scope.$watch('data', function (newVals, oldVals) {
                        return scope.render(newVals);
                    }, true);

                    // define render function
                    scope.render = function (data) {
                        // remove all previous items before render
                        svg.selectAll("*").remove();

                        // setup variables
                        var width, height, max;
                        width = d3.select(iElement[0])[0][0].offsetWidth - 20;
                        // 20 is for margins and can be changed
                        height = scope.data.length * 35;
                        // 35 = 30(bar height) + 5(margin between bars)
                        max = 98;
                        // this can also be found dynamically when the data is not static
                        // max = Math.max.apply(Math, _.map(data, ((val)-> val.count)))


                        var gridSize = Math.floor(width / 24),
                            legendElementWidth = gridSize * 2;




                        // set the height based on the calculations above
                        svg.attr('height', height);


                        var actualLabels = svg.append("g")
                            .attr("class", "rowLabels")
                            .selectAll(".dayLabel")
                            .data(actuals)
                            .enter().append("text")
                            .text(function (d) {
                                return d;
                            })
                            .attr("x", 0)
                            .attr("y", function (d, i) {
                                return i * gridSize;
                            })
                            .style("text-anchor", "end")
                            .attr("transform", "translate(28," + gridSize / 0.65 + ")")
                            .attr("class", function (d, i) {
                                return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis");
                            });

                        var predictedLabels = svg.append("g")
                            .attr("class", "colLabels")
                            .selectAll(".colLabel")
                            .data(predicted)
                            .enter().append("text")

                            .text(function (d) {
                                return d;
                            })
                            .attr("x", 0)
                            .attr("y", function (d, i) {
                                return i * gridSize;
                            })
                            .style("text-anchor", "left")

                            .attr("transform", function (d, i) {
                                return "translate(" + gridSize + ", 0) rotate(-90) rotate(0, 0, " + (i * gridSize + 2) + ")";
                            })
                            .attr("class", "colLabel mono")
                            .attr("id", function (d, i) {
                                return "colLabel_" + i;
                            });


                        var heatMap = svg.selectAll(".hour")
                            .data(data)
                            .enter().append("rect")
                            .attr("x", function (d) {
                                return (d.predicted + 1) * gridSize;
                            })
                            .attr("y", function (d) {
                                return (d.actual + 1) * gridSize;
                            })
                            .attr("rx", 4)
                            .attr("ry", 4)
                            .attr("class", "hour bordered")
                            .attr("width", gridSize)
                            .attr("height", gridSize)
                            .on("click", function (d, i) {
                                return scope.onClick({item: d});
                            })

                            .style("fill", colors[0]);

                        heatMap.transition().duration(1000)
                            .style("fill", function (d) {
                                return colorScale(d.value);
                            });

                        heatMap.append("title").text(function (d) {
                            return d.value;
                        });

                        var legend = svg.selectAll(".legend")
                            .data([0].concat(colorScale.quantiles()), function (d) {
                                return d;
                            })
                            .enter().append("g")
                            .attr("class", "legend");

                        legend.append("rect")
                            .attr("x", function (d, i) {
                                return legendElementWidth * i;
                            })
                            .attr("y", height)
                            .attr("width", legendElementWidth)
                            .attr("height", gridSize / 2)
                            .style("fill", function (d, i) {
                                return colors[i];
                            });

                        legend.append("text")
                            .attr("class", "mono")
                            .text(function (d) {
                                return "? " + Math.round(d);
                            })
                            .attr("x", function (d, i) {
                                return legendElementWidth * i;
                            })
                            .attr("y", height + gridSize);


                    };
                }
            };
        }]);

}());
