const {google}  = require("googleapis");
const {OAuth2Client} = require('google-auth-library');


// Google spreadSheet helper class 
var SheetsHelper = function(accessToken) {
    var auth = new OAuth2Client();
    auth.credentials = {
      access_token: accessToken
    };
    this.service = google.sheets({version: 'v4', auth: auth});
};
  
module.exports = SheetsHelper;


// To create new Sheet  
SheetsHelper.prototype.createSpreadsheet = async function(title, callback) {
    var self = this;

    var request = {
      resource: {
        properties: {
          title: title
        },
        sheets: [
          {
            properties: {
              title: 'Council_Members',
              gridProperties: {
                columnCount: 4,
                frozenRowCount: 1
              }
            }
          },
          {
            properties: {
              title: 'Society_Members',
              gridProperties: {
                columnCount: 2,
                frozenRowCount: 1
              }
            }
          },
          {
            properties: {
              title: 'Faculty',
              gridProperties: {
                columnCount: 3,
                frozenRowCount: 1
              }
            }
          }
          
        ]
      }
    };

    await self.service.spreadsheets.create(request, async function(err, response) {
        if (err) {
          return callback(err);
        }
        var spreadsheet = response.data;
        // Add header rows.
        console.log("Sheets ==> " , spreadsheet.sheets);
        let requestArray = [];
        let data1 = buildHeaderRowRequest(spreadsheet.sheets[0].properties.sheetId , "Council_Members");
        let data2 = buildHeaderRowRequest(spreadsheet.sheets[1].properties.sheetId , "Normal_Members");
        let data3 = buildHeaderRowRequest(spreadsheet.sheets[2].properties.sheetId , "Faculty_And_Chairperson");
        requestArray.push(data1);
        requestArray.push(data2);
        requestArray.push(data3);
        // let requestArray = spreadsheet.sheets.map((sheet , i) => {
        //      return buildHeaderRowRequest(sheet.properties.sheetId , i)
        // });
        var requests = requestArray;
    
        var request = {
          spreadsheetId: spreadsheet.spreadsheetId,
          resource: {
            requests: requests
          }
        };

        await self.service.spreadsheets.batchUpdate(request, async function(err, response) {
          if (err) {
            return callback(err);
          }

          // console.log(JSON.stringify(response, null, 2));
          return callback(null, spreadsheet);
        });
    });
};


var COLUMNS_OF_COUNCIL_MEMBERS = [
    { field: 'email', header: 'Email' },
    { field: 'name', header: 'Name'},
    { field: 'role', header: 'Role' },
    { field: 'specificrole', header: 'Specific Role' }
];

var COLUMNS_OF_NORMAL_MEMBERS = [
  { field: 'email', header: 'Email' },
  { field: 'name', header: 'Name'}
];

var COLUMNS_OF_FACULTY_AND_CHAIRPERSON_MEMBERS = [
  { field: 'email', header: 'Email' },
  { field: 'name', header: 'Name'},
  { field: 'role', header: 'Role' }
];



function buildHeaderRowRequest(sheetId , memberType) {
    let dataarr = []; 
    if(memberType === "Council_Members"){
       dataarr = COLUMNS_OF_COUNCIL_MEMBERS;
    }

    if(memberType === "Normal_Members"){
       dataarr = COLUMNS_OF_NORMAL_MEMBERS;
    }

    if(memberType === "Faculty_And_Chairperson"){
      dataarr = COLUMNS_OF_FACULTY_AND_CHAIRPERSON_MEMBERS;
    }
  
    var cells = dataarr.map(function(column) {
      return {
        userEnteredValue: {
          stringValue: column.header
        },
        userEnteredFormat: {
          textFormat: {
            bold: true
          }
        }
      }
    });

    return {
      updateCells: {
        start: {
          sheetId: sheetId,
          rowIndex: 0,
          columnIndex: 0
        },
        rows: [
          {
            values: cells
          }
        ],
        fields: 'userEnteredValue , userEnteredFormat.textFormat.bold'
      }
    };
}


SheetsHelper.prototype.sync = function(spreadsheetId, sheetId, members, memberType,  callback) {
    var requests = [];
    // Resize the sheet.
    requests.push({
      updateSheetProperties: {
        properties: {
          sheetId: sheetId,
          gridProperties: {
            rowCount: members.length + 1,
            columnCount: memberType === "council_member" ? COLUMNS_OF_COUNCIL_MEMBERS.length : (
              memberType === "normal_member" ? COLUMNS_OF_NORMAL_MEMBERS.length : COLUMNS_OF_FACULTY_AND_CHAIRPERSON_MEMBERS.length
            )
          }
        },
        fields: 'gridProperties(rowCount,columnCount)'
      }
    });
    // Set the cell values.
    requests.push({
      updateCells: {
        start: {
          sheetId: sheetId,
          rowIndex: 1,
          columnIndex: 0
        },
        rows: buildRowsForOrders(members , memberType),
        fields: '*'
      }
    });
    // Send the batchUpdate request.
    var request = {
      spreadsheetId: spreadsheetId,
      resource: {
        requests: requests
      }
    };
    this.service.spreadsheets.batchUpdate(request, function(err) {
      if (err) {
        return callback(err);
      }
      return callback();
    });
};


SheetsHelper.prototype.getAllData = async function(spreadsheetId , datasheet , callback){
      let sheetfrom = "";
      if(datasheet === "council_member"){
         sheetfrom = "Council_Members!A:D";
      }else if(datasheet === "normal_member"){
         sheetfrom = "Society_Members!A:B";
      }else{
        sheetfrom = "Faculty!A:C";
      }


      const request = {
          // The spreadsheet to request.
          spreadsheetId: spreadsheetId,  // TODO: Update placeholder value.

          // The ranges to retrieve from the spreadsheet.
          range: sheetfrom,  
          majorDimension : "rows",
          valueRenderOption : "FORMATTED_VALUE"
      };

      try {
          const response = (await this.service.spreadsheets.values.get(request)).data;
          // TODO: Change code below to process the `response` object:\
          // console.log(response);
          // console.log("Got data from spreadsheet ====> " , JSON.stringify(response, null, 2));
          callback(null , response);
      } catch (err) {
          console.error(err);
          callback(err , null);
      }
}



SheetsHelper.prototype.getDimentions = async function(spreadsheetId , callback){
  const request = {
      // The spreadsheet to request.
      spreadsheetId: spreadsheetId,  // TODO: Update placeholder value.

      // The ranges to retrieve from the spreadsheet.
      fields: 'sheets.properties',  
  };

  try {
      const response = (await this.service.spreadsheets.get(request)).data;
      // TODO: Change code below to process the `response` object:\
      // console.log(response);
      // console.log("Got data from spreadsheet ====> " , JSON.stringify(response, null, 2));
      callback(null , response);
  } catch (err) {
      console.error(err);
      callback(err , null);
  }
}


function buildRowsForOrders(members ,  memberType) {
    return members.map(function(member) {
      let cells = [];
      if(memberType === "council_member"){
        cells = COLUMNS_OF_COUNCIL_MEMBERS.map(function(column) {
          switch (column.field) {
            case 'email':
              return {
                userEnteredValue: {
                  stringValue: member.email
                }
              };
             
  
            case 'name':
              return {
                userEnteredValue: {
                  stringValue: member.name
                }
              };
              
  
            case 'role':
              return {
                userEnteredValue: {
                  stringValue: member.role
                }
              };
              
            
            case 'specificrole':
              return {
                userEnteredValue: {
                  stringValue: member.specificrole
                }
              };
              
  
            default:
              return {
                userEnteredValue: {
                  stringValue: "none"
                }
              };
          }
        });
      }
      
      if(memberType === "normal_member"){
          cells = COLUMNS_OF_NORMAL_MEMBERS.map(function(column) {
            switch (column.field) {
              case 'email':
                return {
                  userEnteredValue: {
                    stringValue: member.email
                  }
                };
                
    
              case 'name':
                return {
                  userEnteredValue: {
                    stringValue: member.name
                  }
                };
                

              default:
                return {
                  userEnteredValue: {
                    stringValue: "none"
                  }
                };
            }
          });
      }

      if(memberType === "faculty_and_chairperson"){
        cells = COLUMNS_OF_FACULTY_AND_CHAIRPERSON_MEMBERS.map(function(column) {
          switch (column.field) {
            case 'email':
              return {
                userEnteredValue: {
                  stringValue: member.email
                }
              };
             
  
            case 'name':
              return {
                userEnteredValue: {
                  stringValue: member.name
                }
              };
              
  
            case 'role':
              return {
                userEnteredValue: {
                  stringValue: member.role
                }
              };
              
          
            default:
              return {
                userEnteredValue: {
                  stringValue: "none"
                }
              };
          }
        });
      }
   
      return {
        values: cells
      };
    });
  }