var fs = require('fs');

var goroutineHeaderRegex = /^goroutine (\d+) \[([^,\]]+)(, ([^,\]]+))?(, locked to thread)?\]:$/


var fileToParse = process.argv[2] || ".";
console.log("Scanning :" + fileToParse);

function GoroutineStack(id, state, waiting, isLocked) {
  this.id = id;
  this.state = state;
  this.waiting = waiting;
  this.isLocked = isLocked;
  this.stack = "";
};

GoroutineStack.prototype.pushStackLine = function(line) {
  this.stack += line + "\n";
};

var indexTemplate = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Swirly</title>
    <script src="jquery.js"></script>
    <script src="react.js"></script>
    <script src="dump.js"></script>
    <link rel="stylesheet" href="swirly.css" />
  </head>
  <body>
    <div id="dumps"></div>
    <script src="swirly.js"></script>
  </body>
</html>`;

function generateHTMLTemplate(){
   htmlFileName = getFileWritePath("dump.html")
   fs.writeFile(htmlFileName, indexTemplate, function(err) {
      if(err) {
          return console.log(err);
      }
    });
   console.log("Generated : " + htmlFileName)
}

function getFileWritePath(fileName){
  return "./build/" + fileName
}

function parseDumpFile(fileName){
  var goroutine;
  var goroutines = [];
  
  var lineReader = require('readline').createInterface({
    input: fs.createReadStream(fileName)
  });
  lineReader.on('line', function (line) {
      if (!goroutine) {
        var match = line.match(goroutineHeaderRegex);
        if (!match) {
          console.log("malformed goroutine stack header:", line);
          process.exit(1);
        }

        goroutine = new GoroutineStack(match[1], match[2], match[4], !!match[5]);
      } else if (line == "") {
        goroutines.push(goroutine);
        goroutine = undefined;
      } else {
        goroutine.pushStackLine(line);
      }
  });

  lineReader.on('close', function(){
    console.log('Finished parsing :' + fileName);
    jsFile = getFileWritePath("dump.js");
    fs.writeFile(jsFile, "document.parsedGoRoutines = " + JSON.stringify(goroutines), function(err) {
      if(err) {
          return console.log(err);
      }
    });

    
  })
}

parseDumpFile(fileToParse);
generateHTMLTemplate();