const express  =  require('express');
const { loginRequired, ensureCorrectUser } = require('../middleware/auth');
const router   =  express.Router();
const db       =  require("../models");
const { ensureIndexes } = require('../models/User');
let SheetsHelper = require('./sheets');


router.get("/:name/allmembers" , async function(req , res , next){
    try{
        let society =  await db.Society.findOne({name : req.params.name}).populate("normal_member council_members council_head facult_details").exec(); 
        const { normal_member , council_members , council_head , facult_details , name } = society;
        return res.json({
            normal_member,
            council_members,
            council_head,
            facult_details
        });
    }catch(err){
        return next(err);
    }
});

router.get("/:name/allevents" , async function(req , res , next){
    try{
        let society = await db.Society.findOne({name : req.params.name}).populate("events").exec();
        let { events } = society;

        return res.json({
            events
        }); 

    }catch(err){
        return next(err);
    }
});

router.get("/:name/allData" , async function(req , res , next){
    try{
        let society =  await db.Society.findOne({name : req.params.name}).populate("normal_member council_members council_head facult_details events").exec();
        return res.json({
            society
        })

    }catch(err){
        return next(err);
    }
});

router.get("/:societyid/get/membersfulldetails" , async function(req , res , next){
    try{
        let normal_members = [];
        let council_members = [];
        let council_heads = [];
        let faculty = {};
        let chairperson = {};
        let society = await db.Society.findById(req.params.societyid);
        if(society){

            if(society.normal_members){
                for(let i = 0 ; i < society.normal_members.length ; i++){
                    let user = await db.User.findOne({ email : society.normal_members[i].email });
                    if(user){
                        await normal_members.push(user);
                    }else{
                        await normal_members.push(society.normal_members[i]);
                    }
                }
            }

            if(society.council_members){
                for(let j = 0 ; j < society.council_members.length ; j++){
                    let user = await db.User.findOne({ email : society.council_members[j].email });
                    if(user){
                        await council_members.push(user);
                    }else{
                        await council_members.push(society.council_members[j]);
                    }
                }
            }

            if(society.council_heads){
                for(let k = 0 ; k < society.council_heads.length ; k++){
                    let user = await db.User.findOne({ email : society.council_heads[k].email });
                    if(user){
                        await council_heads.push(user);
                    }else{
                        await council_heads.push(society.council_heads[k]);
                    }
                }
            }

            if(society.faculty){
                let user = await db.User.findOne({ email : society.faculty.email });
                if(user){
                    faculty = user;
                }else{
                    faculty = society.faculty;
                }
            }

            if(society.chairperson){
                let user = await db.User.findOne({ email : society.chairperson.email });
                if(user){
                    chairperson = user;
                }else{
                    chairperson = society.chairperson;
                }
            }
            
            return res.json({
                normal_members,
                council_members,
                council_heads,
                faculty,
                chairperson
            });
        }

        return next({
            message : "Society not found."
        })

    }catch(err){
        console.log(err);
        return next(err);
    }
});


router.post("/:name/:societyid/edit/createspreadsheet" , async function(req , res , next){
    try{
        // Craete spreadsheet
        // find all three sheet id's of that sheet
        // take data of database and store in sheet
        // give the response
        let model = {};
        let helper = new SheetsHelper(req.body.accesstoken);
        await helper.createSpreadsheet(req.params.name , async function(err , spreadsheet){
            if(err){
                return next({
                    message : err.message
                });
            }

            model.sheetid = spreadsheet.spreadsheetId;
            console.log("ID == >" , spreadsheet.spreadsheetId);

            for(var i = 0 ; i < spreadsheet.sheets.length; i++){
                if(spreadsheet.sheets[i].properties.title === "Council_Members"){
                    model.councilmembers = {
                        sheetid : spreadsheet.sheets[i].properties.sheetId 
                    }
                    continue;
                }

                if(spreadsheet.sheets[i].properties.title === "Society_Members"){
                    model.societymembers = {
                        sheetid : spreadsheet.sheets[i].properties.sheetId 
                    }
                    continue;
                }

                if(spreadsheet.sheets[i].properties.title === "Faculty"){
                    model.facultyandchairperson = {
                        sheetid : spreadsheet.sheets[i].properties.sheetId 
                    }
                }
            }
            

            // update society sheet details
            let society = await db.Society.findById(req.params.societyid);
            
            if(society){
                society.spreadsheets.sheetid = model.sheetid;
                society.spreadsheets.useremail = req.body.useremail;
                if(model.councilmembers){
                    society.spreadsheets.council_member.sheetid = model.councilmembers.sheetid; 
                }
                if(model.societymembers){
                    society.spreadsheets.normal_members.sheetid = model.societymembers.sheetid; 
                }
                if(model.facultyandchairperson){
                    society.spreadsheets.facultyorchairperson.sheetid = model.facultyandchairperson.sheetid; 
                }
                await society.save();

                // find all the members of society and store in sheet
                let allcouncilmembers = [];
                
                for(var j = 0 ; j < society.council_members.length; j++){
                    let dataobj = {};
                    dataobj.name = society.council_members[j].name;
                    dataobj.email = society.council_members[j].email;
                    dataobj.role = "council member";
                    dataobj.specificrole = "Technical Team";
                    await allcouncilmembers.push(dataobj);
                }

                helper.sync(model.sheetid , model.councilmembers.sheetid, allcouncilmembers, "council_member",  async function(err){
                    if(err){
                        return next({
                            message : "Got error while syncing data from db ==> sheet"
                        });
                    }
                    let allnormalmembers = [];
                    for(var k = 0; k < society.normal_members.length ; k++){
                        let dataobj = {};
                        dataobj.name = society.normal_members[k].name;
                        dataobj.email = society.normal_members[k].email;
                        await allnormalmembers.push(dataobj);
                    }

                    helper.sync(model.sheetid , model.societymembers.sheetid, allnormalmembers, "normal_member", async function(err){
                        if(err){
                            return next({
                                message : "Got error while sending normal member data to spreadsheet"
                            });
                        }

                        let allfacultyandchairpersonmembers = [];
                        let dataobj = {};
                        dataobj.name = society.chairperson.name;
                        dataobj.email = society.chairperson.email;
                        dataobj.role = "chairperson";
                        await allfacultyandchairpersonmembers.push(dataobj);
                        let dataobj2 = {};
                        dataobj2.name = society.faculty.name;
                        dataobj2.email = society.faculty.email;
                        dataobj2.role = "faculty";
                        await allfacultyandchairpersonmembers.push(dataobj2);
                        console.log(allfacultyandchairpersonmembers);

                        helper.sync(model.sheetid , model.facultyandchairperson.sheetid, allfacultyandchairpersonmembers, "faculty_and_chairperson", function(err){
                            if(err){
                                return next({
                                    message : "Got error while sending faculty data to spreadsheet"
                                });
                            }

                            return res.json(society);
                        });
                    });
                });
                
            }else{
                console.log(err);
                return next({
                    message : "Society does not exist"
                })
            }
        });

    }catch(err){
        console.log(err);
        return next({
            message : "Something went wrong while creating spreadSheet"
        });
    }
});


router.post("/:name/:societyid/edit/syncdata" , async function(req , res , next){
    try{
        // find society.
        // Get data from SpreadSheet. 
        // set the data into the society.
        let helper = new SheetsHelper(req.body.accesstoken);
        let society = await db.Society.findById(req.params.societyid);
        if(society){
            if(society.spreadsheets.sheetid){
                helper.getAllData(society.spreadsheets.sheetid , req.body.requestFrom , async function(err , data){
                    if(err){
                        return next({
                            message : "Something went wrong"
                        });
                    }
                    console.log(data);
                    if(req.body.requestFrom === "normal_member"){
                        society.normal_members.splice(0, society.normal_members.length );
                        await society.save();
                        for(var i = 1; i < data.values.length; i++){
                            society.normal_members.push({
                               name :  data.values[i][1],
                               email : data.values[i][0]
                            });
                        }
                        await society.save();
                    }

                    if(req.body.requestFrom === "council_member"){
                        society.council_members.splice(0, society.council_members.length);
                        await society.save();
                        for(var j = 1; j < data.values.length; j++){
                            await society.council_members.push({
                               name :  data.values[j][1],
                               email : data.values[j][0],
                               role : data.values[j][2],
                               specificrole : data.values[j][3]
                            });
                        }
                        await society.save();
                    }

                    if(req.body.requestFrom === "faculty_and_chairperson"){
                        society.faculty = {};
                        society.chairperson = {};
                        await society.save();
                        let isGotFaculty = false;
                        let isGotChairperson = false;
                        for(var j = 1; j < data.values.length; j++){
                            if(!isGotFaculty && data.values[j][2] === "faculty"){
                                society.faculty.name = data.values[j][1];
                                society.faculty.email = data.values[j][0];
                                isGotFaculty = true;
                                continue;
                            } 

                            if(!isGotChairperson && data.values[j][2] === "chairperson"){
                                society.chairperson.name = data.values[j][1];
                                society.chairperson.email = data.values[j][0];
                                isGotChairperson = true;
                                continue;
                            }
                        }
                        await society.save();
                    }
                    
                    return res.json(society);
                });
            }else{
                return next({
                    message : "First create new spreadSheet."
                });
            }
        }else{
            return next({
                message : "Society Not found"
            });
        }
        
    }catch(err){
        return next({
            message : "got error while syncing data from spreadsheet."
        })
    }
});


router.get("/getalldata/:id/:accesstoken" , async function(req , res, next){
     try{
        let helper = new SheetsHelper(req.params.accesstoken);
        await helper.getAllData(req.params.id , function(err , data){
            if(err){
                return next({
                    message: "Got error while fetching data"
                });
            }
            console.log(data);
            return res.json(data);
        });
     }catch(err){
         console.log(err);
         return next({
             message: "Got error while fetching data from Google SpreadSheet"
         });
     }
});


router.get("/getDimentions/:id/:accesstoken" ,  async function(req ,res, next){
     try{
        let helper = new SheetsHelper(req.params.accesstoken);
        await helper.getDimentions(req.params.id , function(err , data){
            if(err){
                return next({
                    message: "Got error while fetching data"
                });
            }
            console.log(data);
            return res.json(data);
        });

     }catch(err){
         return next({
             message : "Something went wrong while getting dimentions of sheet"
         })
     }
});


router.post("/:societyname/:societyid/edit/managemembers/add/societymember" , async function(req , res , next){
    try{
        // find society
        // according to request add new member
        // take all members data 
        // update all data in sheet if sheet exist
        // return society

        let society = await db.Society.findById(req.params.societyid);
        if(society){
              let normalmember = {
                  name : req.body.name,
                  email : req.body.email
              }
              society.normal_members.push(normalmember);
              society.save();

              // If SpreadSheet already Exist 
              if(society.spreadsheets && society.spreadsheets.sheetid && req.body.accesstoken){
                  let helper = new SheetsHelper(req.body.accesstoken);
                  let allDataArr = society.normal_members;
                  helper.sync(society.spreadsheets.sheetid, society.spreadsheets.normal_members.sheetid, allDataArr, "normal_member", async function(err){
                    if(err){
                        return next({
                            message : "Got error while sending normal member data to spreadsheet"
                        });
                    }
                    return res.json(society);
                 });
              }else{
                   // If spreadSheet does not exist.
                   return res.json(society);
              }  
        }else{
            return next({
                message : "society does not exist."
            })
        }
    }catch(err){
        console.log(err);
        return next({
            message : err.message
        })
    }
});


router.post("/:societyname/:societyid/edit/managemembers/add/councilmember" , async function(req , res , next){
    try{
        // find society
        // according to request add new member
        // take all members data 
        // update all data in sheet if sheet exist
        // return society

        let society = await db.Society.findById(req.params.societyid);
        if(society){
              let councilmember = {
                  name : req.body.name,
                  email : req.body.email,
                  role : req.body.role,
                  specificrole : req.body.specificrole
              }
              society.council_members.push(councilmember);
              society.save();

              // If SpreadSheet already Exist 
              if(society.spreadsheets && society.spreadsheets.sheetid && req.body.accesstoken){
                  let helper = new SheetsHelper(req.body.accesstoken);
                  let allDataArr = society.council_members;
                  helper.sync(society.spreadsheets.sheetid, society.spreadsheets.council_member.sheetid, allDataArr, "council_member", async function(err){
                    if(err){
                        return next({
                            message : "Got error while sending normal member data to spreadsheet"
                        });
                    }
                    return res.json(society);
                 });
              }else{
                   // If spreadSheet does not exist.
                   return res.json(society);
              }  
        }else{
            return next({
                message : "society does not exist."
            })
        }
    }catch(err){
        console.log(err);
        return next({
            message : err.message
        })
    }
});


router.post("/:societyname/:societyid/edit/managemembers/add/facultyorchairperson" , async function(req , res , next){
    try{
        // find society
        // according to request add new member
        // take all members data 
        // update all data in sheet if sheet exist
        // return society
        console.log(req.body);
        let society = await db.Society.findById(req.params.societyid);
        if(society){
             if(req.body.role === "faculty"){
                 society.faculty.name = req.body.name;
                 society.faculty.email = req.body.email;
             }

             if(req.body.role === "chairperson"){
                 society.chairperson.name = req.body.name;
                 society.chairperson.email = req.body.email;
             }
             await society.save();
              
              // If SpreadSheet already Exist 
            if(society.spreadsheets && society.spreadsheets.sheetid && req.body.accesstoken){

                let helper = new SheetsHelper(req.body.accesstoken);
                let allfacultyandchairpersonmembers = [];
                let dataobj = {};
                dataobj.name = society.faculty.name;
                dataobj.email = society.faculty.email;
                dataobj.role = "faculty";
                await allfacultyandchairpersonmembers.push(dataobj);
                let dataobj2 = {};
                dataobj2.name = society.chairperson.name;
                dataobj2.email = society.chairperson.email;
                dataobj2.role = "chairperson";
                await allfacultyandchairpersonmembers.push(dataobj2);

                helper.sync(society.spreadsheets.sheetid, society.spreadsheets.facultyorchairperson.sheetid, allfacultyandchairpersonmembers, "faculty_and_chairperson", async function(err){
                if(err){
                    return next({
                        message : "Got error while sending normal member data to spreadsheet"
                    });
                }
                return res.json(society);
                });
            }else{
                // If spreadSheet does not exist.
                return res.json(society);
            }  
        }else{
            return next({
                message : "society does not exist."
            })
        }
    }catch(err){
        console.log(err);
        return next({
            message : err.message
        })
    }
});


router.post("/:societyname/:societyid/edit/managemembers/remove/societymember" , async function(req , res , next){
    try{
        // find society
        // according to request add new member
        // take all members data 
        // update all data in sheet if sheet exist
        // return society
        console.log("_--------------------got delete request-----------");
        let society = await db.Society.findById(req.params.societyid);
        if(society){
             let index = 0;
             for(var i = 0 ; i < society.normal_members.length; i++){
                 if(society.normal_members[i].email === req.body.email){
                     index = i;
                     break;
                 }
             }
             society.normal_members.splice(index , 1);
             await society.save();

            // If SpreadSheet already Exist 
            if(society.spreadsheets && society.spreadsheets.sheetid && req.body.accesstoken){
                let helper = new SheetsHelper(req.body.accesstoken);
                let allnormalmembers = [];
                for(var k = 0; k < society.normal_members.length ; k++){
                    let dataobj = {};
                    dataobj.name = society.normal_members[k].name;
                    dataobj.email = society.normal_members[k].email;
                    await allnormalmembers.push(dataobj);
                }

                helper.sync(society.spreadsheets.sheetid , society.spreadsheets.normal_members.sheetid, allnormalmembers, "normal_member", async function(err){
                    if(err){
                        return next({
                            message : "Got error while sending normal member data to spreadsheet"
                        });
                    }

                    return res.json(society);

                });
            }else{
                // If spreadSheet does not exist.
                return res.json(society);
            }  
        }else{
            return next({
                message : "society does not exist."
            })
        }
    }catch(err){
        console.log(err);
        return next({
            message : err.message
        })
    }
});

router.post("/:societyname/:societyid/edit/managemembers/remove/councilmember" , async function(req , res , next){
    try{
        // find society
        // according to request add new member     
        // take all members data 
        // update all data in sheet if sheet exist
        // return society
        let society = await db.Society.findById(req.params.societyid);
        if(society){
             let index = 0;
             for(var i = 0 ; i < society.council_members.length; i++){
                 if(society.council_members[i].email === req.body.email){
                     index = i;
                     break;
                 }
             }
             society.council_members.splice(index , 1);
             await society.save();

            // If SpreadSheet already Exist 
            if(society.spreadsheets && society.spreadsheets.sheetid && req.body.accesstoken){
                let helper = new SheetsHelper(req.body.accesstoken);
                let allCouncilMembers = [];
                for(var k = 0; k < society.council_members.length ; k++){
                    let dataobj = {};
                    dataobj.name = society.council_members[k].name;
                    dataobj.email = society.council_members[k].email;
                    dataobj.role = society.council_members[k].role;
                    dataobj.specificrole = society.council_members[k].specificrole;
                    await allCouncilMembers.push(dataobj);
                }

                helper.sync(society.spreadsheets.sheetid , society.spreadsheets.council_member.sheetid, allCouncilMembers, "council_member", async function(err){
                    if(err){
                        return next({
                            message : "Got error while sending normal member data to spreadsheet"
                        });
                    }

                    return res.json(society);

                });
            }else{
                // If spreadSheet does not exist.
                return res.json(society);
            }  
        }else{
            return next({
                message : "society does not exist."
            })
        }
    }catch(err){
        console.log(err);
        return next({
            message : err.message
        })
    }
});


router.post("/:societyname/:societyid/edit/managemembers/remove/facultyorchairperson" , async function(req , res , next){
    try{
        // find society
        // according to request add new member     
        // take all members data 
        // update all data in sheet if sheet exist
        // return society
        console.log(req.body);
        let society = await db.Society.findById(req.params.societyid);
        if(society){
             if(req.body.role === "faculty"){
                 if(society.faculty.email === req.body.email){
                     society.faculty = {};
                 }
             }

             if(req.body.role === "chairperson"){
                if(society.chairperson.email === req.body.email){
                    console.log("Setting {} to chairperson");
                    society.chairperson = {};
                }
            }
            
            await society.save();

            // If SpreadSheet already Exist 
            if(society.spreadsheets && society.spreadsheets.sheetid && req.body.accesstoken){
                let helper = new SheetsHelper(req.body.accesstoken);
                let allFacultyOrChairperson = [];
                if(society.faculty.email){
                    let dataobj = {};
                    dataobj.name = society.faculty.name;
                    dataobj.email = society.faculty.email;
                    dataobj.role = "faculty"
                    allFacultyOrChairperson.push(dataobj);
                }

                if(society.chairperson.email){
                    console.log("In chairperson");
                    let dataobj = {};
                    dataobj.name = society.chairperson.name;
                    dataobj.email = society.chairperson.email;
                    dataobj.role = "chairperson"
                    allFacultyOrChairperson.push(dataobj);
                }
                console.log(allFacultyOrChairperson);

                helper.sync(society.spreadsheets.sheetid , society.spreadsheets.facultyorchairperson.sheetid, allFacultyOrChairperson, "faculty_and_chairperson", async function(err){
                    if(err){
                        return next({
                            message : "Got error while sending normal member data to spreadsheet"
                        });
                    }

                    return res.json(society);

                });
            }else{
                // If spreadSheet does not exist.
                return res.json(society);
            }  
        }else{
            return next({
                message : "society does not exist."
            })
        }
    }catch(err){
        console.log(err);
        return next({
            message : err.message
        })
    }
});



router.post("/:societyname/:societyid/edit/managemembers/edit/societymember" , async function(req , res , next){
    try{
        // find society
        // according to request add new member
        // take all members data 
        // update all data in sheet if sheet exist
        // return society
        let society = await db.Society.findById(req.params.societyid);
        if(society){
             var index = 0;
             for(var i = 0 ; i < society.normal_members.length ; i++){
                 if(society.normal_members[i]._id.toString() === req.body.id.toString()){
                      index = i;
                      break;
                 }
             }

             society.normal_members[index].name = req.body.name;
             society.normal_members[index].email = req.body.email;
             await society.save();

            // If SpreadSheet already Exist 
            if(society.spreadsheets && society.spreadsheets.sheetid && req.body.accesstoken){
                let helper = new SheetsHelper(req.body.accesstoken);
                let allnormalmembers = [];
                for(var k = 0; k < society.normal_members.length ; k++){
                    let dataobj = {};
                    dataobj.name = society.normal_members[k].name;
                    dataobj.email = society.normal_members[k].email;
                    await allnormalmembers.push(dataobj);
                }

                helper.sync(society.spreadsheets.sheetid , society.spreadsheets.normal_members.sheetid, allnormalmembers, "normal_member", async function(err){
                    if(err){
                        return next({
                            message : "Got error while sending normal member data to spreadsheet"
                        });
                    }

                    return res.json(society);

                });
            }else{
                // If spreadSheet does not exist.
                return res.json(society);
            }  
        }else{
            return next({
                message : "society does not exist."
            })
        }
    }catch(err){
        console.log(err);
        return next({
            message : err.message
        })
    }
});

router.post("/:societyname/:societyid/edit/managemembers/edit/councilmember" , async function(req , res , next){
    try{
        // find society
        // according to request add new member
        // take all members data 
        // update all data in sheet if sheet exist
        // return society
        let society = await db.Society.findById(req.params.societyid);
        if(society){
            
            let index = 0;
            for(var i = 0 ; i < society.council_members.length ; i++){
                 if(society.council_members[i]._id.toString() === req.body.id.toString()){
                      index = i;
                      break;
                 }
             }

             society.council_members[index].name = req.body.name;
             society.council_members[index].email = req.body.email;
             society.council_members[index].role = req.body.role;
             society.council_members[index].specificrole = req.body.specificrole;
             await society.save();

              // If SpreadSheet already Exist 
              if(society.spreadsheets && society.spreadsheets.sheetid && req.body.accesstoken){
                  let helper = new SheetsHelper(req.body.accesstoken);
                  let allDataArr = society.council_members;
                  helper.sync(society.spreadsheets.sheetid, society.spreadsheets.council_member.sheetid, allDataArr, "council_member", async function(err){
                    if(err){
                        return next({
                            message : "Got error while sending normal member data to spreadsheet"
                        });
                    }
                    return res.json(society);
                 });
              }else{
                   // If spreadSheet does not exist.
                   return res.json(society);
              }  
        }else{
            return next({
                message : "society does not exist."
            })
        }
    }catch(err){
        console.log(err);
        return next({
            message : err.message
        })
    }
});


module.exports = router;