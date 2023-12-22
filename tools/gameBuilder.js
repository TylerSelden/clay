var fs = require('fs');
var path = process.argv[2];
var writeTo = process.argv[3];

if (!path || !writeTo) {
  console.log("Usage: node gameBuilder.js <input file> <output file>");
  process.exit(1);
}

// read file
console.log("Reading file...");
var data = JSON.parse(fs.readFileSync(path, 'utf8'));
var nodes = {};

// sort nodes
console.log("Sorting nodes...");
for (var node of data.nodes) {
  nodes[node.id] = {id: node.id, text: node.text, to: [], from: [], x: node.x};
}
// sort paths
console.log("Sorting paths...");
for (var path of data.edges) {
  nodes[path.fromNode].to.push(path.toNode);
  nodes[path.toNode].from.push(path.fromNode);
}


function build() {
  console.log("Building data...");
  for (var i in nodes) {
    node = nodes[i];
    if (node.to.length > 1) node.to.sort((a, b) => nodes[a].x - nodes[b].x); // sort by x value (left is first)
    data[i] = { text: node.text, to: node.to, from: node.from };
  }
  // remove nodes and edges
  delete data.nodes;
  delete data.edges;
}

build();


// finish up
console.log("Done!");
console.log("Writing to file...");
var writeData = JSON.stringify(data, null, 2);
fs.writeFileSync(writeTo, writeData);
console.log(`Done! Wrote ${writeData.split('\n').length} lines.`);