//@ 
//window["one"] = { tick: 55, second: 1000, minute: 60000, hour: 3600000, date: 86400000 }
//if (!window.fatalError) window["fatalError"] = function (a) { window["fatalFlag"] = true; try { alert(a || "Unknown error"); } catch (e) { } };
//window["A"] = function (a) { if (!a) return ([]); if (a.toArray) return (a.toArray()); var i = a.length, x = new Array(i); while (i--) x[i] = a[i]; return (x); };
//Function.prototype["reference"] = function () { if (arguments.length < 2 && arguments[0] === undefined) return (this); var ga = this, gb = arguments[0], gc = A(arguments).slice(1); return (Object.extend(function () { return (ga.apply(gb, gc)); }, { destroy: function () { try { gc = undefined; gb = undefined; ga = undefined; } catch (e) { } } })); };
//window["nothing"] = function () { };
//window["isError"] = function (a) { try { return (a.constructor != undefined && a instanceof Error); } catch (e) { } return (true); };
//window["isLoadComplete"] = function () { try { return (!!window.document.body); } catch (e) { } return (false); };
//window["choose"] = {};
//window.choose["from"] = function () { for (var i = 0, x = arguments.length; i < x; i++)try { return (arguments[i]()); } catch (e) { } };
//window.choose["string"] = function () { for (var i = 0, x = arguments.length, y; i < x; i++)try { if (!(y = String(arguments[i])).length) continue; if (y.length > 0) return (y); } catch (e) { } return (""); };
//window.choose["number"] = function () { for (var i = 0, x = arguments.length, y; i < x; i++)try { y = Number(arguments[i] * 1); if (!isNaN(y)) return (y); } catch (e) { } return (0); };
//String["__isBlank"] = (function () { var ga = /^\s*$/; return (function () { return (!this.length || ga.test(this)); }); })();
//String.prototype["isBlank"] = function () { return (String.__isBlank.apply(this)); };
//String.prototype["isEmpty"] = function () { return (!this.length); };
//Date.prototype["getOffset"] = function (arg) { try { return arg.valueOf() - this.valueOf(); } catch (error) { } return 0; }
//Date.prototype["getMonthDuration"] = function () { return new Date(this.getFullYear(), this.getMonth(), 1).valueOf() - new Date(this.getFullYear(), this.getMonth() - 1, 1).valueOf(); }
//Date.prototype["getYearDuration"] = function () { return new Date(this.getFullYear(), 0, 1).valueOf() - new Date(this.getFullYear() - 1, 0, 1).valueOf(); }
//Date.prototype["withOffset"] = function (offset) { return new Date(this.valueOf() + choose.number(offset)); }
//Date.prototype["withMonthOffset"] = function (offset) { return new Date(this.getFullYear(), this.getMonth() + choose.number(offset, 1), this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds(), this.getMilliseconds()); }
//Date.prototype["withYearOffset"] = function (offset) { return new Date(this.getFullYear() + choose.number(offset, 1), this.getMonth(), this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds(), this.getMilliseconds()); }
//Date.prototype["floorYear"] = function (value) { return new Date(this.getFullYear() - this.getFullYear() % choose.number(value, 1), 0, 1); }
//Date.prototype["floorMonth"] = function (value) { return new Date(this.getFullYear(), this.getMonth() - this.getMonth() % choose.number(value, 1), 1); }
//Date.prototype["floorDate"] = function (value) { return new Date(this.getFullYear(), this.getMonth(), this.getDate() - this.getDate() % choose.number(value, 1)); }
//Date.prototype["floorHours"] = function (value) { return new Date(this.getFullYear(), this.getMonth(), this.getDate(), this.getHours() - this.getHours() % choose.number(value, 1)); }
//Date.prototype["floorMinutes"] = function (value) { return new Date(this.getFullYear(), this.getMonth(), this.getDate(), this.getHours(), this.getMinutes() - this.getMinutes() % choose.number(value, 1)); }
//Date.prototype["floorSeconds"] = function (value) { return new Date(this.getFullYear(), this.getMonth(), this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds() - this.getSeconds() % choose.number(value, 1)); }

//window["onClickRelayout"] = function (arg) {
//  window.event.returnValue = false;
//  window.event.cancelBubble = true;
//  //  console.log('thePlot.layout.xaxis.type = ' + arg.layout.xaxis.type);
//  //  console.log('thePlot.layout.xaxis.range[0] = ' + arg.layout.xaxis.range[0]);
//  try {
//    arg.layout.xaxis.range[0] = '2020-08-01 00:00:00.000';
//    arg.layout.xaxis.range[1] = '2020-09-01 00:00:00.000';
//    Plotly.relayout("chart_001_body", arg.layout);
//  }
//  catch (error) {
//    console.log(error.description);
//  }
//}

//window["onClickTest"] = function () {
//  window.event.returnValue = false;
//  window.event.cancelBubble = true;
//  try {
//    var x = (new Date());
//    console.log(x);
//    console.log('getOffset=' + x.getOffset(new Date(0)));
//    console.log('getMonthDuration=' + x.getMonthDuration());
//    console.log('getYearDuration=' + x.getYearDuration());
//    console.log('withOffset=' + x.withOffset(60000));
//    console.log('withMonthOffset=' + x.withMonthOffset(-1));
//    console.log('withYearOffset=' + x.withYearOffset(-1));
//    console.log('floorYear=' + x.floorYear());
//    console.log('floorMonth=' + x.floorMonth());
//    console.log('floorDate=' + x.floorDate());
//    console.log('floorHours=' + x.floorHours());
//    console.log('floorMinutes=' + x.floorMinutes());
//    console.log('floorSeconds=' + x.floorSeconds());
//  }
//  catch (error) {
//    console.log(error.description);
//  }
//}
