$(function () {
  editarTabla();
  exportarToExcel();
});
//timeline-event timeline-event-range ui-widget ui-state-default texto
//timeline-axis-grid timeline-axis-grid-minor
var ExcelToJSON = function () {
  this.parseExcel = function (file) {
    var reader = new FileReader();

    reader.onload = function (e) {
      var data = e.target.result;
      var workbook = XLSX.read(data, {
        type: "binary",
      });
      workbook.SheetNames.forEach(function (sheetName) {
        var XL_row_object = XLSX.utils.sheet_to_row_object_array(
          workbook.Sheets[sheetName]
        );

        var Listado = JSON.parse(JSON.stringify(XL_row_object));

        var rows = $("#tblItems tbody");
        var mapHoraPuentes = [];
        var date = new Date();
        var anio = date.getFullYear();
        var mes = parseInt(date.getMonth());
        var dia = parseInt(date.getDate());
        var inicios = [];
        var finales = [];
        var vueloLlegadas = [];
        var posiciones = [];
        var vueloSalidas = [];
        var tiempo = [];
        var aerolineas = [];
        var horaLLegadas = [];
        var horasSalidas = [];
        var inicio = new Date();
        var final = new Date();
        var vueloLlegada = "";
        var posicion = 0;
        var vueloSalida = "";
        var sala = "";
        var salas = [];
        var origenes = [];
        var origen = "";
        var destino = "";
        var destinos = [];
        var banda = "";
        var bandas = [];

        for (i = 0; i < Listado.length; i++) {
          var columns = Object.values(Listado[i]);

          var Hllegada = Math.floor(columns[1] * 24);
          var minLlegada = Math.round(
            (columns[1] * 24 - Math.floor(columns[1] * 24)) * 60
          );

          if (isNaN(Hllegada)) {
            Hllegada = "0";
          }
          if (isNaN(minLlegada)) {
            minLlegada = "0";
          }

          if (Hllegada < 10) {
            Hllegada = "0" + Hllegada;
          }
          if (minLlegada < 10) {
            minLlegada = "0" + minLlegada;
          }
          //*************************** */
          var HSalida = Math.floor(columns[7] * 24);
          var minSalida = Math.round(
            (columns[7] * 24 - Math.floor(columns[7] * 24)) * 60
          );
          if (isNaN(HSalida)) {
            HSalida = "24";
          }
          if (isNaN(minSalida)) {
            minSalida = "0";
          }
          if (HSalida < 10) {
            HSalida = "0" + HSalida;
          }
          if (minSalida < 10) {
            minSalida = "0" + minSalida;
          }



          posicion = columns[5].toUpperCase();
          if (posicion.length > 2 || posicion == "HP" || posicion == "HELIPUNTO" ) {
            posicion = "7";
          } else {
            posicion = columns[5].substring(1, 2);
          }
          sala=posicion

          if (posicion==6) {
            sala=5
          } else if (posicion==7){
            sala=1
          }

          rows.append(`
                          <tr>
                              <td>${columns[0]}</td>
                              <td>${Hllegada}:${minLlegada}</td>
                              <td>${columns[2]}</td>
                              <td>${columns[3]}</td>
                              <td>${columns[4]}</td>
                              <td>${columns[5]}</td>
                              <td>${columns[6]}</td>
                              <td>${HSalida}:${minSalida}</td>
                              <td>${columns[8]}</td>
                              <td>${columns[9]}</td>
                              <td>${sala}</td>
                              <td>${columns[11]}</td>
                              <td>${columns[12]}</td>
                              

                          </tr>
                      `);

          var indice = i;
          inicio = new Date(anio, mes, dia, Hllegada, minLlegada);
          final = new Date(anio, mes, dia, HSalida, minSalida);

          mapHoraPuentes.push({
            puente: columns[5].substring(1, 2),
            horaFinalPuente: inicio,
            vueloPuente: columns[3].toString(),
          });

          var h = "";
          var m = "";
          if ((final - inicio) / 60000 > 59) {
            h = Math.trunc(Math.floor((final - inicio) / 60000) / 60);
            m = Math.round(Math.floor((final - inicio) / 60000)) - h * 60;

            tiempo.push(h + "h y " + m + "min");
          } else {
            tiempo.push((final - inicio) / 60000 + " min");
          }
          
          

          vueloLlegada = columns[3].toString();
          origen = columns[4].toString();
          destino = columns[9].toString();
          vueloSalida = columns[8].toString();
         // sala = columns[10].toString();
          banda = columns[11].toString();
          origenes.push(origen);
          destinos.push(destino);
          inicios.push(inicio);
          finales.push(final);
          vueloLlegadas.push(vueloLlegada);
          vueloSalidas.push(vueloSalida);
          posiciones.push(posicion);
          aerolineas.push(columns[2]);
          horaLLegadas.push(Hllegada + ":" + minLlegada);
          horasSalidas.push(HSalida + ":" + minSalida);
          salas.push(sala);
          bandas.push(banda);
        }
       
        contarPosiciones();
        contarAerolineas();
        drawVisualization(
          indice,
          inicios,
          finales,
          vueloLlegadas,
          vueloSalidas,
          posiciones,
          aerolineas,
          tiempo,
          horaLLegadas,
          horasSalidas,
          salas,
          bandas,
          mapHoraPuentes,
          origenes,
          destinos
        );
      });
    };
    reader.onerror = function (ex) {
      console.log(ex);
    };

    reader.readAsBinaryString(file);
  };
};

function handleFileSelect(evt) {
  var files = evt.target.files; // FileList object
  var xl2json = new ExcelToJSON();
  xl2json.parseExcel(files[0]);
}

document
  .getElementById("fileupload")
  .addEventListener("change", handleFileSelect, false);
//function drawVisualization(inicio, final, vueloLlegada, i, vueloSalida) {
function drawVisualization(
  indice,
  inicios,
  finales,
  vueloLlegadas,
  vueloSalidas,
  posiciones,
  aerolineas,
  tiempo,
  horaLLegadas,
  horasSalidas,
  salas,
  bandas,
  mapHoraPuentes,
  origenes,
  destinos
) {
  // Create and populate a data table.
  data = new google.visualization.DataTable();
  data.addColumn("datetime", "start");
  data.addColumn("datetime", "end");
  data.addColumn("string", "content");
  data.addColumn("string", "group");
  data.addColumn("string", "className");
  var puente = [
    "Puente 1",
    "Puente 2",
    "Puente 3",
    "Puente 4",
    "Puente 5",
    "Remota 6",
    "Helipunto",
  ];
  var diffHora = "";
var listaBandasError=[]
var plantilla=""
$("#bandasError").html("")
  //data.addRow(["", "", "texto", puente[6], "texto"]);
  for (let i = 0; i <= indice; i++) {
    var logo = "";
    if (aerolineas[i] == "AVA") {
      logo = "./img/aviancaLogo.png";
    }
    if (aerolineas[i] == "LATAM") {
      logo = "./img/latamLogo.png";
    }
    if (aerolineas[i] == "WIN") {
      logo = "./img/Wingo_Logo.jpg";
    }
    if (aerolineas[i] == "COPA" || aerolineas[i] == "CMP") {
      logo = "./img/copaLogo.png";
    }
    if (aerolineas[i] == "UAR") {
      logo = "./img/UltraLogo.png";
    }
    if (aerolineas[i] == "VVC") {
      logo = "./img/vivaLogo.jpg";
    }
    /*------------*/
    if (i >= 0) {
      for (let j = i; j < indice; j++) {
        if (j >= 0) {
          if (posiciones[i] == mapHoraPuentes[j + 1].puente) {
           
            diffHora =
              (mapHoraPuentes[j + 1].horaFinalPuente - finales[i]) / 60000;
            break;
          } else {
            diffHora = 0;
          }
        }
      }

      var h = "";
      var m = "";
      if (diffHora > 59) {
        h = Math.trunc(Math.floor(diffHora / 60));
        m = Math.round(Math.floor(diffHora)) - h * 60;

        diffHora = h + "h y " + m + "min";
      } else {
        diffHora = diffHora + " min";
      }
    }
   
 var clase=""
if (posiciones[i]!=1 &&  posiciones[i]!=2 && bandas[i]==3) {
  clase="parpadea"
  plantilla+=`<li>Vuelo:   ${vueloLlegadas[i]+", Posición: "+ posiciones[i]+", Banda: "+ bandas[i]}</li>`
  
} else {
  clase=""
  
}
    var texto =
      `<table >
<thead>
  <tr>
    <th ><img src='${logo}' style=' min-width: 132px; height:52px; vertical-align: middle'></th>
    <th style="text-overflow: clip;display:flex;  align-items: center;" class='dentroVuelo'>` +
      `${
        vueloLlegadas[i] +
        "-" +
        vueloSalidas[i] +
        " (" +
        origenes[i].toUpperCase() +
        "-" +
        destinos[i].toUpperCase() +
        ")"
      }` +
      `<br>(${horaLLegadas[i]}  - ${horasSalidas[i]})= ${tiempo[i] }
       |<br>  vuelo siguiente en ${diffHora}`+ 
       `
       
       </th>
       <th class='dentroVuelo ${clase}' style="color: blue; font-size: 15px;"> 
       sala:  &nbsp &nbsp ${salas[i]} <br> 
       banda: ${bandas[i]} &nbsp </th>


    </tr>
</thead>
<tbody >


</tbody>
</table>`;
    data.addRow([
      inicios[i],
      finales[i],
      texto,
      puente[posiciones[i] - 1],
      "texto",
    ]);
  }
  $("#bandasError").append(plantilla)

  var options = {
    width: "100%",
    height: "65%",
    layout: "box",
    axisOnTop: true,
    eventMargin: 2, // minimal margin between events
    eventMarginAxis: 0, // minimal margin beteen events and the axis
    editable: true,
    showNavigation: true,
  };

  // Instantiate our timeline object.
  timeline = new links.Timeline(document.getElementById("mytimeline"), options);

  // register event listeners
  // google.visualization.events.addListener(timeline, 'edit', onEdit);

  // Draw our timeline with the created data and options
  timeline.draw(data);
  // moveToCurrentTime()
  // Set a customized visible range
  var now = new Date();
  var start = new Date(now.getTime() - 8 * 60 * 60 * 1000);
  var end = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  //
  timeline.setVisibleChartRange(start, end);
}
var timeline = undefined;
var data = undefined;
google.load("visualization", "1");

// Set callback to run when API is loaded
google.setOnLoadCallback(drawVisualization);
function getSelectedRow() {
  var row = undefined;
  var sel = timeline.getSelection();
  if (sel.length) {
    if (sel[0].row != undefined) {
      row = sel[0].row;
    }
  }
  return row;
}

function strip(html) {
  var tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText;
}
function moveToCurrentTime() {
  timeline.setVisibleChartRangeNow();
}

function editarTabla() {
  $("#btnGuardarEdicion").on("click", function (e) {
    e.preventDefault();
    var id = $("#idFila").val();

    $("#tablaDatos tr")
      .find("td:eq(0)")
      .each(function () {
        trDelResultado = $(this).parent();
        var fila = $(this).html();
        if (id == fila) {
          var vueloLlegada = $("#vueloLlegada").val();
          var vueloSalida = $("#vueloSalida").val();
          var horaLlegada = $("#horaLlegada").val();
          var horaSalida = $("#horaSalida").val();
          var sala = $("#sala").val();
          var banda = $("#banda").val();
          var destino = $("#destino").val();
          var origen = $("#origen").val();
          var posicion = $("#posicion").val();
          trDelResultado.find("td:eq(3)").html(vueloLlegada);
          trDelResultado.find("td:eq(8)").html(vueloSalida);
          trDelResultado.find("td:eq(1)").html(horaLlegada);
          trDelResultado.find("td:eq(7)").html(horaSalida);
          trDelResultado.find("td:eq(5)").html(posicion);
          trDelResultado.find("td:eq(10)").html(sala);
          trDelResultado.find("td:eq(11)").html(banda);
          trDelResultado.find("td:eq(4)").html(origen);
          trDelResultado.find("td:eq(9)").html(destino);
          $("#modalVuelos").modal("hide");
        }
      });
  });
}

function tableToJSON() {
  var map = [];
  $("#tablaDatos tr") 
    .find("td:eq(0)")
    .each(function () {
      trDelResultado = $(this).parent();
      //ya que tenemos el tr seleccionado ahora podemos navegar a las otras celdas con find
      vueloLlegada = trDelResultado.find("td:eq(3)").html();
      aerolinea = trDelResultado.find("td:eq(2)").html();
      vueloSalida = trDelResultado.find("td:eq(8)").html();
      horaLlegada = trDelResultado.find("td:eq(1)").html();
      horaSalida = trDelResultado.find("td:eq(7)").html();
      posicion = trDelResultado.find("td:eq(5)").html();
      sala = trDelResultado.find("td:eq(10)").html();
      banda = trDelResultado.find("td:eq(11)").html();
      origen = trDelResultado.find("td:eq(4)").html();
      destino = trDelResultado.find("td:eq(9)").html();
      idFila = trDelResultado.find("td:eq(0)").html();
      servicio = trDelResultado.find("td:eq(12)").html();
      tipoAvion = trDelResultado.find("td:eq(6)").html();

      map.push({
        Nº: idFila,
        ETA: horaLlegada,
        COMPAÑÍA: aerolinea,
        VUELO_LLEGADA: vueloLlegada,
        ORIGEN: origen,
        POSICION: posicion,
        "TIPO DE AERONAVE": tipoAvion,
        ETD: horaSalida,
        VUELO_SALIDA: vueloSalida,
        DESTINO: destino,
        SALA: sala,
        BANDA: banda,
        "SERVICIO DE TP": servicio,
      });
    });
  var mapHoraPuentes = [];
  var date = new Date();
  var anio = date.getFullYear();
  var mes = parseInt(date.getMonth());
  var dia = parseInt(date.getDate());
  var inicios = [];
  var finales = [];
  var vueloLlegadas = [];
  var posiciones = [];
  var vueloSalidas = [];
  var tiempo = [];
  var aerolineas = [];
  var horaLLegadas = [];
  var horasSalidas = [];
  var inicio = new Date();
  var final = new Date();
  var vueloLlegada = "";
  var posicion = 0;
  var vueloSalida = "";
  var sala = "";
  var salas = [];
  var banda = "";
  var bandas = [];
  var origenes = [];

  var destinos = [];

  for (let i = 0; i < map.length; i++) {
    var Hllegada = map[i].ETA.substring(0, 2);
    var minLlegada = map[i].ETA.substring(3, 5);
    var HSalida = map[i].ETD.substring(0, 2);
    var minSalida = map[i].ETD.substring(3, 5);

    if (isNaN(Hllegada)) {
      Hllegada = "0";
    }
    if (isNaN(minLlegada)) {
      minLlegada = "0";
    }

    //*************************** */

    if (isNaN(HSalida)) {
      HSalida = "24";
    }
    if (isNaN(minSalida)) {
      minSalida = "0";
    }

    var indice = i;

    inicio = new Date(anio, mes, dia, Hllegada, minLlegada);
    final = new Date(anio, mes, dia, HSalida, minSalida);

    mapHoraPuentes.push({
      puente: map[i].POSICION.substring(1, 2),
      horaFinalPuente: inicio,
      vueloPuente: map[i].VUELO_LLEGADA,
    });

    var h = "";
    var m = "";

    if ((final - inicio) / 60000 > 59) {
      h = Math.trunc(Math.floor((final - inicio) / 60000) / 60);
      m = Math.round(Math.floor((final - inicio) / 60000)) - h * 60;

      tiempo.push(h + "h y " + m + "min");
    } else {
      tiempo.push((final - inicio) / 60000 + " min");
    }

    posicion = map[i].POSICION.toUpperCase();

    if (posicion == "HP" || posicion == "HELIPUNTO") {
      posicion = "7";
    
    } else {
      posicion = map[i].POSICION.substring(1, 2);
    }


    sala=posicion

    if (posicion==6) {
      sala=5
    } else if (posicion==7){
      sala=1
    }



    vueloLlegada = map[i].VUELO_LLEGADA;

    vueloSalida = map[i].VUELO_SALIDA;
    //sala = map[i].SALA;
    banda = map[i].BANDA;
    origenes.push(map[i].ORIGEN);
    destinos.push(map[i].DESTINO);
    inicios.push(inicio);
    finales.push(final);
    vueloLlegadas.push(vueloLlegada);
    vueloSalidas.push(vueloSalida);
    posiciones.push(posicion);
    aerolineas.push(map[i].COMPAÑÍA);
    horaLLegadas.push(Hllegada + ":" + minLlegada);
    horasSalidas.push(HSalida + ":" + minSalida);
    salas.push(sala);
    bandas.push(banda);
  }
  contarPosiciones();
  contarAerolineas();
  drawVisualization(
    indice,
    inicios,
    finales,
    vueloLlegadas,
    vueloSalidas,
    posiciones,
    aerolineas,
    tiempo,
    horaLLegadas,
    horasSalidas,
    salas,
    bandas,
    mapHoraPuentes,
    origenes,
    destinos
  );
  // var interval = localStorage.getItem("interval");
  // console.log("interval: " +interval)
  //})timeline.zoom(parseFloat(0.4+interval))
}
function exportarToExcel() {
  $("#btnExportar").click(function (e) {
    $("#tablaDatos").table2excel({
      exclude: ".excludeThisClass",
      name: $("#tablaDatos").data("tableName"),
      filename: "JorgeMelendez.xls",
    });
  });
}
function contarPosiciones() {
  var sumP1 = 0;
  var sumP2 = 0;
  var sumP3 = 0;
  var sumP4 = 0;
  var sumP5 = 0;
  var sumR6 = 0;
  var sumHP = 0;

  $("#tablaDatos tr")
    .find("td:eq(0)")
    .each(function () {
      trDelResultado = $(this).parent();
      //ya que tenemos el tr seleccionado ahora podemos navegar a las otras celdas con find
      posicion = trDelResultado.find("td:eq(5)").html().toUpperCase();

      switch (posicion) {
        case "P1": {
          sumP1 = sumP1 + 1;
          break;
        }
        case "P2": {
          sumP2 = sumP2 + 1;
          break;
        }
        case "P3": {
          sumP3 = sumP3 + 1;
          break;
        }
        case "P4": {
          sumP4 = sumP4 + 1;
          break;
        }
        case "P5": {
          sumP5 = sumP5 + 1;
          break;
        }
        case "R6": {
          sumR6 = sumR6 + 1;
          break;
        }
        case "HP": {
          sumHP = sumHP + 1;
          break;
        }
        case "HELIPUNTO": {
          sumHP = sumHP + 1;
          break;
        }
      }
    });
  //Llenar tabla
  $("#Nvuelos tr")
    .find("td:eq(0)")
    .each(function () {
      trDelFila = $(this).parent();
      trDelFila.find("td:eq(0)").html(sumP1);
      trDelFila.find("td:eq(1)").html(sumP2);
      trDelFila.find("td:eq(2)").html(sumP3);
      trDelFila.find("td:eq(3)").html(sumP4);
      trDelFila.find("td:eq(4)").html(sumP5);
      trDelFila.find("td:eq(5)").html(sumR6);
      trDelFila.find("td:eq(6)").html(sumHP);
    });
}

function contarAerolineas() {
  var ava = 0;
  var vvv = 0;
  var lan = 0;
  var win = 0;
  var ult = 0;
  var copa = 0;

  $("#tablaDatos tr")
    .find("td:eq(0)")
    .each(function () {
      var fila = $(this).parent();
      var aerolinea = fila.find("td:eq(2)").html().toUpperCase();

      switch (aerolinea) {
        case "AVA": {
          ava = ava + 1;
          break;
        }
        case "VVC": {
          vvv = vvv + 1;
          break;
        }
        case "LATAM": {
          lan = lan + 1;
          break;
        }
        case "WIN": {
          win = win + 1;
          break;
        }
        case "UAR": {
          ult = ult + 1;
          break;
        }
        case "CMP": {
          copa = copa + 1;
          break;
        }
      }
    });

  $("#tablaAerolineas tr")
    .find("td:eq(0)")
    .each(function (index, tr) {
      var filaAer = $(this).parent();

      var aerolinea = "0";
      if (index == 0) {
        aerolinea = ava;
      } else if (index == 1) {
        aerolinea = lan;
      } else if (index == 2) {
        aerolinea = vvv;
      } else if (index == 3) {
        aerolinea = ult;
      } else if (index == 4) {
        aerolinea = win;
      } else if (index == 5) {
        aerolinea = copa;
      }
      filaAer.find("td:eq(1)").html(aerolinea);
    });
  const suma = ava + win + lan + ult + copa + vvv;
  $("#cantidadVuelos tr").find("td:eq(0)").parent().find("td:eq(0)").html(suma);
}
