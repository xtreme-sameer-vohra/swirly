var fs = require('fs');

var dumpFileRegex = /^dump\..*\.vm-.*.js$/
const folderToScan = './build';

var indexTemplate = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Swirly</title>
    <script src="build/jquery.js"></script>
    <script src="build/react.js"></script>
    <script src="build/PARSED_CONTENT_REFERENCE"></script>
    <link rel="stylesheet" href="build/swirly.css" />
  </head>
  <body>
    <div id="dumps"></div>
    <script src="build/swirly.js"></script>
  </body>
</html>`;

function generateHTMLTemplate(fileName){
   fs.writeFile(fileName.replace('.js','.html'), indexTemplate.replace('PARSED_CONTENT_REFERENCE', fileName), function(err) {
      if(err) {
          return console.log(err);
      }
    });
}

function parseDumpFiles(){
  fs.readdir(folderToScan, (err, files) => {
    files.forEach(file => {
      var match = file.match(dumpFileRegex);
      if (match) {
        generateHTMLTemplate(file)
      }
    });
  })
}

parseDumpFiles();