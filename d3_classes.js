
/*

Created April 2020, by Declan Oller
www.declanoller.com

*/

class Plot {

  constructor(div_id, data, plot_key, xlabel, ylabel, init_state) {


    this.plot_w = 500;
    this.plot_h = 300;

    this.margin = {top: this.plot_h/6, right: this.plot_w/12, bottom: this.plot_h/3, left: this.plot_w/5};

    this.svg_w = this.plot_w + this.margin.left + this.margin.right;
    this.svg_h = this.plot_h + this.margin.top + this.margin.bottom;

    this.day_values = [30, 60, 90];
    this.keys = ["2pt5", "3pt5", "7"];

    this.div_id = div_id;
    this.svg_id = div_id.replace("#", "") + "_svg";
    this.data = data;
    this.plot_key = plot_key;
    this.cur_state = init_state;
    this.xlabel = xlabel;
    this.ylabel = ylabel;

    this.svg_plot = d3.select(div_id)
      .classed("svg-container", true)
      .append("svg")
        .attr("id", this.svg_id)
        .attr("viewBox", (-this.margin.left) + " " + (-this.margin.top) + " " + this.svg_w + " " + this.svg_h)
        .classed("svg-content-responsive", true)
      .append("g");

    // Initialise a X axis:
    this.x = d3.scaleLinear().range([0,this.plot_w]);
    this.xAxis = d3.axisBottom().scale(this.x).tickValues(this.day_values);
    this.svg_plot.append("g")
      .attr("transform", "translate(0," + (this.plot_h) + ")")
      .attr("class","myXaxis");

    // Initialize an Y axis
    this.y = d3.scaleLinear().range([this.plot_h, 0.0*this.plot_h]);
    this.yAxis = d3.axisLeft().scale(this.y);
    this.svg_plot.append("g")
      .attr("class","myYaxis");

    // text label for the x axis
    this.svg_plot.append("text")
    .attr("transform",
          "translate(" + (this.plot_w/2) + " ," +
                         (this.plot_h + 0.6*this.margin.bottom) + ")")
    .style("text-anchor", "middle")
    .attr("class","plot_xlabel")
    .text(this.xlabel);

    // text label for the y axis
    this.svg_plot.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -0.7*this.margin.left)
        .attr("dy", "1em")
        .attr("x", 0 - (this.plot_h/2))
        .style("text-anchor", "middle")
        .attr("class","plot_ylabel")
        .html(this.ylabel);


    var plot_data = this.data[this.cur_state][this.plot_key];
    //console.log(plot_data);

    var myColor = d3.scaleOrdinal()
      .domain(plot_data.map(d => d.name))
      .range(["#ffb31a", "#ff6600", "#ff0000"]);

    this.x.domain([30, 90]).nice();
    this.svg_plot.selectAll(".myXaxis").transition()
     .duration(1000)
     .call(this.xAxis).selectAll("text")
     .style("text-anchor", "end")
       .attr("dx", "-.8em")
       .attr("dy", ".15em")
       .attr("transform", "rotate(-45)");

    // create the Y axis
    this.y.domain([0, d3.max(plot_data, d => d3.max(d['values'], d => d['value']))]).nice();
    this.svg_plot.selectAll(".myYaxis")
     .call(this.yAxis)
     .style("font-size", "0.8vw")
     .call(this.yAxis.ticks(5));

    var x = this.x;
    var y = this.y;

    // Add the lines
    this.line = d3.line()
      .x(function(d) { return x(+d.time) })
      .y(function(d) { return y(Math.max(0, +d.value)) })

    var line = this.line;

    this.plot_lines = this.svg_plot.selectAll("myLines")
      .data(plot_data)
      .enter()
      .append("path")
        .attr("d", function(d){ return line(d.values) } )
        .attr("class", function(d){ return d.name; })
        .attr("stroke", function(d){ return myColor(d.name) })
        .style("stroke-width", 4)
        .style("fill", "none");


    // Add the points
    this.plot_dots = this.svg_plot
      // First we need to enter in a group
      .selectAll("myDots")
      .data(plot_data)
      .enter()
        .append('g')
        .attr("class", function(d){ return d.name; })
        .style("fill", function(d){ return myColor(d.name) });
      // Second we need to enter in the 'values' part of this group

    this.plot_points = this.plot_dots
      .selectAll("myPoints")
      .data(function(d){ return d.values })
      .enter()
      .append("circle")
        .attr("cx", function(d) { return x(d.time) } )
        .attr("cy", function(d) { return y(Math.max(0, d.value)) } )
        .attr("r", 5)
        .attr("stroke", "white");

    var leg_offset_x = this.plot_w/7;
    var leg_offset_y = 0;//this.plot_h/10;
    var leg_sep = this.plot_w/3;

    // Add a legend (interactive)
    this.svg_plot
      .selectAll("myLegend")
      .data(plot_data)
      .enter()
        .append('g')
        .append("text")
          .attr("class", "legend_text")
          .attr('x', function(d,i){ return (leg_offset_x + i*leg_sep);})
          .attr('y', leg_offset_y)
          .text(function(d) { return (d.name).replace("_", " = ").replace("pt", "."); })
          .style("fill", function(d){ return myColor(d.name) })
        .on("click", function(d){
          // is the element currently visible ?
          var currentOpacity = d3.selectAll("." + d.name).style("opacity");
          // Change the opacity: from 0 to 1 or from 1 to 0
          d3.selectAll("." + d.name).transition().style("opacity", currentOpacity == 1 ? 0:1);

        });
  }


  updateData(newState) {

    this.cur_state = newState;
    var plot_data = this.data[this.cur_state][this.plot_key];


    this.x.domain([Math.min(...this.day_values), Math.max(...this.day_values)]).nice();
    this.svg_plot.selectAll(".myXaxis").transition()
     .duration(1000)
     .call(this.xAxis).selectAll("text")
     .style("text-anchor", "end")
       .attr("dx", "-.8em")
       .attr("dy", ".15em")
       .attr("transform", "rotate(-45)");

    // create the Y axis
    this.y.domain([0, Math.max(1, 1.1*d3.max(plot_data, d => d3.max(d['values'], d => d['value'])))]).nice();
    this.svg_plot.selectAll(".myYaxis")
     .transition()
     .duration(1000)
     .call(this.yAxis)
     .style("font-size", "0.8vw")
     .call(this.yAxis.ticks(5));

    var x = this.x;
    var y = this.y;
    var line = this.line;

    this.plot_lines.data(plot_data)
      .transition()
      .duration(1000)
      .attr("d", function(d){ return line(d.values) } );

      this.plot_dots
        .data(plot_data);

      this.plot_points.data(function(d){ return d.values })
      .transition()
      .duration(1000)
        .attr("cx", function(d) { return x(d.time) } )
        .attr("cy", function(d) { return y(Math.max(0, d.value)) } )


  }



}
