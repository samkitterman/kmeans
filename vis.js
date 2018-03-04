d3.select("#runFunction").on("click", function(){
    
   document.getElementById("question").style.visibility = "hidden"; document.getElementById("centCounter").style.visibility = "hidden";
    document.getElementById("runFunction").style.visibility = "hidden";
    document.getElementById("findclosest").style.visibility = "visible";
    document.getElementById("moveMeans").style.visibility = "visible";
if (document.getElementById('option1').checked) {
  var centroidNumber = 2;
    };
if (document.getElementById('option2').checked) {
  var centroidNumber = 3;
    };
if (document.getElementById('option3').checked) {
  var centroidNumber = 4;
    };
var margin = {
    top :20,
    right: 20,
    bottom: 50,
    left: 60
},
    width = 600 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
var canvas = d3.select("body").append("svg").attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
//Part 2: reading in the data
d3.csv('irisData.csv', function (data) {
    var sl = data.map(function (i) {
        return i.sepalLength;
    });
    var sw = data.map(function (i) {
        return i.sepalWidth;
    });
    //create scales in each direction
    var x = d3.scaleLinear()
        .range([0,width])
        .domain(d3.extent(sl)); //returns the main sepal length values
    var y = d3.scaleLinear()
        .range([height,0]) //inverted because of how pixels are counted on screen: y starts at top of screen
        .domain([d3.min(sw), d3.max(sw)]);
    var color = d3.scaleOrdinal(d3.schemeCategory20c); //create at same time of other scales
    var circle = canvas.selectAll('.dot')
        .data(data)
        .enter()
    .append('circle')
    .attr('class','dot')
    .attr('r',3)
    .attr('cx', function (d) {
        return x(d.sepalLength);
    })
    .attr('cy', function (d) {
        return y(d.sepalWidth);
    })
    .attr('fill', function (d) {
        return color(d.species);
    });
    
    //part 3: create axes for the dots
    var xAxis = d3.axisBottom(x);
    canvas.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);
    canvas.append('g')
        .call(d3.axisLeft(sw).scale(y));
    canvas.append('text')
        .attr('class','xAxisLabel')
        .attr('transform', `translate(${width},${height + 35})`)
        .text('Sepal Length');
    canvas.append('text')
        .attr('class','yAxisLabel')
        .attr('transform', 'rotate(-90)')
        .attr('y', -35) //we're changing y attr instead of x because we rotated it
        .text('Sepal Width');
    var legend = canvas.selectAll('legend')
        .data(color.domain()).enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function (d, i) {
            return 'translate(0,' + i * 20 + ')';
        });
    legend.append('rect')
        .attr('x', width)
        .attr('width', 14)
        .attr('height', 14)
        .attr('fill', color)
    legend.append('text')
        .attr('x', width - 6)
        .attr('y', 9)
        .attr('text-anchor', 'end')
        .text(function (d) {
            return d;
        });
    
    var lines, circles, centroids;
    var points = [];
    
    for (var i = 0; i < sl.length; i++) {
        points.push({
            cluster: -1,
            x: sl[i],
            y: sw[i]
        });
    };  
     lines = canvas.selectAll("line").data(points)
        .enter().append("line")
        .attr("x1", function (d) {
            return x(d.x);
        })
        .attr("y1", function (d) {
            return y(d.y);
        })
        .attr("x2", function (d) {
            return x(d.x);
        })
        .attr("y2", function (d) {
            return y(d.y);
        })
        .attr("stroke", "grey")
        .attr('stroke-width', '1px')
        .attr('opacity', 0.7);
    
    centroids = new Array(centroidNumber);
    
    for (var i = 0; i < centroids.length; i++) {
        var centroid_seed = Math.round(Math.random() * points.length);
        console.log(points[centroid_seed]);
        centroids[i] = {
            x: points[centroid_seed].x,
            y: points[centroid_seed].y
        }
    }

    var centroidCircles = canvas.selectAll('.centroid').data(centroids)
        .enter().append('circle')
        .attr('class', 'centroid')
        .attr('r', 5)
        .attr('fill', 'black')
        .attr('cx', function (d) {
            return x(d.x);
        })
        .attr('cy', function (d) {
            return y(d.y);
        });
    
    function nearest(point, candidates) {
        var nearest;
        var shortestDistance = Number.MAX_VALUE;
        for (var i = 0; i < candidates.length; i++) {
            var c = candidates[i];
            var distance = Math.sqrt(
                (c.x - point.x) * (c.x - point.x) +
                (c.y - point.y) * (c.y - point.y)
            );

            if (distance < shortestDistance) {
                shortestDistance = distance;
                nearest = i;
            }
        }
        return nearest;
    }
    
     function moveMeans() {
        centroids.forEach(function (centroid, i) {
            var assignedPoints = points.filter(function (point) {
                return point.cluster == i;
            });
            centroid.x = d3.mean(assignedPoints, function (d) {
                return d.x;
            });
            centroid.y = d3.mean(assignedPoints, function (d) {
                return d.y;
            });

        });
         centroidCircles.transition().duration(1000)
            .attr("cx", function (d) {
                return x(d.x);
            })
            .attr("cy", function (d) {
                return y(d.y);
            });

        lines.transition().duration(1000).attr("x2", function (point) {
                return x(centroids[point.cluster].x);
            })
            .attr("y2", function (point) {
                return y(centroids[point.cluster].y);
            });
    }
    
    function findClosest() {
        var ct = 0;
        points.forEach(function (point) {
            var newCluster = nearest(point, centroids);
            point.cluster = newCluster;
        });
        lines.transition().duration(1000)
            .attr("x2", function (point) {
                return x(centroids[point.cluster].x);
            })
            .attr("y2", function (point) {
                return y(centroids[point.cluster].y);
            });
    }
    d3.select("#findclosest").on("click", findClosest);
    d3.select("#moveMeans").on("click", moveMeans);
}); 
    }); 