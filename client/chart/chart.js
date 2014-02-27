
Template.chart.rendered = function() {
  // Session.set('noteStatistics', [ 
  //   5, 10, 13, 19, 21, 25, 22, 18, 15, 13, 11, 12
  // ]);

  var stat = this.data.song.noteStatistics;
  console.log(stat)
  if (stat) {
    drawChart([20, 30, 50]);  
  }
}

function drawChart(dataset) {
  //Width and height
  var w = 300;
  var h = 100;
  var blackKeys = [1, 3, 6, 8, 10];

  //Create SVG element
  var svg = d3.select("#chart")
              .append("svg")
              .attr("width", w)
              .attr("height", h);

  svg.selectAll("rect")
     .data(dataset)
     .enter()
     .append("rect")
     .attr("x", function(d, i) {
      return i * (w / dataset.length);
     }).attr("y", function(d) {
      return  h - (d * 4);
     }).attr("width", (w / dataset.length))
     .attr("height", 100)
     .attr("fill", function(d, i) {
       if (blackKeys.indexOf(i) > -1) {
        return 'black';
       } else {
        return 'white';
       }
     })

  svg.selectAll('text')
    .data(dataset)
    .enter()
    .append("text")
    .attr("x", function(d, i) {
          return i * (w / dataset.length) + 5;
     })
    .attr("y", function(d) {
          return  h - (d * 4) + 15;
    })
    .text(function(d) {
      return d;
    }).attr("font-family", "sans-serif")
    .attr("font-size", "11px")
    .attr("fill", function(d, i) {
      if (blackKeys.indexOf(i) > -1) {
       return 'white';
      } else {
       return 'black';
      }
    });

}

