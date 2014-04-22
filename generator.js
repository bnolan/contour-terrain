"use strict"

var surfaceNets = require("surface-nets")
var ndarray = require("ndarray")
var fill = require("ndarray-fill")
var getFaces = require("planar-dual");
var noisejs = require("noisejs");

var noise = new noisejs.Noise(2);

var width = 128, height = 128;

var array = ndarray(new Float32Array(width*height), [width,height])
fill(array, function(i,j) {
  if(i==0 || j == 0 || i > width - 2 || j > width - 2)
    return 0
  else
    return noise.perlin2(i / 7, j / 9) + noise.perlin2(i / 15, j / 13);
  // return Math.pow(i-16,2) + Math.pow(j-16,2)
})

var svgFile = ['<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640">']
var polygons = [];

for(var threshold=0.1;threshold<1.0;threshold += 0.1){
  var mult = 8,
    offset = -20;

  var complex = surfaceNets(array, threshold);

  // complex.positions.forEach(function(pt) {
  //   pt[0] += 1
  //   pt[1] += 1
  // })

  var faces = getFaces(complex.cells, complex.positions);

  //console.log(faces)

  faces.forEach(function(face){
    var polygon = [];

    face.forEach(function(index){
      var x = complex.positions[index][0];
      var y = complex.positions[index][1];
      polygon.push(x * mult + offset);
      polygon.push(y * mult + offset);
    });

    svgFile.push('<polygon points="' + polygon.join(",") + '" style="fill:lime;stroke:purple;stroke-width:1" />')
  });

  faces.forEach(function(face){
    var polygon = [];

    face.forEach(function(index){
      var x = complex.positions[index][0];
      var y = complex.positions[index][1];
      var z = threshold * 100.0;

      polygon.push({
        x : x * mult + offset,
        y : y * mult + offset,
        z : z
      });
    });

    polygons.push(polygon);

    svgFile.push('<polygon points="' + polygon.join(",") + '" style="fill:lime;stroke:purple;stroke-width:1" />')
  });

  complex.cells.forEach(function(cell) {
    var p0 = complex.positions[cell[0]]
    var p1 = complex.positions[cell[1]]
    svgFile.push('<line x1="', offset + mult * p0[0], '" y1="', offset + mult * p0[1], '" x2="', offset + mult * p1[0], '" y2="', offset + mult * p1[1], '" stroke="red" stroke-width="1" />')
  })

  complex.positions.forEach(function(p) {
    svgFile.push('<circle cx="', offset + mult * p[0], '" cy="', offset + mult * p[1], '" r="1" stroke="black" stroke-width="0.1" fill="black" />')
  })

}
  // console.log(faces);


svgFile.push('</svg>')

var fs = require("fs")
fs.writeFileSync("result.svg", svgFile.join(""));

var fs = require("fs")
fs.writeFileSync("terrains/default.json", JSON.stringify(polygons));
