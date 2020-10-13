//@ thePlot
window["thePlot"] = 
{
  id: "chart_001_body",
  url: "/data?id=754246&count=1000",
  config: { displayModeBar: false },
  layout:
  {
    showlegend: false,
    autosize : false,
    height: 300,
    width: 356,
    margin: { l: 30, r: 12, b: 5, t: 0, pad: 0 }, 
    xaxis: {
      autorange: false,
      rangeselector: {
        buttons: [
          { count: 1, label: 'М', step: 'minute', stepmode: 'backward' },
          { count: 15, label: '15М', step: 'minute', stepmode: 'backward' },
          { count: 1, label: 'H', step: 'hour', stepmode: 'backward' },
          { count: 6, label: '6H', step: 'hour', stepmode: 'backward' },
          { step: 'all' }
        ]
      },
      rangeslider: { },
      type: 'date',
      tickfont: { family: 'Consolas', size: 4, color: 'white' },  
      tickformat: "%d-%m-%y %H:%M:%S",
    },
    yaxis: {
      autorange: false,
      range: [-10, 10],
      type: 'linear',
      tickfont: { family: 'Consolas', size: 10, color: 'black' },
    },
  },
}

//@ plotly 
Plotly.d3.csv( 
  thePlot.url, 
  function( err, rows )
  {
    function unpack( rows, key ){ return rows.map( function( row ){ return row[ key ]; } ); }
    var dX = unpack( rows, 'Дата и время' );
    thePlot.layout.xaxis[ "range" ] = [ dX[0], dX[ dX.length - 1 ] ];
    thePlot.layout.xaxis.rangeslider[ "range" ] = [ dX[0], dX[ dX.length - 1 ] ];
    thePlot[ "trace" ] = [ { name: 'Давление', type: "scatter", mode: "lines", x: dX, y: unpack( rows, 'Случайное число' ) } ];
    thePlot[ "plot" ] = Plotly.newPlot( thePlot.id, thePlot.trace, thePlot.layout, thePlot.config );
  }
)
//@ 
window["one"] = {tick:55,second:1000,minute:60000,hour:3600000,date:86400000}
if (!window.fatalError) window["fatalError"] = function (a) { window["fatalFlag"] = true; try { alert(a || "Unknown error"); } catch (e) { } };
Object["extend"] = function (a) { if (!a) return (a); for (var i = 1, x, y, z = arguments.length; i < z; i++) { try { for (y in x = arguments[i]) { try { if (x[y] instanceof Object && a[y]) { if (a[y] != x[y]) Object.extend(a[y], x[y]); continue; } } catch (e) { } a[y] = x[y]; } } catch (e) { } } return (a); };
window["A"] = function (a) { if (!a) return ([]); if (a.toArray) return (a.toArray()); var i = a.length, x = new Array(i); while (i--) x[i] = a[i]; return (x); };
Function.prototype["reference"] = function () { if (arguments.length < 2 && arguments[0] === undefined) return (this); var ga = this, gb = arguments[0], gc = A(arguments).slice(1); return (Object.extend(function () { return (ga.apply(gb, gc)); }, { destroy: function () { try { gc = undefined; gb = undefined; ga = undefined; } catch (e) { } } })); };
window["nothing"] = function () { };
window["isError"] = function (a) { try { return (a.constructor != undefined && a instanceof Error); } catch (e) { } return (true); };
window["isLoadComplete"] = function () { try { return (!!window.document.body); } catch (e) { } return (false); };
window["choose"] = {};
window.choose["from"] = function () { for (var i = 0, x = arguments.length; i < x; i++)try { return (arguments[i]()); } catch (e) { } };
window.choose["string"] = function () { for (var i = 0, x = arguments.length, y; i < x; i++)try { if (!(y = String(arguments[i])).length) continue; if (y.length > 0) return (y); } catch (e) { } return (""); };
window.choose["number"] = function () { for (var i = 0, x = arguments.length, y; i < x; i++)try { y = Number(arguments[i] * 1); if (!isNaN(y)) return (y); } catch (e) { } return (0); };
String["__isBlank"] = (function () { var ga = /^\s*$/; return (function () { return (!this.length || ga.test(this)); }); })();
String.prototype["isBlank"] = function () { return (String.__isBlank.apply(this)); };
String.prototype["isEmpty"] = function () { return (!this.length); };
window["HTMLElement"] = function (a) { try { a["extend"] = function () { return (Object.extend.apply(this, [this].concat(A(arguments)))); }; return (a.extend.apply(a, A(arguments))); } catch (e) { } return (a); };
window["iHTMLElement"] = { isExist: function () { return (!!this.document); }, isLoadComplete: function () { try { return (!!this.document.body); } catch (e) { } return (false); }, insertTo: function (a) { a.insertBefore(this); return (this); }, appendTo: function (a) { a.appendChild(this); return (this); }, replaceElement: function (a) { try { a.parentElement.replaceChild(this, a); } catch (e) { } return (this); }, destroy: function () { this.removeNode(true); } };
Date.prototype["getOffset"] = function (arg) { try { return arg.valueOf() - this.valueOf(); } catch( error ) { } return 0; }
Date.prototype["getMonthDuration"] = function() { return new Date( this.getFullYear(), this.getMonth(), 1 ).valueOf() - new Date( this.getFullYear(), this.getMonth() - 1, 1 ).valueOf(); }
Date.prototype["getYearDuration"] = function() { return new Date( this.getFullYear(), 0, 1 ).valueOf() - new Date( this.getFullYear() - 1, 0, 1 ).valueOf(); }
Date.prototype["withOffset"] = function( offset ) { return new Date( this.valueOf() + choose.number( offset ) ); }
Date.prototype["withMonthOffset"] = function( offset ) { return new Date( this.getFullYear(), this.getMonth() + choose.number( offset, 1 ), this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds(), this.getMilliseconds() ); }
Date.prototype["withYearOffset"] = function( offset ) { return new Date( this.getFullYear() + choose.number( offset, 1 ), this.getMonth(), this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds(), this.getMilliseconds() ); }
Date.prototype["floorYear"] = function( value ) { return new Date( this.getFullYear() - this.getFullYear() % choose.number( value, 1 ), 0, 1 ); }
Date.prototype["floorMonth"] = function( value ) { return new Date( this.getFullYear(), this.getMonth() - this.getMonth() % choose.number( value, 1 ), 1 ); }
Date.prototype["floorDate"] = function( value ) { return new Date( this.getFullYear(), this.getMonth(), this.getDate() - this.getDate() % choose.number( value, 1 )); }
Date.prototype["floorHours"] = function( value ) { return new Date( this.getFullYear(), this.getMonth(), this.getDate(), this.getHours() - this.getHours() % choose.number( value, 1 )); }
Date.prototype["floorMinutes"] = function( value ) { return new Date( this.getFullYear(), this.getMonth(), this.getDate(), this.getHours(), this.getMinutes() - this.getMinutes() % choose.number( value, 1 )); }
Date.prototype["floorSeconds"] = function( value ) { return new Date( this.getFullYear(), this.getMonth(), this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds() - this.getSeconds() % choose.number( value, 1 )); }

window[ "echo" ] = function ( text ) { var tmp = document.createElement( "span" ); tmp.innerText = text; echo.process.appendChild( tmp ); }

window[ "onClickRelayout" ] = function (arg)
{
  window.event.returnValue = false;
  window.event.cancelBubble = true;
  echo( '\r\nthePlot.layout.xaxis.type = ' + arg.layout.xaxis.type );
  echo( '\r\nthePlot.layout.xaxis.range[0] = ' + arg.layout.xaxis.range[0] );
  try
  {
    arg.layout.xaxis.range[0] = '2020-08-01 00:00:00.000';
    arg.layout.xaxis.range[1] = '2020-09-01 00:00:00.000';
    Plotly.relayout( arg.id, arg.layout );
  }
  catch( error )
  {
    echo( '\r\n' + error.description );
  }
}

window[ "onClickTest" ] = function ()
{
  window.event.returnValue = false;
  window.event.cancelBubble = true;

  try
  {
    var x = ( new Date() );
    echo( '\r\n' + x );
    echo( '\r\ngetOffset=' + x.getOffset( new Date( 0 ) ) );
    echo( '\r\ngetMonthDuration=' + x.getMonthDuration() );
    echo( '\r\ngetYearDuration=' + x.getYearDuration() );
    echo( '\r\nwithOffset=' + x.withOffset( 60000 ) );
    echo( '\r\nwithMonthOffset=' + x.withMonthOffset( -1 ) );
    echo( '\r\nwithYearOffset=' + x.withYearOffset( -1 ) );
    echo( '\r\nfloorYear=' + x.floorYear() );
    echo( '\r\nfloorMonth=' + x.floorMonth() );
    echo( '\r\nfloorDate=' + x.floorDate() );
    echo( '\r\nfloorHours=' + x.floorHours() );
    echo( '\r\nfloorMinutes=' + x.floorMinutes() );
    echo( '\r\nfloorSeconds=' + x.floorSeconds() );
  }
  catch( error )
  {
    echo( '\r\n' + error.description );
  }
}

window["application"] = 
{
  run: function()
  {
    echo[ "process" ] = document.createElement( "div" ); 
  	echo.process.style.cssText = "position:absolute;padding:4 10 8 10;margin:0;font-size:8;border-width:2;border-style:ridge;left:800px;top:50px;width:465px;height:400px;font-family:Consolas;font-size:10px;";
    document.body.appendChild( echo.process );
    echo( "Приложение запущено..." );
    echo( performance.now() );
    
    var tmp = document.createElement( "div" );
    tmp.innerText = "relayout";
    tmp.style.cssText = "display:block;position:absolute;background-color:red;left:10px;top:420px;width:100px;height:40px;text-align:center;vertical-align:middle;cursor:pointer;";
    tmp.onclick = window.onClickRelayout.reference( document, thePlot );
    document.body.appendChild( tmp );
    
    tmp = document.createElement( "div" );
    tmp.innerText = "data test";
    tmp.style.cssText = "display:block;position:absolute;background-color:green;left:120px;top:420px;width:100px;height:40px;text-align:center;vertical-align:middle;cursor:pointer;";
    tmp.onclick = window.onClickTest.reference( document );
    document.body.appendChild( tmp );
  } 
  
}
