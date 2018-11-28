/////////////////////////////////////
///reusable code starts here
////////////////////////////////////

var Line_Graph = function(opt) {
  this.data = opt.data;
  this.element = opt.element;
  this.speed = 1000;
  this.seriesCount = 2;
  this.colorPalette = [{
      "color": "#1f77b4"
    },
    {
      "color": "#ff7f0e"
    },
    {
      "color": "#2ca02c"
    },
    {
      "color": "#d62728"
    },
    {
      "color": "#9467bd"
    },
    {
      "color": "#8c564b"
    },
    {
      "color": "#e377c2"
    },
    {
      "color": "#7f7f7f"
    },
    {
      "color": "#17becf"
    },
    {
      "color": "#bcbd22"
    },


  ]
  this.draw();
}


Line_Graph.prototype.draw = function() {
  this.padding = 50;
  this.width = 1000;
  this.height = 500;

  var svg = d3.select(this.element).append('svg')
    .attr('width', this.width)
    .attr('height', this.height)
    .attr('padding', this.padding)

  this.plot = svg.append('g')
    .attr('class', 'line_graph_holder')
    .attr('transform', "translate(" + this.padding + "," + this.padding + ")");

  this.reshapeData();
  this.generateXScale();
  this.generateYScale();
  this.generateColorScale();
  this.addAxis();
  this.generateButtons();
  this.generateLines();

};

Line_Graph.prototype.reshapeData = function() {

  var reshapedData = d3.nest()
    .key(function(d) {
      return d.series
    })
    .entries(this.data);

  this.data = reshapedData;

}



Line_Graph.prototype.generateXScale = function() {
  this.xScale = d3.scaleLinear()
    .domain(d3.extent(this.data.map(function(d) {
      return d.values.map(function(d) {
        return d.x
      })
    }).flat()))
    .range([0, this.width - 2 * this.padding])

  this.xAxis = d3.axisBottom().scale(this.xScale);
};

Line_Graph.prototype.generateYScale = function() {
  this.yScale = d3.scaleLinear()
    .domain([0, d3.max(this.data.map(function(d) {
      return d.values.map(function(d) {
        return d.y
      })
    }).flat()) * 1.2])
    .range([this.height - 2 * this.padding, 0])

  this.yAxis = d3.axisLeft().scale(this.yScale);
};

Line_Graph.prototype.generateColorScale = function() {

  this.colorScale = d3.scaleOrdinal()
    .domain(this.data.map(function(d) {
      return d.key
    }))
    .range(this.colorPalette.map(function(d) {
      return d.color;
    }));

}


Line_Graph.prototype.addAxis = function() {
  this.plot.append("g")
    .attr("id", "x-axisGroup")
    .attr("class", "x-axis")
    .attr("transform", "translate(" + "0" + "," + (this.height - 2 * this.padding) + ")");

  this.plot.select(".x-axis")
    .transition()
    .duration(1000)
    .call(this.xAxis)

  this.plot.append("g")
    .attr("id", "y-axisGroup")
    .attr("class", "y-axis")
    .attr("transform", "translate(0,0)");

  this.plot.select(".y-axis")
    .transition()
    .duration(1000)
    .call(this.yAxis)

}

Line_Graph.prototype.updateAxis = function() {
  this.plot.select(".x-axis")
    .transition()
    .duration(1000)
    .call(this.xAxis)

  this.plot.select(".y-axis")
    .transition()
    .duration(1000)
    .call(this.yAxis)

}


Line_Graph.prototype.generateLines = function() {

  var boundShowToolTip = showToolTip.bind(this);
  var boundHideToolTip = hideToolTip.bind(this);
  var eachLine = d3.local();

  var that = this;


  line = this.plot.selectAll("g[id^=series]")
    .data(this.data);

  lineFunction = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) {
      return that.xScale(d.x);
    })
    .y(function(d) {
      return that.yScale(d.y);
    });

  //remove any elements that don't have data
  line.exit().remove();

  //update elements that do have Data

  d3.selectAll("g[id^=series]")
    .each(function(d) {
      eachLine.set(this, lineFunction);
    });


  //create new elements for data that is new
  lineGroups = line.enter()
    .append("g")
    .attr("id", function(d) {
      return 'series' + d.key
    })
    .each(function(d) {
      eachLine.set(this, lineFunction)
    });

  lineGroups
    .append("path")
    .attr("id", function(d) {
      return 'series' + d.key + 'path'
    })
    .attr("d", function(d) {
      return eachLine.get(this)(d.values);
    })
    .attr("fill", "none")
    .attr("stroke", function(d) {
      return that.colorScale(d.key);
    })
    .attr("stroke-width", "2px");


  //another invisible path for wider stroke path for easier tooltip selection
  lineGroups
    .append("path")
    .attr("d", function(d) {
      return eachLine.get(this)(d.values);
    })
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-opacity", 0)
    .attr("stroke-width", "5px")
    .on("mouseover", function(d) {
      var mousePos = d3.mouse(this);
      boundShowToolTip(d, mousePos[0], mousePos[1]);
    })
    .on("mouseout", function(d) {
      var mousePos = d3.mouse(this);
      boundHideToolTip(d)
    });

  //transition the lines so that they are animated and draw onto the svg
  d3.selectAll("path[id$=path]").each(function(d) {
    var pathLength = d3.select(this).node().getTotalLength();

    d3.select(this)
      .attr("stroke-dasharray", pathLength + " " + pathLength)
      .attr("stroke-dashoffset", pathLength)
      .transition()
      .duration(4000)
      .ease(d3.easeCubic)
      .attr("stroke-dashoffset", 0)

    return
  });

};

Line_Graph.prototype.updateLines = function() {
  this.generateXScale();
  this.generateYScale();
  this.generateColorScale();
  this.updateAxis();
  this.generateLines();

};




Line_Graph.prototype.generateButtons = function() {
  var that = this;
  d3.select(".button-container").append("button")
    .text("Add Line")
    .on("click", function() {
      that.addData()
    });
  d3.select(".button-container").append("button")
    .text("Remove Line")
    .on("click", function() {
      that.removeData()
    });



};


Line_Graph.prototype.addData = function() {

  var newArray = [];

  for (i = 1; i <= 19; i++) {
    var newElement = {
      "series": "A" + this.seriesCount + 1,
      "x": i,
      "y": Math.floor(Math.random() * 1000)
    }
    newArray.push(newElement);

  }

  this.seriesCount = this.seriesCount + 1;


  this.data.push(d3.nest()
    .key(function(d) {
      return d.series
    })
    .entries(newArray)[0]
  );

  this.updateLines();
}

Line_Graph.prototype.removeData = function() {
  console.log(this.data.pop())
  this.updateLines();

};
