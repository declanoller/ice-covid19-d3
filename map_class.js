


class Map {


  constructor(div_id, geo_data, ice_data, update_fn) {

    this.fac_selected = '';

    var R0_data_index = 1;
    var days_data_index = 2;
    var R0_values_list = ['2.5', '3.5', '7'];
    this.R0_key = R0_values_list[R0_data_index];

    this.map_fill_col = "#b8b8b8";
    this.circles_color = "#D18975";
    this.circles_color_sel = "black";

    var bbox_width = d3.select(div_id).node().getBoundingClientRect().width;
    var bbox_height = bbox_width/1.6;
    this.margin = {top: Math.round(bbox_height/30), bottom: Math.round(bbox_height/30), left: Math.round(bbox_height/12), right: Math.round(bbox_height/12)};

    this.plot_w = Math.round((bbox_width - (this.margin.left + this.margin.right)));
    this.plot_h = Math.round(bbox_height - (this.margin.top + this.margin.bottom));

    // The svg
    this.svg_plot = d3.select(div_id)
      .append("svg")
      .attr("width", this.plot_w + this.margin.left + this.margin.right)
      .attr("height", this.plot_h + this.margin.top + this.margin.bottom);

    // Map and projection
    var projection = d3.geoMercator()
        .center([-97.5, 40])                // GPS of location to zoom on
        .scale(1.0*this.plot_w)                       // This is like the zoom
        .translate([this.margin.left + this.plot_w/2, this.margin.top + this.plot_h/2 ]);

    //console.log(geo_data.features);

    // Draw the map
    this.svg_plot.append("g")
        .selectAll("path")
        .data([geo_data])
        .enter()
        .append("path")
          .attr("fill", this.map_fill_col)
          .attr("d", d3.geoPath().projection(projection))
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("opacity", .3);


    this.svg_plot.append('text')
    .attr("transform",
          "translate(" + (1.0*this.plot_w/2 + this.margin.left) + " ," +
                         (3*this.margin.top) + ")")
    .style("text-anchor", "middle")
    .attr("id", "map_title")
    .text("Cumulative infections at 90 days, for R0 = " + this.R0_key);

    var Tooltip = d3.select(div_id)
        .append("div")
        .style("position", "absolute")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");


    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function(d) {

      Tooltip.style("opacity", 1);
    }
    var mousemove = function(d) {
      //console.log(event.pageX, event.pageY);
      //console.log(d3.mouse(this)[0], d3.mouse(this)[1]);
      //console.log(d3.select(this).attr("cx"), d3.select(this).attr("cy"));
      var mouse_x = event.pageX;
      var mouse_y = event.pageY;
      var offset = 15;
      Tooltip
        .html(d.name + " : " + Math.max(0, d[bubble_key][R0_data_index]["values"][days_data_index]["value"]) + " Cumulative Infections")
        .style("left", (mouse_x + offset) + "px")
        .style("top",  (mouse_y + offset) + "px");
    }
    var mouseleave = function(d) {
      Tooltip.style("opacity", 0);
    }


    var fac_keys_list = Object.keys(ice_data);
    //console.log(fac_keys_list);

    var fac_keys_with_coords = fac_keys_list.filter(d => "coordinates" in ice_data[d]);

    var fac_with_keys_data = fac_keys_with_coords.map(d => ice_data[d]);
    //console.log(fac_coords_data);



    //console.log(fac_coords_data[0]);
    var bubble_key = "Cumulative Infections";
    var bubble_key_values = fac_with_keys_data.map(function(d){ return d[bubble_key][R0_data_index]["values"][days_data_index]["value"]; });

    var bubble_key_max = Math.max(...bubble_key_values);

    fac_with_keys_data = fac_with_keys_data.sort(function compare(a,b){
      return (a[bubble_key][R0_data_index]["values"][days_data_index]["value"] < b[bubble_key][R0_data_index]["values"][days_data_index]["value"]);
    });

    // Add a scale for bubble size
    var size = d3.scaleLinear()
      .domain([0, bubble_key_max])  // What's in the data
      .range([this.plot_w/200, this.plot_w/20]);  // Size in pixel

    // Add circles:
    this.svg_plot
      .selectAll("myCircles")
      .data(fac_with_keys_data)
      .enter()
      .append("circle")
        .attr("class", "map_circle")
        .attr("cx", function(d){ return projection([d["coordinates"][1], d["coordinates"][0]])[0] })
        .attr("cy", function(d){ return projection([d["coordinates"][1], d["coordinates"][0]])[1] })
        .attr("r", function(d){ return size(Math.max(0, d[bubble_key][R0_data_index]["values"][days_data_index]["value"])); })
        .style("fill", this.circles_color)
        .attr("stroke", this.circles_color)
        .attr("stroke-width", 1)
        .attr("fill-opacity", .2)
        .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
      .on("click", function(d){
        update_fn(d.name);
      }
    );

  }

  updateSelected(new_fac){

    var col_sel = this.circles_color_sel;
    var col_no_sel = this.circles_color;

    d3.selectAll(".map_circle")
        .attr("stroke", function(d){return (d.name == new_fac) ? col_sel : col_no_sel;})
        .attr("stroke-width", function(d){return (d.name == new_fac) ? 2 : 1; });
  }

}
