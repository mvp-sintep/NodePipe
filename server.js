'use strict'; // Выставляем режим 'современный' для интрепритации скрипта

const Pool = require('pg').Pool; // Коннектор postgresql требует наличие модуля 'pg'
const pool = new Pool({ host: 'localhost', user: 'user', database: 'api', port: 5432, password: 'W3.sintep.ru' }); // Создаем соединение с базой данных
const { Controller, Tag, TagGroup } = require('ethernet-ip'); // Коннектор с контроллером требует наличия модуля 'ethernet-ip'
const http = require('http'); // Коннектор для формирования страницы

var TAG = []; // Массив тегов
var index = 0; // Индекс массива тегов

const onTAGinit = function () { // Функция типизации данных БД по типу данных тегов
  var type = 0; // Временная переменная
  pool // Обращаемся к БД
    .query("select type from public.tag where id = ($1);", [this.id]) // Пытаемся получить тип данных из БД
    .then((result) => { // После того как пришел ответ
      switch (this.type) { // Получаем код типа данных из тега
        case 'SINT': type = 1; break;
        case 'INT': type = 2; break;
        case 'DINT': type = 3; break;
        case 'REAL': type = 4; break;
        case 'BOOL': type = 5; break;
      }
      if (result.rows[0].type === null) { // Если в ответе от БД нет такого тега
        pool.query("update public.tag set type = ($2) where id = ($1);", [this.id, type], () => { }); // Добавляем тег с типом в БД
      }
      else if (result.rows[0].type !== type) { // Если в ответе от БД есть тег, но его тип не совпадает
        throw "USER FATAL ERROR: tag datatype [" + this.name + "] no equal the database existing"; // Вызываем критическую ошибку
      }
      this.insert = onTAGvalue; // Присваиваем значение ссылке на функцию обработчик новых значений тегов
    });
  this.init = undefined; // Сбрасываем ссылку на функцию обработчик иницианализации
};

const onTAGvalue = function () { // Функция обработки новыйх значений тегов
  var table; // Временная переменная
  switch (this.type) { // Выбираем таблицу по типу тега
    case 'SINT':
    case 'INT':
    case 'DINT': table = 'i'; break; // Для всех целочисленных типов таблица i
    case 'REAL': table = 'r'; break; // Для типа real - r
    case 'BOOL': table = 'b'; break; // Для типа boolean - b
  }
  pool.query('insert into public.' + table + ' (dt,tag,value) values (now(),$1,$2)', [this.id, this.value], (error) => { // Записываем значение в БД
    if (error) { console.log(error); } // Пишем ошибки
  });
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////// ЭТО СЕКЦИЯ НАСТРОЙКИ ///////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const PLC = [new Controller(), new Controller()]; // Создаем нужное количество контроллеров

PLC[0].ip = '192.168.255.22'; // Указываем IP адрес контроллера
PLC[0].scan_rate = 1800000; // Указываем время обновления тегов (для подавляющего числа применений указываем время обновления 1/2 минуты = 1800000 мсек, что равно 2880 записей в сутки)

[ // Указываем список тегов
  'result'
]
  .forEach(function (arg) { // Для каждого элемента массива будет вызван обработчик
    PLC[0].subscribe(TAG[index] = new Tag(arg)); // Создаем новый тег и подписываемся на его изменения
    TAG[index].init = onTAGinit; // Назначаем фугкцию обработчик инициализации тега
    TAG[index++].plc = 0; // Инициализируем идентификатор контроллера в БД нулем
  });

PLC[0].forEach(tag => { // Вызов обработчиков 
  tag.on("Initialized", (tag, arg) => { if (tag.init !== undefined) tag.init(); }); // Инициализация тега
  tag.on("Changed", (tag, arg) => { if (tag.insert !== undefined) tag.insert(); }); // Изменение значения тега
});

PLC[1].ip = '192.168.255.22'; // Полностью аналогично для следующего контроллера
PLC[1].scan_rate = 1800000;

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////// НАСТРОЙКА ЗАКОНЧЕНА. ///////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

pool
  .query("select to_regclass('public.plc_id_seq');") // Проверяем существование объекта автонумерации контроллеров в БД
  .then(result => {
    if (result.rows[0].to_regclass == null) { // Если объект не существует
      pool
        .query("create sequence public.plc_id_seq cycle increment 1 start 1 minvalue 1 maxvalue 2147483647 cache 1;") // Создаем объект
        .then(() => {
          pool
            .query('alter sequence public.plc_id_seq owner to "user";') // Изменяем владельца объекта
            .then(() => { afterPLCseqAction(); }) // После завершения вызываем
        });
    }
    else { afterPLCseqAction(); } // Объект существует вызываем
  });

const afterPLCseqAction = function () { // После проверки автонумерации контроллеров
  pool
    .query("select to_regclass('public.plc');") // Проверяем существование таблицы контроллеров
    .then(result => {
      if (result.rows[0].to_regclass == null) { // Если объект не сущесвует
        pool
          .query("create table public.plc ( id integer not null default nextval('plc_id_seq'::regclass)," +
            "ip inet unique, constraint plc_pkey primary key(id) ) with ( oids = false ) tablespace pg_default;") // Создаем таблицу контроллеров
          .then(() => {
            pool
              .query('alter table public.plc owner to "user";') // Изменем владельца объекта
              .then(() => { afterPLCtableAction(); }); // После завершения вызываем
          });
      }
      else { afterPLCtableAction(); } // После завершения вызываем
    });
}

const afterPLCtableAction = function () { // После проверки существования таблицы контроллеров
  var i = 0;
  PLC.forEach(function (arg) { // Для всех контроллеров
    pool
      .query('select id from public.plc where ip = ($1);', [arg.ip]) // Проверяем наличие записи о контроллере в БД
      .then(result => {
        if (result.rowCount == 0) {
          pool
            .query("insert into public.plc (ip) values ($1);", [arg.ip]) // Добавляем новый контроллер
            .then(() => {
              pool
                .query('select id from public.plc where ip = ($1);', [arg.ip]) // Получаем идентификатор контроллера в БД
                .then(result => {
                  arg.id = result.rows[0].id; // Запоминаем идентификатор контроллера в БД для последующего использования
                  if (++i == PLC.length) afterPLCidAction(); // После завершения вызываем
                });
            });
        }
        else {
          arg.id = result.rows[0].id; // Запоминаем идентификатор контроллера в БД для последующего использования
          if (++i == PLC.length) afterPLCidAction(); // После завершения вызываем
        }
      });
  });
}

const afterPLCidAction = function () { // После проверки существования записей контроллеров
  pool
    .query("select to_regclass('public.tag_id_seq');") // Проверяем существование объекта автонумерации тегов
    .then(result => {
      if (result.rows[0].to_regclass == null) {
        pool
          .query("create sequence public.tag_id_seq cycle increment 1 start 1 minvalue 1 maxvalue 2147483647 cache 1;") // Создаем объект
          .then(() => {
            pool
              .query('alter sequence public.tag_id_seq owner to "user";') // Изменяем владельца
              .then(() => { afterTAGseqAction(); }) // После завершения вызываем 
          });
      }
      else {
        afterTAGseqAction(); // После завершения вызываем
      }
    });
};

const afterTAGseqAction = function () { // После проверки существования объекта автонумерации тегов
  pool
    .query("select to_regclass('public.tag');") // Проверяем существование таблицы тегов
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
            ") with ( oids = false ) tablespace pg_default;") // Создаем таблицу
          .then(() => {
            pool
              .query('alter table public.tag owner to "user";') // Изменяем владельца
              .then(() => { afterTAGtableAction(); }); // После завершения вызываем 
          });
      }
      else { afterTAGtableAction(); } // После завершения вызываем 
    });
};

const afterTAGtableAction = function () { // После проверки существования таблицы тегов
  var i = 0;
  TAG.forEach(function (arg) { // Для каждого тега
    pool
      .query("select id, plc, name from public.tag where plc = ($1) and name = ($2) limit 1;", [PLC[arg.plc].id, arg.name]) // Пытаемся получить идентификатор тега в БД
      .then((result) => {
        if (result.rowCount == 0) { // Если тега нет
          pool
            .query("insert into public.tag (plc,name) values ($1,$2);", [PLC[arg.plc].id, arg.name]) // Добавляем тег
            .then(() => {
              pool.query("select id from public.tag where plc = ($1) and name = ($2) limit 1;", [PLC[arg.plc].id, arg.name], (error, result) => { // Получаем идентификатор
                arg.id = result.rows[0].id; // Сохраняем идентификатор для дальнейшего использования
              });
              if (++i == TAG.length) afterTAGaddAction(); // После завершения вызываем 
            });
        }
        else { // Тег найден
          arg.id = result.rows[0].id; // Сохраняем идентификатор для дальнейшего использования
          if (++i == TAG.length) afterTAGaddAction(); // После завершения вызываем 
        }
      });
  });
};

const afterTAGaddAction = function () { // После проверки наличия тегов в БД
  pool
    .query("select to_regclass('public.i');") // Проверяем существование таблицы значений целочисленных тегов
    .then(result => {
      if (result.rows[0].to_regclass == null) { // Если не сущесвует
        pool
          .query(
            "create table public.i ( " +
            "tag integer not null," +
            "dt timestamp without time zone not null," +
            "value integer not null," +
            "constraint tag_i_fkey foreign key (tag) references public.tag (id) match full on delete cascade on update cascade" +
            ") with ( oids = false ) tablespace pg_default;") // Создаем таблицу
          .then(() => {
            pool.query('alter table public.i owner to "user";'); // Изменяем владельца
          });
      }
    });
  pool
    .query("select to_regclass('public.r');") // Проверяем существование таблицы значений тегов с плавающей точкой
    .then(result => {
      if (result.rows[0].to_regclass == null) { // Если не сущесвует
        pool
          .query(
            "create table public.r ( " +
            "tag integer not null," +
            "dt timestamp without time zone not null," +
            "value real not null," +
            "constraint tag_r_fkey foreign key (tag) references public.tag (id) match full on delete cascade on update cascade" +
            ") with ( oids = false ) tablespace pg_default;") // Создаем таблицу
          .then(() => {
            pool.query('alter table public.r owner to "user";'); // Изменяем владельца
          });
      }
    });
  pool
    .query("select to_regclass('public.b');") // Проверяем существование таблицы значений тегов да/нет
    .then(result => {
      if (result.rows[0].to_regclass == null) { // Если не сущесвует
        pool
          .query(
            "create table public.b ( " +
            "tag integer not null," +
            "dt timestamp without time zone not null," +
            "value boolean not null," +
            "constraint tag_b_fkey foreign key (tag) references public.tag (id) match full on delete cascade on update cascade" +
            ") with ( oids = false ) tablespace pg_default;") // Создаем таблицу
          .then(() => {
            pool.query('alter table public.b owner to "user";'); // Изменяем владельца
          });
      }
    });

  PLC.forEach(arg => { // Для всех контроллеров запускаем процесс сканирования тегов
    arg.connect(arg.ip, 0).then(() => { arg.scan(); });
  });

};

const server = http.createServer((req, res) => { // Функция http сервера
  if (req.url == '/') { // Если запрошен корневой элемент
    res.writeHead(200, { 'Content-Type': 'text/html' }); // Ответ кодом 200 и далее содержимое
    res.write( 
      '<!DOCTYPE html><html>' +
      '<head>' +
      '<meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
      '<title>NODE.JS >> ETHERNET-IP >> POSTGRESQL</title>' +
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
      '</head>'); // Записываем заголовок и таблицу визуальных стилей
    res.write('<body>'); // Начало тела
    res.write(
      '<table class="plcs">' +
      '<caption>PLC list</caption>' +
      '<thead><tr><th>Name</th><th>S/N</th><th>Version</th><th>Date</th><th>Scanning</th></tr></thead>'); // Заголовок таблицы контроллеров
    PLC.forEach(plc => { // Для каждого контроллера
      res.write(
        '<tr>' +
        '<td>' + plc.properties.name + '</td>' +
        '<td>' + plc.properties.serial_number + '</td>' +
        '<td>' + plc.properties.version + '</td>' +
        '<td>' + plc.properties.time + '</td>' +
        '<td>' + plc.scanning + '</td>' +
        '</tr>'); // Строка данных
    });
    res.write('</table>'); // Закончили с таблицей контроллеров

    res.write(
      '<table class="tags">' +
      '<caption>PLC tag list</caption>' +
      '<thead><tr><th>Name</th><th>Bit index</th><th>Type</th><th>Value</th><th>Time stamp</th><th>Error</th></tr></thead>'); // Заголовок таблицы тегов
    TAG.forEach(tag => { // Для каждого тега
      res.write(
        '<tr>' +
        '<td>' + tag.name + '</td>' +
        '<td>' + tag.bitIndex + '</td>' +
        '<td>' + tag.type + '</td>' +
        '<td>' + tag.value + '</td>' +
        '<td>' + tag.timestamp + '</td>' +
        '<td>' + tag.error + '</td>' +
        '</tr>'); // Строка данных
    });
    res.write('</table>'); // Закончили с таблицей тегов

    res.write('</body>'); // Закончили с телом
    res.end('</html>'); // Закончили с документом
  }
  else { // Запрощен не известный ресурс
    res.writeHead(404, { 'Content-Type': 'text/html' }); // Отвечаем заголовком с кодом 404
    res.end('<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>[' + req.url + '] not found</body></html>'); // И телом пустого документа
  }
});

server.listen(process.env.PORT || 1337); // Запускаем WEB сервер

const dbStaff = function () { // Функция периодической очистки БД
  ["b", "i", "r"] // Список таблиц
    .forEach(function (arg) { // Для каждой таблицы
      pool
        .query("delete from public." + arg + " where dt < (now() - interval '2 year');") // Запускаем процесс маркирования записей старше двух лет
        .then(() => { pool.query("vacuum analyze public." + arg + ";"); }); // После пометки запускаем процесс удаления помеченных записей
    });
};

setInterval(dbStaff, 86400000); // Выполняем обслуживание периодически - раз в сутки
