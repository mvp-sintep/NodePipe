'use strict';

const Pool = require('pg').Pool;
const pool = new Pool({ host: 'localhost', user: 'user', database: 'api', port: 5432, password: 'W3.sintep.ru' });
const { Controller, Tag, TagGroup } = require('ethernet-ip');
const http = require('http');

const PLC = [new Controller(), new Controller()];

var TAG = [];
var index = 0;

const onTAGinit = function () {
  var type = 0;
  pool
    .query("select type from public.tag where id = ($1);", [this.id])
    .then((result) => {
      switch (this.type) {
        case 'SINT': type = 1; break;
        case 'INT': type = 2; break;
        case 'DINT': type = 3; break;
        case 'REAL': type = 4; break;
        case 'BOOL': type = 5; break;
      }
      if (result.rows[0].type === null) {
        pool.query("update public.tag set type = ($2) where id = ($1);", [this.id, type], () => { });
      }
      else if (result.rows[0].type !== type) {
        throw "USER FATAL ERROR: tag datatype [" + this.name + "] no equal the database existing";
      }
      this.insert = onTAGvalue;
    });
  this.init = undefined;
};

const onTAGvalue = function () {
  var table;
  switch (this.type) {
    case 'SINT':
    case 'INT':
    case 'DINT': table = 'i'; break;
    case 'REAL': table = 'r'; break;
    case 'BOOL': table = 'b'; break;
  }
  pool.query('insert into public.' + table + ' (dt,tag,value) values (now(),$1,$2)', [this.id, this.value], (error) => {
    if (error) { console.log(error); }
  });
};

PLC[0].ip = '192.168.255.22';
PLC[0].scan_rate = 1000;

[
  'result'
]
  .forEach(function (arg) {
    PLC[0].subscribe(TAG[index] = new Tag(arg));
    TAG[index].init = onTAGinit;
    TAG[index++].plc = 0;
  });

PLC[0].forEach(tag => {
  tag.on("Initialized", (tag, arg) => { if (tag.init !== undefined) tag.init(); });
  tag.on("Changed", (tag, arg) => { if (tag.insert !== undefined) tag.insert(); });
});

PLC[1].ip = '192.168.255.22';
PLC[1].scan_rate = 5000;

[
  'opc.online'
]
  .forEach(function (arg) {
    PLC[1].subscribe(TAG[index] = new Tag(arg));
    TAG[index].init = onTAGinit;
    TAG[index++].plc = 0;
  });

PLC[1].forEach(tag => {
  tag.on("Initialized", (tag, arg) => { if (tag.init !== undefined) tag.init(); });
  tag.on("Changed", (tag, arg) => { if (tag.insert !== undefined) tag.insert(); });
});

pool
  .query("select to_regclass('public.plc_id_seq');")
  .then(result => {
    if (result.rows[0].to_regclass == null) {
      pool
        .query("create sequence public.plc_id_seq cycle increment 1 start 1 minvalue 1 maxvalue 2147483647 cache 1;")
        .then(() => {
          pool
            .query('alter sequence public.plc_id_seq owner to "user";')
            .then(() => { afterPLCseqAction(); })
        });
    }
    else { afterPLCseqAction(); }
  });

const afterPLCseqAction = function () {
  pool
    .query("select to_regclass('public.plc');")
    .then(result => {
      if (result.rows[0].to_regclass == null) {
        pool
          .query("create table public.plc ( id integer not null default nextval('plc_id_seq'::regclass)," +
            "ip inet unique, constraint plc_pkey primary key(id) ) with ( oids = false ) tablespace pg_default;")
          .then(() => {
            pool
              .query('alter table public.plc owner to "user";')
              .then(() => { afterPLCtableAction(); });
          });
      }
      else { afterPLCtableAction(); }
    });
}

const afterPLCtableAction = function () {
  var i = 0;
  PLC.forEach(function (arg) {
    pool
      .query('select id from public.plc where ip = ($1);', [arg.ip])
      .then(result => {
        if (result.rowCount == 0) {
          pool
            .query("insert into public.plc (ip) values ($1);", [arg.ip])
            .then(() => {
              pool
                .query('select id from public.plc where ip = ($1);', [arg.ip])
                .then(result => {
                  arg.id = result.rows[0].id;
                  if (++i == PLC.length) afterPLCidAction();
                });
            });
        }
        else {
          arg.id = result.rows[0].id;
          if (++i == PLC.length) afterPLCidAction();
        }
      });
  });
}

const afterPLCidAction = function () {
  pool
    .query("select to_regclass('public.tag_id_seq');")
    .then(result => {
      if (result.rows[0].to_regclass == null) {
        pool
          .query("create sequence public.tag_id_seq cycle increment 1 start 1 minvalue 1 maxvalue 2147483647 cache 1;")
          .then(() => {
            pool
              .query('alter sequence public.tag_id_seq owner to "user";')
              .then(() => { afterTAGseqAction(); })
          });
      }
      else {
        afterTAGseqAction();
      }
    });
};

const afterTAGseqAction = function () {
  pool
    .query("select to_regclass('public.tag');")
    .then(result => {
      if (result.rows[0].to_regclass == null) {
        pool
          .query("create table public.tag ( " +
            "id integer not null default nextval('data_id_seq'::regclass)," +
            "plc integer not null, " +
            "name character varying(125) not null, " +
            "type integer default null, " +
            "constraint tag_pkey primary key(id), " +
            "constraint tag_plc_fkey foreign key (plc) references public.plc (id) match full on delete cascade on update cascade" +
            ") with ( oids = false ) tablespace pg_default;")
          .then(() => {
            pool
              .query('alter table public.tag owner to "user";')
              .then(() => { afterTAGtableAction(); });
          });
      }
      else { afterTAGtableAction(); }
    });
};

const afterTAGtableAction = function () {
  var i = 0;
  TAG.forEach(function (arg) {
    pool
      .query("select id, plc, name from public.tag where plc = ($1) and name = ($2) limit 1;", [PLC[arg.plc].id, arg.name])
      .then((result) => {
        if (result.rowCount == 0) {
          pool
            .query("insert into public.tag (plc,name) values ($1,$2);", [PLC[arg.plc].id, arg.name])
            .then(() => {
              pool.query("select id from public.tag where plc = ($1) and name = ($2) limit 1;", [PLC[arg.plc].id, arg.name], (error, result) => {
                arg.id = result.rows[0].id;
              });
              if (++i == TAG.length) afterTAGaddAction();
            });
        }
        else {
          arg.id = result.rows[0].id;
          if (++i == TAG.length) afterTAGaddAction();
        }
      });
  });
};

const afterTAGaddAction = function () {
  pool
    .query("select to_regclass('public.i');")
    .then(result => {
      if (result.rows[0].to_regclass == null) {
        pool
          .query(
            "create table public.i ( " +
            "tag integer not null," +
            "dt timestamp without time zone not null," +
            "value integer not null," +
            "constraint tag_i_fkey foreign key (tag) references public.tag (id) match full on delete cascade on update cascade" +
            ") with ( oids = false ) tablespace pg_default;")
          .then(() => {
            pool.query('alter table public.i owner to "user";');
          });
      }
    });
  pool
    .query("select to_regclass('public.r');")
    .then(result => {
      if (result.rows[0].to_regclass == null) {
        pool
          .query(
            "create table public.r ( " +
            "tag integer not null," +
            "dt timestamp without time zone not null," +
            "value real not null," +
            "constraint tag_r_fkey foreign key (tag) references public.tag (id) match full on delete cascade on update cascade" +
            ") with ( oids = false ) tablespace pg_default;")
          .then(() => {
            pool.query('alter table public.r owner to "user";');
          });
      }
    });
  pool
    .query("select to_regclass('public.b');")
    .then(result => {
      if (result.rows[0].to_regclass == null) {
        pool
          .query(
            "create table public.b ( " +
            "tag integer not null," +
            "dt timestamp without time zone not null," +
            "value boolean not null," +
            "constraint tag_b_fkey foreign key (tag) references public.tag (id) match full on delete cascade on update cascade" +
            ") with ( oids = false ) tablespace pg_default;")
          .then(() => {
            pool.query('alter table public.b owner to "user";');
          });
      }
    });

  PLC.forEach(arg => {
    arg.connect(arg.ip, 0).then(() => { arg.scan(); });
  });

};

const server = http.createServer((req, res) => {
  if (req.url == '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(
      '<!DOCTYPE html><html>' +
      '<head>' +
      '<meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
      '<title>Node with postgresql sample</title>' +
      '<style type="text/css">' +
      'body {cursor:default; padding:0px; margin:0px;}' +
      'body,tbody,button {font-family:Consolas;font-size:11px;}' +
      'table {table-layout:fixed;border-collapse:collapse;}' +
      'td {padding:0px;margin:0px;}' +
      'table {background-color:#f1f1c1;}' +
      'table, table tr, table th { border: 1px solid black;}' +
      'table tr:nth-child(even) {background-color:#eee;}' +
      'table tr:nth-child(odd) {background-color:white;}' +
      'table td {padding-left:5px;padding-right:5px;}' +
      '</style>' +
      '</head>');
    res.write('<body>');
    res.write(
      '<table class="plcs">' +
      '<caption>PLC list</caption>' +
      '<thead><tr><th>Name</th><th>S/N</th><th>Version</th><th>Date</th><th>Scanning</th></tr></thead>');
    PLC.forEach(plc => {
      res.write('<tr>');
      res.write('<td>' + plc.properties.name + '</td>');
      res.write('<td>' + plc.properties.serial_number + '</td>');
      res.write('<td>' + plc.properties.version + '</td>');
      res.write('<td>' + plc.properties.time + '</td>');
      res.write('<td>' + plc.scanning + '</td>');
      res.write('</tr>');
    });
    res.write('</table>');

    res.write(
      '<table class="tags">' +
      '<caption>PLC tag list</caption>' +
      '<thead><tr><th>Name</th><th>Bit index</th><th>Type</th><th>Value</th><th>Time stamp</th><th>Error</th></tr></thead>');
    TAG.forEach(tag => {
      res.write('<tr>');
      res.write('<td>' + tag.name + '</td>');
      res.write('<td>' + tag.bitIndex + '</td>');
      res.write('<td>' + tag.type + '</td>');
      res.write('<td>' + tag.value + '</td>');
      res.write('<td>' + tag.timestamp + '</td>');
      res.write('<td>' + tag.error + '</td>');
      res.write('</tr>');
    });
    res.write('</table>');

    res.write('</body>');
    res.end('</html>');
  }
  else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>[' + req.url + '] not found</body></html>');
  }
});

server.listen(process.env.PORT || 1337);
