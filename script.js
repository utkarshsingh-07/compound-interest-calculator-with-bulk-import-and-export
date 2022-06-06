document.getElementById("btn-csv").disabled = true;
let calculateBtn = document.getElementById("calculate-btn");
let result = document.getElementById("result");
let p = [];
let r = [];
let t = [];
let ci = [];
let amount = [];
let calculate = () => {
  p = Number(document.getElementById("principle").value);
  r = Number(document.getElementById("rate").value);
  t = Number(document.getElementById("time").value);
  let n = 1;
  let percent = r / 100;
  amount = p * (1 + percent / n) ** (n * t);
  ci = amount - p;
  result.innerHTML = `<div style = "margin-left: 100px;"><h3>RESULT</h3><div>Principle Amount: <span id="p">${p.toFixed(
    2
  )}</span></div>
  <div>Total Interest: <span id="r">${ci.toFixed(2)}</span></div>
  <div>Total Amount: <span id="t">${amount.toFixed(2)}</span></div></div>`;
};

calculateBtn.addEventListener("click", calculate);
window.addEventListener("load", calculate);
function ClearFields() {
  document.getElementById("principle").value = "";
  document.getElementById("rate").value = "";
  document.getElementById("time").value = "";
  document.getElementById("p").innerHTML = "";
  document.getElementById("r").innerHTML = "";
  document.getElementById("t").innerHTML = "";
}

//------------------------------------------------import xlsx -------------------------------------------
const fileData = [];
$("#submit").on("click", function (e) {
  e.preventDefault();

  $("#files").parse({
    config: {
      delimiter: "auto",
      complete: GenerateTable,
    },

    before: function (file, inputElem) {
      //console.log("Parsing file...", file);
    },
    error: function (err, file) {
      //console.log("ERROR:", err, file);
    },
    complete: function () {
      //console.log("Done with all files");
    },
  });
});

function GenerateTable(results) {
  var markup = "<table class='table'>";
  var data = results.data;

  for (i = 0; i < data.length; i++) {
    markup += "<tr>";
    var row = data[i];
    var cells = row.join(",").split(",");

    for (j = 0; j < cells.length; j++) {
      markup += "<td>";
      markup += cells[j];
      markup += "</th>";
    }
    markup += "</tr>";
  }
  markup += "</table>";
  $("#myTable").html(markup);
}

var ExcelToJSON = function () {
  this.parseExcel = function (file) {
    var reader = new FileReader();

    reader.onload = function (e) {
      var data = e.target.result;
      var workbook = XLSX.read(data, {
        type: "binary",
      });
      const first_worksheet = [workbook.Sheets[workbook.SheetNames[0]]];
      first_worksheet.forEach(function () {
        var XL_row_object = XLSX.utils.sheet_to_row_object_array(
          workbook.Sheets["Sample Data"]
        );

        var productList = JSON.parse(JSON.stringify(XL_row_object));

        var rows = $("#tblItems tbody");

        for (i = 0; i < productList.length; i++) {
          var columns = Object.values(productList[i]);
          rows.append(`
                        <tr>
                            <td>${columns[0]}</td>
                            <td>${columns[1]}</td>
                            <td>${columns[2]}</td>
                        </tr>
                    `);
          let n = 1;
          let principle = [];
          principle.push(columns[0]);
          let rate = [];
          rate.push(columns[1]);
          let rate1 = [rate / 100];
          let time = [];
          time.push(columns[2]);
          let totalAmount = [];
          if (
            principle != " " &&
            principle != null &&
            rate != " " &&
            rate != null &&
            time != " " &&
            time != null
          ) {
            totalAmount = (principle * (1 + rate1 / n) ** (n * time)).toFixed(
              2
            );
            let CompoundInterest = [];
            CompoundInterest = (totalAmount - principle).toFixed(2);

            fileData.push({
              principle,
              rate,
              time,
              CompoundInterest,
              totalAmount,
            });
            console.log(fileData);
          }
        }
      });
      document.getElementById("btn-csv").disabled = false;
      alert("Your export file is ready");
    };
    reader.onerror = function (ex) {
      //console.log(ex);
    };

    reader.readAsBinaryString(file);
  };
};

function clearContent() {
  document.getElementById("fileupload").value = "";
}

function handleFileSelect(evt) {
  var files = evt.target.files; // FileList object
  var xl2json = new ExcelToJSON();
  xl2json.parseExcel(files[0]);
}

document
  .getElementById("fileupload")
  .addEventListener("change", handleFileSelect, false);

//--------------------------------------------------export csv --------------------------------------
function renameKeys(arrayObject, newKeys, index = false) {
  let newArray = [];
  arrayObject.forEach((obj, item) => {
    const keyValues = Object.keys(obj).map((key, i) => {
      return { [newKeys[i] || key]: obj[key] };
    });
    let id = index ? { ID: item } : {};
    newArray.push(Object.assign(id, ...keyValues));
  });
  return newArray;
}
function convertArrayOfObjectsToCSV(args) {
  var result, ctr, keys, columnDelimiter, lineDelimiter, data;

  data = args.data || null;
  if (data == null || !data.length) {
    return null;
  }

  columnDelimiter = args.columnDelimiter || ",";
  lineDelimiter = args.lineDelimiter || "\n";

  keys = Object.keys(data[0]);
  ke = keys.splice(0, 0);
  ke.push(
    "Principle Amount",
    "Annual Rate",
    "Time(In Years)",
    "Compound Interest",
    "Total Amount"
  );
  //console.log(ke)

  result = "";
  result += ke.join(columnDelimiter);
  result += lineDelimiter;

  data.forEach(function (item) {
    ctr = 0;
    keys.forEach(function (key) {
      if (ctr > 0) result += columnDelimiter;

      result += item[key];
      ctr++;
    });
    result += lineDelimiter;
  });

  return result;
}

function downloadCSV(args) {
  var data, filename, link;
  var csv = convertArrayOfObjectsToCSV({
    data: fileData,
  });
  if (csv == null) return;

  filename = args.filename || "export.csv";

  if (!csv.match(/^data:text\/csv/i)) {
    csv = "data:text/csv;charset=utf-8," + csv;
  }
  data = encodeURI(csv);

  link = document.createElement("a");
  link.setAttribute("href", data);
  link.setAttribute("download", filename);
  link.click();
}
