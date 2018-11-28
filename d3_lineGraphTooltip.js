function showToolTip(d,x_val=0,y_val=0,y_offset=30,x_offset=10)
  {
  if (this.tooltipNode != undefined) {
    this.tooltipNode.remove()
  };


  this.tooltipNode = this.plot.append("g");

  //check length of text
  this.tooltipNode.append("text")
    .attr("id","tooltiptext")
    .attr("opacity",1)
    .text(Math.floor(this.xScale.invert(x_val)) + " | " + Math.floor(this.yScale.invert(y_val)));

  var text_width = d3.select("#tooltiptext").node().getComputedTextLength()+15;

  this.tooltipNode
    .attr("transform", "translate(" +(x_val + x_offset - Math.max(x_val+x_offset+text_width-this.width+this.padding,0))
    + "," + (y_val-y_offset + Math.max(-4*(y_val-y_offset),0)) + ")")
    .style("opacity", 0);

  this.tooltipNode.append("rect")
    .attr("id","rext")
    .attr("width",text_width)
    .attr("height", "2.6em")
    .attr("y", "-1.25em")
    .attr("fill", "lightgray")
    .attr("rx", 4)
    .style("pointer-events", "auto");

  this.tooltipNode.append("text")
      .attr("x", "0.5em")
      .style("opacity",0.9)
      .style("background", "lightgray")
      .text(d.key)
      .append("tspan")
      .attr("dy","1em")
      .attr("x","0.5em")
      .text(Math.floor(this.xScale.invert(x_val)) + " | " + Math.floor(this.yScale.invert(y_val)));

  this.tooltipNode
    .transition().duration(200)
    .style("opacity", 1)

    this.tooltipNode.append("circle")
      .attr("cx",-x_offset + Math.max(x_val+x_offset+text_width-this.width+this.padding,0))
      .attr("cy",+y_offset- Math.max(-4*(y_val-y_offset),0))
      .attr("r",6)
      .style("fill","lightgray")
      .style("pointer-events","none");


};

function hideToolTip(d){
  var that = this;
  that.tooltipNode.remove();
};
