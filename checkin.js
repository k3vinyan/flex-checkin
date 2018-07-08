$( document ).ready(function(){

  const rosterNode = document.getElementById('cspDATable');

  const buttonPlacement = $('#cspRoasterView');
  let today = new Date();
  let todayFormat = (today.getMonth()+1).toString() + "." + (today.getDay().toString()) + "." + (today.getFullYear().toString());

  buttonPlacement.before(
    optionButton("createCheckinButton", "Create Checkin List", "#FFFFFF", "#4c988c", "5px")
  );
  buttonPlacement.before(
    optionButton("unplannedButton", "DL Unplanned", "#FFFFFF", "#6ddac8", "5px")
  );


  $('#createCheckinButton').on("click", function(){
    let roster = getRosterData();
    let allDrivers = ajaxRequest(roster, createTable);
  })
  // work in process!!!!!
  // var observer = new MutationObserver(function(mutations) {
  //     mutations.forEach(function(mutation) {
  //         console.log(mutation.type);
  //         let roster = getRosterData();
  //         let allDrivers = ajaxRequest(roster, createTable);
  //         //let sortedRoster = sortArray(roster);
  //     });
  // });

  // // configuration of the observer:
  // var config = { attributes: true, childList: true, characterData: true }
  //
  // // pass in the target node, as well as the observer options
  // observer.observe(rosterNode, config);

  //scrape and return Roster
  function getRosterData(){
    driversArray = []

    let node = $('body');
    let roster = $(node).find('#cspDATable > tbody')[1].children;

    for(let i = 0; i < roster.length; i++){
      let driver = $(roster[i], 'tr')[0].children;
      let driverId = $(driver[0]).text();
      let driverName = $(driver[1]).text();
      let driverCurrentStatus = $(driver[2]).text();
      let driverBlockTime = $(driver[4]).text();
      let driverStartTime = $(driver[5]).text();
      let driverEndTime = $(driver[6]).text();
      let shiftLength = $(driver[4]).text()

      driversArray.push({'id': driverId, 'name':driverName, 'blockTime': driverBlockTime, 'shiftLength': shiftLength, 'startTime': driverStartTime, 'endTime': driverEndTime, 'isNoShow':  undefined, 'isCheckin': undefined, 'isCheckout': undefined, 'checkinTime': null});
    }
    return driversArray;
  }


  function createTable(data){
    $('#cspRoasterViewHeader').append("<br></br>")
    var header = "<tr><th><h1>Start Time</h1></th><th><h1>Name</h1></th><th><h1>Checkin</h1></th><th><h1>No Show</h1></th></tr>"
    let currentStartTime;
    let checkin = "";
    let noShow = "";
    let rowStyle = ""

    for(let i = 0; i < data.length; i++){

      if(data[i].fields.isCheckin){
        checkin = " checked";
        noShow = " disabled";
      } else {
        checkin = ""
        noShow = ""
      }

      if(i%2==0){
        rowStyle = "even";
      } else {
        rowStyle = "odd";
      }

      if(data[i].fields.isNoShow){
        checkin = " disabled";
        noShow = " checked";
      }

      if(currentStartTime === undefined){
        currentStartTime = data[i].fields.startTime;
      } else if(currentStartTime != undefined && currentStartTime != data[i].fields.startTime){

        $('#cspRoasterViewHeader').append("<table class='rosterTable'>" + header + "</table>");
        header = "<tr><th><h1>Start Time</h1></th><th><h1>Name</h1></th><th><h1>Checkin</h1></th><th><h1>No Show</h1></th></tr>"
        currentStartTime = data[i].fields.startTime;
      }
      let temp = (data[i].fields.startTime).split(" ");
      let time = temp[0];
      let period = temp[1];
      header += "<tr class=" + rowStyle + ">" +
        "<td>" + data[i].fields.startTime + "</td>" +
        "<td>" + data[i].fields.fullName + "</td>" +
        "<td><input type='checkbox' class='checkinBox' id=" + data[i].fields.DPID + checkin + " data-startTime=" +  time + " data-period=" + period + " ></td>" +
        "<td><input type='checkbox' class='noShowBox' id=" +  data[i].fields.DPID +  noShow + " data-startTime=" +  time + " data-period=" + period + " ></td>" +
        "</tr>"

      if(i == data.length - 1){
        $('#cspRoasterViewHeader').append("<table class='rosterTable'>" + header + "</table>");
        header = "<tr><th><h1>Start Time</h1></th><th><h1>Name</h1></th><th><h1>Checkin</h1></th><th><h1>No Show</h1></th></tr>"
        currentStartTime = data[i].fields.startTime;
      }
    }
    addStyle();
    onRosterLoad();
  }

  function addStyle(){
    $('.rosterTable').css("border-style", "solid");
    $('.rosterTable').css("display", "inline-block");
    $('.rosterTable').css("vertical-align", "top");
    $('.rosterTable').css("margin", "5px");

    //$('.even').css("background-color", "#d2cedb");
    $('tr').css("text-align", "center");
    $('table.rosterTable').css("font-weight", "bold");
    $('.table.rosterTable').css("font-size", "20px");
    $('.table.rosterTable').css("font-family", "Verdana");
    $('tr:nth-child(even)').css("background-color", "#f2f2f2");
    $('h1').css("color", "black");
  }

  //sort array by starting time
  function sortArray(arr){

    const array = arr;
    let startTime;
    let endTime;
    let sortArray = [];
    let result = [];

    for(let i = 0; i < array.length; i++){
      if(startTime == undefined){
        startTime = array[i]['startTime'];
      }
      if(startTime == array[i]['startTime']){
        sortArray.push(array[i])
      } else{
        startTime = array[i]['startTime'];

        sortArray.sort(function(a,b){
          let nameA = a.name.toLowerCase();
          let nameB = b.name.toLowerCase();

          if(nameA < nameB){
            return -1;
          }
          if(nameA > nameB){
            return 1;
          }
            return 0;
          })

          for(let i = 0; i < sortArray.length; i++){
            result.push(sortArray[i]);
          }

         sortArray = [];
         sortArray.push(driversArray[i])
       }
     }
    return result;
   }


   function ajaxRequest(roster, callback){
     $.ajax({
       type: "POST",
       url: "http://localhost:9000/checkin",
       data: JSON.stringify(roster),
       success: function(data){
         console.log("request successful!");
         callback(JSON.parse(data));
       },
       error: function(data){
         console.log("An error has occurred.  Please check if server is on....")
       }
     });
   }

  function updateCheckin(t, b, i, s, p){
    const value = {type: t, boolean: b, id: i, startTime: s, period: p}
    $.ajax({
      type: "POST",
      url: "http://localhost:9000/checkin/updateCheckin",
      data: JSON.stringify(value),
      success: function(data){
        console.log("update successful")
      },
      error: function(data){
         console.log("An error has occurred.  Please check if server is on....")
      }
    })
  }


  function onRosterLoad(){
    $('.checkinBox').change(function(){
      const bool = $(this).is(":checked");
      const id = $(this).attr('id');
      const startTime = $(this).attr("data-startTime");
      const period = $(this).attr("data-period");
      updateCheckin('checkin', bool, id, startTime, period);
    });

    $('.noShowBox').change(function(){
      const bool = $(this).is(":checked");
      const id = $(this).attr('id');
      const startTime = $(this).attr("data-startTime");
      const period = $(this).attr("data-period");
      updateCheckin('noShow', bool, id, startTime, period);
    });
  }

  let blockArray = [];
  let shiftArray = [];
  let requestArray = [];
  let acceptedArray = [];
  let unplannedArray = [];
  let actualArray = [];
  let bridgeArray = [];



  $('#unplannedButton').on('click', function(){
    const time = prompt("Start Time?", "17:00")
    $.ajax({
      type: "POST",
      url: "http://localhost:9000/checkin/unplannedRoute",
      data: JSON.stringify({'time': time}),
      success: function(data){
        console.log(data);
        const headers = ['Block Time', 'Shift Length', 'Request', 'Accepted', 'Actual', 'Unplanned Routes', 'Bridge'];
        const drivers = data;
        const counter = data.counter;
        for(let i = 1; i < counter; i++){
          blockArray.push(data[i].blockTime);
          requestArray.push("");
          unplannedArray.push("");
          bridgeArray.push("");
          shiftArray.push(data[i].shiftLength);
          acceptedArray.push(data[i].accepted);
          actualArray.push(data[i].isCheckin);
        }
        let allArray = [blockArray, shiftArray, requestArray, acceptedArray, actualArray, unplannedArray, bridgeArray]
        let newExcel = createExcel(headers);
        insertDataToExcel("Unplanned Route Report", newExcel, allArray);

        //reset array
        blockArray = [];
        shiftArray = [];
        requestArray = [];
        acceptedArray = [];
        unplannedArray = [];
        actualArray = [];
        bridgeArray = [];
      },
      error: function(data){
        console.log("An error has occurred.  Please check if server is on....")
      }
    })
  })

  //create excel template

const headers = ['Block Time', 'Shift Length', 'Request', 'Accepted', 'Actual', 'Unplanned Routes', 'Bridge']

function createExcel(headers){

  const excel = $JExcel.new();
  excel.set(0,5,undefined,100);
  excel.set(0, 0, 0, "Unplanned Routes Report");
  excel.set(0, 0, 1, "Date: " + todayDate());
  const formatHeader = excel.addStyle({border: "thin,thin,thin,thin #551A8B", font: "Calibri Light 12 #FFFFFF B", fill: "#000000", align: "C C"});

  for(let i = 0; i < headers.length; i++){
    excel.set(0, i, 2, headers[i], formatHeader);
    excel.set(0, i, undefined, "auto");
    }
    return excel;
}

//insert data into excel file, must create template first
function insertDataToExcel(name, excel, arrays){
  console.log(arrays)
  let e = excel;
  let lastRow;
  for(let i = 3; i < arrays.length + 3; i++){
    for(let j = 3; j < arrays[i - 3].length + 3; j++){
      lastRow = j;
      if(i === 3 || i === 4){
        e.set(0, i -3, j, arrays[i-3][j - 3], excel.addStyle( {align: " C C", fill: "#D8E0F2", border: "thin, thin, thin, thin #551A8B" }))
      } else {
        e.set(0, i - 3, j, arrays[i - 3][j - 3], excel.addStyle( {align:"C C", border: "thin, thin, thin, thin #551A8B" }));
      }
    }
  }
  lastRow += 1;
  e.set(0, 0, lastRow, "Total", excel.addStyle( {font: "Calibri Light 12 #FFFFFF B", fill: "#000000"}));
  e.set(0, 1, lastRow, " ", excel.addStyle( { fill: "#000000"}));
  e.set(0, 2, lastRow, "=C4 + C" + lastRow, excel.addStyle( {font: "Calibri Light 12 #FFFFFF B", fill: "#000000", align: "C C"} ));
  e.set(0, 3, lastRow, arrays[3].reduce((a, b) => a + b, 0), excel.addStyle( {font: "Calibri Light 12 #FFFFFF B", fill: "#000000", align: "C C"} ));
  e.set(0, 4, lastRow, arrays[4].reduce((a, b) => a + b, 0), excel.addStyle( {font: "Calibri Light 12 #FFFFFF B", fill: "#000000", align: "C C"} ));
  e.set(0, 5, lastRow, "=F4 + F" + lastRow, excel.addStyle( {font: "Calibri Light 12 #FFFFFF B", fill: "#000000", align: "C C"} ));
  e.set(0, 6, lastRow, "  ", excel.addStyle( { fill: "#000000"}));
  e.generate(name + " " + todayFormat + ".xlsx");
}

  function optionButton(id, value, color, bgColor, padding){
   var id = id;
   var value = value;
   var color = color;
   var bgColor = bgColor;
   var padding = padding;
   var string;

   string = "<input id='" + id + "' type='button' value='" + value +
     "' style='" +"color: " + color + "; " + "background-color:" + bgColor +
     "; " + "padding: " + padding + "; border-style: none;'></button>";

  return string;
   };

   function todayDate(){
     let today = new Date();
     let dd = today.getDate();
     let mm = today.getMonth()+1; //January is 0!
     let yyyy = today.getFullYear();

     if(dd<10) {
       dd = '0'+dd
     }

     if(mm<10) {
       mm = '0'+mm
     }

     today = mm + '/' + dd + '/' + yyyy;
     return today;
   }

});
