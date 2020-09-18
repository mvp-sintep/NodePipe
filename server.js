'use strict';

//const loadJsonFile = require('load-json-file');

//loadJsonFile('/path/to/file.json').then(json => {
  // `json` contains the parsed object
//});
//const config = require('./config.json');

const { Controller, Tag, TagGroup } = require('ethernet-ip');
const PLC = new Controller();

var theTag = [];

PLC.subscribe(theTag[0] = new Tag('result'));
PLC.subscribe(theTag[1] = new Tag('opc.online'));

PLC.connect('192.168.255.22', 0).then(() => { PLC.scan_rate = 1000; PLC.scan(); });

var x = [];

PLC.forEach(tag => {
  tag.on("Initialized", (tag, arg) => {
    if (tag.name == 'result') x[0] = { name: "result", value: arg };
    if (tag.name == 'opc.online') x[1] = { name: "opc.online", value: arg };
  });
  tag.on("Changed", (tag, arg) => {
    if (tag.name == 'result') { x[0].value = arg; insertIntoData(x[0].value); }
    if (tag.name == 'opc.online') x[1].value = arg;
  });
})

const Pool = require('pg').Pool
const pool = new Pool({
  host: 'localhost',
  user: 'user',
  database: 'api',
  port: 5432,
  password: 'W3.sintep.ru'
})

const insertIntoData = (arg) => {
  pool.query('INSERT INTO data (dt,fv) values (now(),$1)', [arg], (error) => {
    if (error) { throw error }
  })
}

const http = require('http');
const port = process.env.PORT || 1337;

http.createServer(function (req, res) {
  if (req.url == '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<!DOCTYPE html><html>');
    res.write('<head>');
    res.write('<meta charset="utf-8">');
    res.write('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
    res.write('<title>Пример страницы</title>');
    res.write('<style type="text/css">');
    res.write('body {cursor:default; padding:0px; margin:0px; } ');
    res.write('body, tbody, button { font-family:Consolas; font-size:11px; } ');
    res.write('table { table-layout:fixed; border-collapse:collapse; } ');
    res.write('td { padding:0px; margin:0px; } ');
    res.write('body { margin-top:20px; } ');
    res.write('.block { position:absolute; } ');
    res.write('.block.parameter { width:120px; height:60px; } ');
    res.write('.block.parameter#div_001 { top:20px; left:5px; } ');
    res.write('.block.parameter#div_002 { top:20px; left:136px; } ');
    res.write('.parameter.header { font-size:11px; } ');
    res.write('.parameter.body { width:117px; height:31px; display:block; border-radius:3px; border-style:solid; border-color:#666666; padding:2px; } ');
    res.write('.parameter.value { font-size:24px; width:78px; text-align:right; padding-right:3px; } ');
    res.write('.parameter.unit { font-size:10px; width:38px; padding-top:7px; padding-left:2px; } ');
    res.write('.parameter.footer { font-size:4px; } ');
    res.write('</style>');
    res.write('</head>');
    res.write('<body>');
    res.write('<div id="div_001" class="block parameter"><span class="header">Виброскорость</span>');
    res.write('<span class="body parameter"><table><tbody><tr><td class="parameter value">' + x[0].value.toFixed(2) + '</td><td class="parameter unit">мм/сек</td></tr></tbody></table></span>');
    res.write('<span class="footer parameter">&nbsp;</span></div>\r\n');
    res.write('<div id="div_002" class="block parameter"><span class="header">Счетчик связи</span>');
    res.write('<span class="body parameter"><table><tbody><tr><td class="parameter value">' + x[1].value + '</td><td class="parameter unit">ед.</td></tr></tbody></table></span>');
    res.write('<span class="footer parameter">&nbsp;</span></div>\r\n');
    res.write('<div style="margin-top:100px;">\r\n\r\n\r\n' + theTag[0].timestamp + '</div>');
    res.write('</body>');
    res.end('</html>');
  }
  else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>NOT FOUND</body></html>');
  }
}).listen(port);

