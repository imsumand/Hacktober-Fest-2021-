    /**
     * @NApiVersion 2.1
     * @NScriptType Suitelet
     * @NModuleScope SameAccount
     */
     define(['N/ui/serverWidget', 'N/record', 'N/runtime', 'N/file', 'N/log', 'N/search', 'N/render', 'N/url', 'N/redirect'],

     function (serverWidget, record, runtime, file, log, search, render, url, redirect) {
         /**
          * Definition of the Suitelet script trigger point.
          * 
          * @param {Object} context 
          * @param {ServerRequest} context.request - Encapsulation of the incoming request
          * @param {Serverresponse} context.response - Encapsulation of the Suitelet response
          */
         var _response;
         var _request;
         var decodedCookie;
        
         


      







         function onRequest(context) {
             _request = context.request;
             _response = context.response;
             var pct_logo = 'https://7255402.app.netsuite.com/core/media/media.nl?id=15929&c=7255402&h=JQwcI60yognaw9GYp6fd5EeOIT7-Is4SkbaYIMxzBRxM5QOI';
             if (_request.method === 'GET') {







                 function getDateTime() {
                     var now = new Date();
                     var year = now.getFullYear();
                     var month = now.getMonth() + 1;
                     var day = now.getDate();
                     var hour = now.getHours();
                     var minute = now.getMinutes();
                     var second = now.getSeconds();
                     if (month.toString().length == 1) {
                         month = '0' + month;
                     }
                     if (day.toString().length == 1) {
                         day = '0' + day;
                     }
                     if (hour.toString().length == 1) {
                         hour = '0' + hour;
                     }
                     if (minute.toString().length == 1) {
                         minute = '0' + minute;
                     }
                     if (second.toString().length == 1) {
                         second = '0' + second;
                     }
                     var dateTime = year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
                     return dateTime;
                 }

                 // // example usage: realtime clock
                 // // setInterval(function(){
                 var currentTime = getDateTime();
                 //document.getElementById("digital-clock").innerHTML = currentTime;
                 // }, 1000);



                 // var currentdate = new Date();
                 // if(currentdate.getSeconds()<10 && currentdate.getMinutes()<10){
                 //     var seconds="0"+currentdate.getSeconds();
                 //     var minutes="0"+currentdate.getMinutes();
                 // }
                 // else if(currentdate.getSeconds()<10){
                 //     var seconds="0"+currentdate.getSeconds();
                 // }
                 // else if(currentdate.getMinutes()<10){
                 //     var minutes="0"+currentdate.getMinutes();
                 // }
                 // else{
                 //     var minutes=currentdate.getMinutes();
                 //     var seconds=currentdate.getSeconds();
                 //  }
                 // var datetime = "Sync date: " + currentdate.getDate() + "/"
                 //     + (currentdate.getMonth() + 1) + "/"
                 //     + currentdate.getFullYear() + "<br> Sync time: "
                 //     + currentdate.getHours() + ":"
                 //     + minutes + ":"
                 //     + seconds;



                 try {
                     var deviceip = context.request.headers['ns-client-ip'];
                     var customrecord_pct_billing_otpSearchObj = search.create({
                         type: "customrecord_pct_billing_otp",
                         filters:
                             [
                                 ["custrecord_pct_billing_otp_ip", "is", deviceip]
                             ],
                         columns:
                             [
                                 search.createColumn({
                                     name: "id",
                                     sort: search.Sort.ASC,
                                     label: "ID"
                                 }),
                                 search.createColumn({ name: "custrecord_pct_billing_otp_cookie", label: "Cookie" }),
                                 search.createColumn({ name: "custrecord_pct_billing_otp_employee", label: "Employee" })
                             ]
                     });
                     var searchResultCount = customrecord_pct_billing_otpSearchObj.runPaged().count;

                     log.debug("customrecord_pct_billing_otpSearchObj result count", searchResultCount);
                     var customrecord_pct_billing_otpSearchResult = customrecord_pct_billing_otpSearchObj.run().getRange({ start: 0, end: searchResultCount });

                     decodedCookie = customrecord_pct_billing_otpSearchResult[searchResultCount - 1].getValue({ name: "custrecord_pct_billing_otp_cookie" });
                     var userId = customrecord_pct_billing_otpSearchResult[searchResultCount - 1].getValue({ name: "custrecord_pct_billing_otp_employee" });


                     log.debug({
                         title: 'decodedCookie',
                         details: decodedCookie
                     })

                     if (decodedCookie == '') {
                         redirectToLoginPage();
                     }

                     var decodedCookieArr = new Array();
                     decodedCookieArr = decodedCookie.split(';');
                     var indexOfArr = getIndexOf(decodedCookieArr)
                     var passVal = decodedCookieArr[indexOfArr].trim();

                     log.debug({
                         title: 'passVal1',
                         details: passVal
                     })
                 } catch (ex) {
                     redirectToLoginPage();
                 }

                 var USERDevice = context.request.headers['user-agent'];
                 var deviceip = context.request.headers['ns-client-ip'];

                 var cookie = passVal;



                 //var userName = context.request.parameters.custparam_userName;
                 //var userId1 = context.request.headers['user-id'];
                 log.debug({
                     title: 'Fetched ID',
                     details: userId
                 })
                 //var userId=424;


                 if (cookie != '') {
                     var validUrl = urlValidation(USERDevice, deviceip, userId, cookie)
                 }
                 if (validUrl == 0) {
                     redirectToLoginPage();
                 }



                 function getIndexOf(decodedCookieArr) {
                     var length = decodedCookieArr.length;
                     for (var index = 0; index < length; index++) {
                         var value = decodedCookieArr[index];
                         if (value.includes("PCTCookie")) {
                             log.debug({
                                 title: 'PCTCookie',
                                 details: value
                             })
                             return index;
                             break;
                         }
                     }

                 }

                 function urlValidation(USERDevice, deviceip, userId, cookie) {
                     try {
                         log.debug({
                             title: 'validURL CHECK',
                             details: 'userId =' + userId + ' deviceip =' + deviceip + ' USERDevice =' + USERDevice + ' cookie =' + cookie
                         })
                         var customrecord_pct_billing_otpSearchObj = search.create({
                             type: "customrecord_pct_billing_otp",
                             filters:
                                 [
                                     ["custrecord_pct_billing_otp_employee", "anyof", userId],
                                     "AND",
                                     ["custrecord_pct_billing_otp_ip", "is", deviceip],
                                     "AND",
                                     ["custrecord_pct_billing_otp_device", "is", USERDevice],
                                     "AND",
                                     ["custrecord_pct_billing_otp_cookie", "is", cookie]
                                 ],
                             columns:
                                 [
                                     search.createColumn({
                                         name: "id",
                                         sort: search.Sort.ASC,
                                         label: "ID"
                                     }),
                                     search.createColumn({ name: "scriptid", label: "Script ID" }),
                                     search.createColumn({ name: "custrecord_pct_billing_otp_email", label: "Email" }),
                                     search.createColumn({ name: "custrecord_pct_billing_otp_pin", label: "PIN" }),
                                     search.createColumn({ name: "custrecord_pct_billing_otp_time", label: "Time" }),
                                     search.createColumn({ name: "custrecord_pct_billing_otp_ip", label: "IP" })
                                 ]
                         });
                         var searchResultCount = customrecord_pct_billing_otpSearchObj.runPaged().count;
                         log.debug("customrecord_pct_billing_otpSearchObj result count", searchResultCount);
                         customrecord_pct_billing_otpSearchObj.run().each(function (result) {
                             // .run().each has a limit of 4,000 results
                             return true;
                         });
                         return searchResultCount
                     }
                     catch (ex) {
                         redirectToLoginPage();

                     }

                 }

                 function redirectToLoginPage() {
                     redirect.toSuitelet({
                         scriptId: 'customscript_pct_billing_login_email',
                         deploymentId: 'customdeploy_pct_billing_login_email',
                         isExternal: true,
                         /*parameters: {
                             'custparam_userName': isUserExisit.userName,
                             'custparam_userId': isUserExisit.userId,
                             'custparam_ip' : ip,
                             'custparam_user_agent' : user_agent
                         }*/
                     });
                 }




                 //CUSTOMER JSON FILE
                 // var cust_file_id = file.load({
                 //     id: 'SuiteScripts/PCT BILLING Web Application/PCT BILLING/PCT BILLING JSON CUSTOMER DATA/customerData.json'
                 // })

                 // log.debug({
                 //     title: 'cust_file_id',
                 //     details: cust_file_id
                 // })
                 // var cust_file_content = cust_file_id.getContents()
                 // log.debug({
                 //     title: 'cust_file_content',
                 //     details: cust_file_content
                 // })


                 //SO JSON FILE
                 var so_file_id = file.load({
                     id: 'SuiteScripts/PCT BILLING Web Application/PCT BILLING/PCT BILLING JSON SO DATA/soData.json'
                 })
                 log.debug({
                     title: 'so_file_id',
                     details: so_file_id
                 })
                 var so_file_content = so_file_id.getContents()
                 log.debug({
                     title: 'so_file_content',
                     details: so_file_content
                 })

                 //INV JSON FILE
                 var inv_file_id = file.load({
                     id: 'SuiteScripts/PCT BILLING Web Application/PCT BILLING/PCT BILLING JSON INVOICE DATA/invData.json'
                 })
                 log.debug({
                     title: 'inv_file_id',
                     details: inv_file_id
                 })
                 var inv_file_content = inv_file_id.getContents()
                 log.debug({
                     title: 'inv_file_content',
                     details: inv_file_content
                 })
                 //TESTING




                 var soObj = JSON.parse(so_file_content);
                 var soName = new Array();
                 var custName = new Array();
                 for (var i = 0; i < soObj.length; i++) {
                     var soDoc = soObj[i];
                     soName[i] = soDoc.document_number;
                     custName[i] = soDoc.entity;

                     // log.debug({
                     //     title: 'Test Json',
                     //     details: soName[i]
                     // })
                 }
                 var invObj = JSON.parse(inv_file_content);
                 var invName = new Array();
                 var invCust = new Array();
                 for (var i = 0; i < invObj.length; i++) {
                     var invDoc = invObj[i];
                     invName[i] = invDoc.document_number;
                     invCust[i] = invDoc.entity;

                     // log.debug({
                     //     title: 'Test Json',
                     //     details: soName[i]
                     // })
                 }

                 var content = `<!DOCTYPE html>` +
                     `<html lang="en">` +
                     `<head>` +
                     `    <title>PCT Billing</title>` +
                     `    <meta charset="utf-8">` +
                     `    <meta name="viewport" content="width=device-width, initial-scale=1">` +
                     `    <link rel="icon" href="${pct_logo}">` +
                     `    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">` +
                     `    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>` +
                     `    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>` +
                     '<script type="text/javascript">' +
                     'getTime();' +
                     ' var now = new Date();\n'+
 '        var day = now.getDate();\n'+
 '        var month = now.getMonth() + 1;\n'+
 '        var year = now.getFullYear();\n'+
 '        var fullDate = month + "/" + day + "/" + year;\n'+
 //'        $("#todaydate").html(fullDate);'+
                     'function getTime() {\n' +
                     '            var today = new Date();\n' + 
                     '            var h = today.getHours();\n' +
                     '            var m = today.getMinutes();\n' +
                     '            var s = today.getSeconds();\n' +
                     '            // add a zero in front of numbers<10  \n' +
                     '            m = checkTime(m);\n' +
                     '            s = checkTime(s);\n' +
                     '            $("#date").html(h + ":" + m + ":" + s);\n' +
                     '            setTimeout(function () { getTime() }, 1000);\n' +
                     '        }' +
                     ' function checkTime(i) {\n' +
                     '            if (i < 10) {\n' +
                     '                i = "0" + i;\n' +
                     '            }\n' +
                     '            return i;\n' +
                     '        }' +
                     ' window.history.forward();' +
                     'function noBack() {' +
                     'window.history.forward();' +
                     '}' +
                     '</script>' +
                     `</head>` +
                     `<style>` +
                     `    img.logo-navbar {` +
                     `        width: 2.5rem !important;` +
                     `        height: 2.5rem !important;` +
                     `    }` +
                     `` +
                     `    .item-table {` +
                     `        background-color: #f5f4f5;` +
                     `        margin: 10px 0px 0px 1px;` +
                     `        padding: 5px;` +
                     `        border-radius: 5px;` +
                     `        text-align: center;` +
                     `        vertical-align: middle;` +
                     `    }` +
                     `` +
                     `    .top-buffer {` +
                     `        margin-top: 10px;` +
                     `    }` +
                     `</style>` +
                     `` +
                     `<body>` +
                     `    <nav class="navbar navbar-default">` +
                     `        <div class="container-fluid">` +
                     `            <div class="navbar-header">` +
                     `                <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">` +
                     `                    <span class="icon-bar"></span>` +
                     `                    <span class="icon-bar"></span>` +
                     `                    <span class="icon-bar"></span>` +
                     `                </button>` +
                     `                <a class="navbar-brand" href="#"><img src="${pct_logo}"` +
                     `                        class="logo-navbar" width="auto" height="auto"></a>` +
                     `            </div>` +
                     `            <div class="collapse navbar-collapse" id="myNavbar">` +
                     `                <ul class="nav navbar-nav navbar-right">` +
                     `                    <li><a><span class="glyphicon glyphicon-user"></span> ${userId}</a></li>` +
                     `                    <li><a href=\'scriptlet.nl?script=196&deploy=1&compid=7255402&h=38a57cec7478fc49f8d3\'><span class="glyphicon glyphicon-off"></span> Logout</a></li>` +
                     `                </ul>` +
                     `            </div>` +
                     `        </div>` +
                     `    </nav>` +
                     `` +
                     `    <div class="container" style="text-align:center ">` +
                     `                <form class="form-inline" id="url" action="" enctype="multipart/form-data" method="post">` +
                     `        <div class="row" style="padding: 0px; margin: 0px;">` +

                     `            <div class="col-xs-12" style="margin-bottom:5px">` +
                 
                     ` <div class="col-1">` + //`<div id="digital-clock">`+`</div>`+
                     `<label for="pwd" id="date"> ${currentTime}</label>` +
                     `</div>` +

                     `                    <div class="form-group">` +
                     `                        <label class="sr-only" for="cust_id">Customer Name:</label>` +
                     `                        <input list="Customer" class="form-control" id="cust_id" placeholder="Sales Orders:"` +
                     `                            name="cust_id">` +
                     `<datalist id="Customer">`;
                 for (i = 0; i < soName.length; i++) {
                     content += `<option value="${soName[i]} -- Customer: ${custName[i]}"/>`;
                 }


                 content += `</datalist>` +
                     `                    </div>` +



                     `            </div>`;





                 content +=

                     `            <div class="col-xs-12" style="margin-bottom:5px">` +

                     `                    <div class="form-group">` +
                     `                        <label class="sr-only" for="inv_id">Invoice Number:</label>` +
                     `                        <input list="Invoice" class="form-control" id="inv_id" placeholder="Invoice"` +
                     `                            name="inv_id" >` +
                     `<datalist id="Invoice">`;
                 for (i = 0; i < invName.length; i++) {
                     content += `<option value="${invName[i]} -- Customer: ${invCust[i]}"/>`;
                 }


                 content += `</datalist>` +
                     `                    </div>` +


                     //  `                    <button type="button" class="btn btn-primary"  id="generate_invoice">Generate Invoice</button>` +


                     `            </div>` +
                     `                    <button type="submit" class="btn btn-primary primary">Select One & Submit</button>` +


                     `        </div>` +
                     `                </form>` +
                     `    </div>` +
                     `</body>` +
                     `<script>` +
                     `	document.getElementById("url").action = window.location.href;` +
                     `	</script>`
                     + `</html>`;




                 context.response.write(content);

             }
             else {

                 // var currentdate = new Date();
                 // if (currentdate.getSeconds() < 10 && currentdate.getMinutes() < 10) {
                 //     var seconds = "0" + currentdate.getSeconds();
                 //     var minutes = "0" + currentdate.getMinutes();
                 // }
                 // else if (currentdate.getSeconds() < 10) {
                 //     var seconds = "0" + currentdate.getSeconds();
                 // }
                 // else if (currentdate.getMinutes() < 10) {
                 //     var minutes = "0" + currentdate.getMinutes();
                 // }
                 // else {
                 //     var minutes = currentdate.getMinutes();
                 //     var seconds = currentdate.getSeconds();
                 // }
                 // var datetime = "Sync date: " + currentdate.getDate() + "/"
                 //     + (currentdate.getMonth() + 1) + "/"
                 //     + currentdate.getFullYear() + "<br> Sync time: "
                 //     + currentdate.getHours() + ":"
                 //     + minutes + ":"
                 //     + seconds;

                 try {
                     var deviceip = context.request.headers['ns-client-ip'];
                     var customrecord_pct_billing_otpSearchObj = search.create({
                         type: "customrecord_pct_billing_otp",
                         filters:
                             [
                                 ["custrecord_pct_billing_otp_ip", "is", deviceip]
                             ],
                         columns:
                             [
                                 search.createColumn({
                                     name: "id",
                                     sort: search.Sort.ASC,
                                     label: "ID"
                                 }),
                                 search.createColumn({ name: "custrecord_pct_billing_otp_cookie", label: "Cookie" }),
                                 search.createColumn({ name: "custrecord_pct_billing_otp_employee", label: "Employee" })
                             ]
                     });
                     var searchResultCount = customrecord_pct_billing_otpSearchObj.runPaged().count;

                     log.debug("customrecord_pct_billing_otpSearchObj result count", searchResultCount);
                     var customrecord_pct_billing_otpSearchResult = customrecord_pct_billing_otpSearchObj.run().getRange({ start: 0, end: searchResultCount });

                     decodedCookie = customrecord_pct_billing_otpSearchResult[0].getValue({ name: "custrecord_pct_billing_otp_cookie" });
                     var userId = customrecord_pct_billing_otpSearchResult[0].getValue({ name: "custrecord_pct_billing_otp_employee" });

                     log.debug({
                         title: 'decodedCookie',
                         details: decodedCookie
                     })

                     if (decodedCookie == '') {
                         redirectToLoginPage();
                     }

                     var decodedCookieArr = new Array();
                     decodedCookieArr = decodedCookie.split(';');
                     var indexOfArr = getIndexOf(decodedCookieArr)
                     var passVal = decodedCookieArr[indexOfArr].trim();

                     log.debug({
                         title: 'passVal1',
                         details: passVal
                     })
                 } catch (ex) {
                     redirectToLoginPage();
                 }

                 var USERDevice = context.request.headers['user-agent'];
                 var deviceip = context.request.headers['ns-client-ip'];

                 var cookie = passVal;

                 function getIndexOf(decodedCookieArr) {
                     var length = decodedCookieArr.length;
                     for (var index = 0; index < length; index++) {
                         var value = decodedCookieArr[index];
                         if (value.includes("PCTCookie")) {
                             log.debug({
                                 title: 'PCTCookie',
                                 details: value
                             })
                             return index;
                             break;
                         }
                     }

                 }

                 function urlValidation(USERDevice, deviceip, userId, cookie) {
                     try {
                         log.debug({
                             title: 'validURL CHECK',
                             details: 'userId =' + userId + ' deviceip =' + deviceip + ' USERDevice =' + USERDevice + ' cookie =' + cookie
                         })
                         var customrecord_pct_billing_otpSearchObj = search.create({
                             type: "customrecord_pct_billing_otp",
                             filters:
                                 [
                                     ["custrecord_pct_billing_otp_employee", "anyof", userId],
                                     "AND",
                                     ["custrecord_pct_billing_otp_ip", "is", deviceip],
                                     "AND",
                                     ["custrecord_pct_billing_otp_device", "is", USERDevice],
                                     "AND",
                                     ["custrecord_pct_billing_otp_cookie", "is", cookie]
                                 ],
                             columns:
                                 [
                                     search.createColumn({
                                         name: "id",
                                         sort: search.Sort.ASC,
                                         label: "ID"
                                     }),
                                     search.createColumn({ name: "scriptid", label: "Script ID" }),
                                     search.createColumn({ name: "custrecord_pct_billing_otp_email", label: "Email" }),
                                     search.createColumn({ name: "custrecord_pct_billing_otp_pin", label: "PIN" }),
                                     search.createColumn({ name: "custrecord_pct_billing_otp_time", label: "Time" }),
                                     search.createColumn({ name: "custrecord_pct_billing_otp_ip", label: "IP" })
                                 ]
                         });
                         var searchResultCount = customrecord_pct_billing_otpSearchObj.runPaged().count;
                         log.debug("customrecord_pct_billing_otpSearchObj result count", searchResultCount);
                         customrecord_pct_billing_otpSearchObj.run().each(function (result) {
                             // .run().each has a limit of 4,000 results
                             return true;
                         });
                         return searchResultCount
                     }
                     catch (ex) {
                         redirectToLoginPage();

                     }

                 }

                 function redirectToLoginPage() {
                     redirect.toSuitelet({
                         scriptId: 'customscript_pct_billing_login_email',
                         deploymentId: 'customdeploy_pct_billing_login_email',
                         isExternal: true,
                         /*parameters: {
                             'custparam_userName': isUserExisit.userName,
                             'custparam_userId': isUserExisit.userId,
                             'custparam_ip' : ip,
                             'custparam_user_agent' : user_agent
                         }*/
                     });
                 }




                 //var userName = context.request.parameters.custparam_userName;
                 //var userId1 = context.request.headers['user-id'];
                 log.debug({
                     title: 'Fetched ID',
                     details: userId
                 })
                 //var userId=424;


                 if (cookie != '') {
                     var validUrl = urlValidation(USERDevice, deviceip, userId, cookie)
                 }
                 if (validUrl == 0) {
                     redirectToLoginPage();
                 }


                 log.debug({
                     title: 'in POST',
                     details: 'in POST'
                 })
                 var userId = context.request.parameters.custparam_userId;
                 var so_file_id = file.load({
                     id: 'SuiteScripts/PCT BILLING Web Application/PCT BILLING/PCT BILLING JSON SO DATA/soData.json'
                 })
                 log.debug({
                     title: 'so_file_id',
                     details: so_file_id
                 })
                 var so_file_content = so_file_id.getContents()
                 log.debug({
                     title: 'so_file_content',
                     details: so_file_content
                 })
                 var soObj = JSON.parse(so_file_content);
                 var soName = new Array();
                 var custName = new Array();
                 for (var i = 0; i < soObj.length; i++) {
                     var soDoc = soObj[i];
                     soName[i] = soDoc.document_number;
                     custName[i] = soDoc.entity;
                 }
                 var inv_file_id = file.load({
                     id: 'SuiteScripts/PCT BILLING Web Application/PCT BILLING/PCT BILLING JSON INVOICE DATA/invData.json'
                 })
                 log.debug({
                     title: 'inv_file_id',
                     details: inv_file_id
                 })
                 var inv_file_content = inv_file_id.getContents()
                 log.debug({
                     title: 'inv_file_content',
                     details: inv_file_content
                 })
                 var invObj = JSON.parse(inv_file_content);
                 var invName = new Array();
                 var invCust = new Array();
                 for (var i = 0; i < invObj.length; i++) {
                     var invDoc = invObj[i];
                     invName[i] = invDoc.document_number;
                     invCust[i] = invDoc.entity;
                 }



                 var transactionId = context.request.parameters.cust_id;
                 var invId = context.request.parameters.inv_id;



                 if (transactionId) {
                     transactionId = transactionId.split(" ")[0];
                     log.debug({
                         title: `PCT-Billing`,
                         details: `Transaction ID: ${transactionId}`
                     });
                     var transactionSearchObj = search.create({
                         type: "salesorder",
                         filters:
                             [
                                 ["type", "anyof", "SalesOrd"],
                                 "AND",
                                 ["numbertext", "is", transactionId],
                                 "AND",
                                 ["mainline", "is", "F"],
                                 "AND",
                                 ["item.internalidnumber", "greaterthan", "0"]

                             ],
                         columns:
                             [
                                 search.createColumn({
                                     name: "itemid",
                                     join: "item",
                                     label: "Name"
                                 }),
                                 search.createColumn({ name: "rate", label: "Item Rate" }),
                                 search.createColumn({ name: "quantity", label: "Quantity" }),
                                 search.createColumn({
                                     name: "quantityavailable",
                                     join: "item",
                                     label: "Available"
                                 }),
                                 search.createColumn({ name: "quantityshiprecv", label: "Quantity Fulfilled/Received" }),
                                 search.createColumn({
                                     name: "internalid",
                                     join: "item",
                                     label: "Internal ID"
                                 }),
                                 search.createColumn({
                                     name: "type",
                                     join: "item",
                                     label: "Type"
                                 }),
                                 search.createColumn({ name: "internalid", label: "Internal ID" })

                             ]
                     });
                     var transactionSearchCount = transactionSearchObj.runPaged().count;
                     var transactionSearchResult = transactionSearchObj.run().getRange({ start: 0, end: transactionSearchCount });
                     log.debug({
                         title: 'Count:',
                         details: transactionSearchCount
                     })
                     var content = `<!DOCTYPE html>` +
                         `<html lang="en">` +
                         `` +
                         `<head>` +
                         `    <title>PCT Billing</title>` +
                         `    <meta charset="utf-8">` +
                         `    <meta name="viewport" content="width=device-width, initial-scale=1">` +
                         `    <link rel="icon" href="${pct_logo}">` +
                         `    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">` +
                         `    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>` +
                         `    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>` +
                         '<script type="text/javascript">' +
                         ' window.history.forward();' +
                         'function noBack() {' +
                         'window.history.forward();' +
                         '}' +
                         '</script>' +

                         `</head>` +
                         `<style>` +
                         `    img.logo-navbar {` +
                         `        width: 2.5rem !important;` +
                         `        height: 2.5rem !important;` +
                         `    }` +
                         `    .item-table {` +
                         `        background-color: #f5f4f5;` +
                         `        margin: 10px 0px 0px 1px;` +
                         `        padding: 5px;` +
                         `        border-radius: 5px;` +
                         `        text-align: center;` +
                         `        vertical-align: middle;` +
                         `    }` +
                         `    .top-buffer {` +
                         `        margin-top: 10px;` +
                         `    }` +
                         `</style>` +
                         `<body>` +

                         `    <nav class="navbar navbar-default">` +
                         `        <div class="container-fluid">` +
                         `            <div class="navbar-header">` +
                         `                <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">` +
                         `                    <span class="icon-bar"></span>` +
                         `                    <span class="icon-bar"></span>` +
                         `                    <span class="icon-bar"></span>` +
                         `                </button>` +
                         `                <a class="navbar-brand" href="#"><img src="${pct_logo}"` +
                         `                        class="logo-navbar" width="auto" height="auto"></a>` +
                         `            </div>` +
                         `            <div class="collapse navbar-collapse" id="myNavbar">` +
                         `                <ul class="nav navbar-nav navbar-right">` +
                         `                    <li><a><span class="glyphicon glyphicon-user"></span>${userId}</a></li>` +
                         `                    <li><a href=\'scriptlet.nl?script=196&deploy=1&compid=7255402&h=38a57cec7478fc49f8d3\'><span class="glyphicon glyphicon-off"></span> Logout</a></li>` +
                         `                </ul>` +
                         `            </div>` +
                         `        </div>` +
                         `    </nav>` +
                         `    <div class="container">` +
                         `                <form class="form-inline" id="url" action="" enctype="multipart/form-data" method="post">` +
                         `        <div class="row" style="padding: 0px; margin: 0px;">` +

                         // `            <div class="col-xs-12">` +

                         // `                    <div class="form-group">` +
                         // `                        <label class="sr-only" for="cust_id">Customer Name:</label>` +
                         // `                        <input type="text" class="form-control" id="cust_id" placeholder="Customer Name:"` +
                         // `                            name="cust_id" value="${custId}">` +


                         // `                    </div>` +



                         // `            </div>` +

                         `            <div class="col-xs-12">` +
                         ` <div class="col-1 text-center">` + //`<label for="pwd" id="date">${datetime}</label>` +
                         `</div>` +
                         `                    <div class="form-group">` +
                         `                        <label class="sr-only" for="cust_id">So Number:</label>` +
                         `                        <input list="Customer" class="form-control" id="cust_id" placeholder="Sales Orders:"` +
                         `                            name="cust_id" value="${transactionId}" required>` +
                         `<datalist id="Customer">`;
                     for (i = 0; i < soName.length; i++) {
                         content += `<option value="${soName[i]} -- Customer: ${custName[i]}"/>`;
                     }


                     content += `</datalist>` +
                         // `<button type="button" onclick="getInputValue();">Get Value</button>`
                         `                    </div>` +
                         `                    <button type="submit" class="btn btn-primary primary">Submit</button>` +


                         `            </div>` +





                         `        </div>` +
                         `                </form>` +
                         `    </div>` +
                         `            <div class="col-xs-12">`;

                     if (parseInt(transactionSearchCount) === 0) {
                         log.debug({
                             title: 'Loop',
                             details: "Inside 0"
                         })
                         content += `            </div>` +
                             `        </div>` +
                             `    </div>` +
                             `    <script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>` +
                             `</body>` +


                             '<script>' +
                             // `    $(document).ready(function () {` +
                             '$(".primary").click(function(){' +


                             `                swal({` +
                             `                        title: \`Loading\`,` +
                             `                        text: \`Please Wait..\`,` +
                             `                        icon: \`info\`,` +
                             `                    });` +

                             `            ` +
                             `        });` +
                             `                swal({` +
                             `                        title: \`Error\`,` +
                             `                        text: \`Enter a valid sales order\`,` +
                             `                        icon: \`error\`,` +
                             `                    });` +
                             //  `    });` +
                             `</script>` +
                             `</html>`;


                     }
                     else {
                         content += `    <script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>` +
                             '<script>' +
                             // `    $(document).ready(function () {` +
                             '$(".primary").click(function(){' +
                             `                swal({` +
                             `                        title: \`Loading..\`,` +
                             `                        text: \`Please Wait..\`,` +
                             `                        icon: \`info\`,` +
                             `                    });` +
                             `            ` +
                             `        });` +
                             `                swal({` +
                             `                        title: \`Success!\`,` +
                             `                        text: \`Sales Order Found\`,` +
                             `                        icon: \`success\`,` +
                             `                    });` +
                             //  `    });` +
                             `</script>`;
                         for (var transactionIndex = 0; transactionIndex < parseInt(transactionSearchCount); transactionIndex++) {
                             var rowCount = parseInt(transactionIndex) + 1;
                             transactionRate = transactionSearchResult[transactionIndex].getValue({ name: "rate" });
                             transactionItem = transactionSearchResult[transactionIndex].getValue({ name: "itemid", join: "item" });
                             transactionQuantity = transactionSearchResult[transactionIndex].getValue({ name: "quantity" });
                             transactionQuantityAvailable = transactionSearchResult[transactionIndex].getValue({ name: "quantityavailable", join: "item" });
                             transactionIntId = transactionSearchResult[transactionIndex].getValue({ name: "internalid", join: "item" });
                             transactionBilled = transactionSearchResult[transactionIndex].getValue({ name: "quantityshiprecv" });
                             transactionItemType = transactionSearchResult[transactionIndex].getValue({ name: "type", join: "item" });
                             salesorderId = transactionSearchResult[transactionIndex].getValue({ name: "internalid" });
                             // var salesorderId=salesorderIdArray[0];

                             log.debug({
                                 title: 'PCT-billing',
                                 details: 'Type:' + transactionItemType
                             });
                             // var strItemType=transactionItemType.toString;
                             if (transactionItemType == 'TaxItem') {
                                 log.debug({
                                     title: 'PCT-billing',
                                     details: `In Condition: ${typeof (transactionItemType)}`
                                 });
                             }
                             else if (transactionItemType == 'Discount') {
                                 log.debug({
                                     title: 'PCT-billing',
                                     details: `In Condition: ${typeof (transactionItemType)}`
                                 });
                             }
                             else {
                                 transactionQuantity = parseInt(transactionQuantity) - parseInt(transactionBilled);
                                 content += `<div class="row item-table item-${rowCount}">` +
                                     `                    <div class="col-xs-12">` +
                                     `                        <div class="row">` +
                                     `                            <div class="col-xs-12 col-sm-3 top-buffer ">` +
                                     `                                <lable for="item-name">Item</lable>` +
                                     `                                <input type="text" class="form-control" id="item-name" value="${transactionItem}" name="item_name" disabled>` +
                                     `                                <input type="hidden" class="form-control" id="item_id" value="${transactionIntId}" name="item_id" disabled>` +
                                     `                                <input type="hidden" class="form-control" id="salesorder_id" value="${salesorderId}" disabled>` +
                                     `                            </div>` +
                                     `                            <div class="col-xs-12 col-sm-2 top-buffer">` +
                                     `                                <lable for="available-quantity">Available</lable>` +
                                     `                                <input type="number" class="form-control" class="available-quantity"` +
                                     `                                    name="available_quantity" value="${transactionQuantityAvailable}" min="0" oninput="validity.valid||(value=\`\`);" disabled>` +
                                     `                            </div>` +
                                     `                            <div class="col-xs-12 col-sm-2 top-buffer">` +
                                     `                                <lable for="shipped-quantity">Shipped</lable>` +
                                     `                                <input type="number" class="form-control" class="shipped-quantity"` +
                                     `                                    name="shipped_quantity" value="${transactionBilled}" min="0" oninput="validity.valid||(value=\`\`);" disabled>` +
                                     `                            </div>` +
                                     `                            <div class="col-xs-12 col-sm-2 top-buffer">` +
                                     `                                <lable for="quantity">Quantity</lable>` +
                                     `                                <input type="number" class="form-control" class="quantity" name="quantity" value="${transactionQuantity}" min="0" oninput="validity.valid||(value=\`\`);" disabled>` +
                                     `                            </div>` +
                                     `                            <div class="col-xs-12 col-sm-2 top-buffer">` +
                                     `                                <lable for="price">Price</lable>` +
                                     `                                <input type="number" class="form-control" class="price" name="price" value="${transactionRate}" min="0" oninput="validity.valid||(value=\`\`);" disabled>` +
                                     `                            </div>` +
                                     `                            <div class="col-xs-12 col-sm-1 top-buffer">` +
                                     `                                <div class="row">` +
                                     `                                    <div class="col-xs-12">` +
                                     `                                        <label for="remove-button"> </label>` +
                                     `                                    </div>` +
                                     // `                                    <div class="col-xs-12" style="margin-top:-6px;">` +
                                     // `                                        <button type="button" class="btn btn-danger remove-button line-${rowCount}"><span` +
                                     // `                                                class="glyphicon glyphicon-trash"></span></button>` +
                                     // `                                    </div>` +
                                     `                                </div>` +
                                     `                            </div>` +
                                     `                        </div>` +
                                     `                    </div>` +
                                     `                </div>`;
                             }

                         }
                         content +=
                             `        <div class="text-center" style="margin-top:5px;margin-bottom:5px">` +
                             `             <button type="button" class="btn btn-primary"  id="generate">Generate Invoice</button>` +
                             `</div>` +
                             `        <div class="text-center" style="margin-bottom:5px">` +
                             `             <button type="button" class="btn btn-danger"  id="go_back">Go Back</button>` +
                             `</div>`;
                         content +=
                             `            </div>` +
                             `        </div>` +
                             `    </div>` +
                             `    <script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>` +
                             `</body>`;



                         content += `<script>` +

                             `    $("#generate").click(function(){` +


                             `$(location).attr('href','https://7255402.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=203&recordname=${salesorderId}&deploy=1&compid=7255402&h=948b7c05170081bcb1d2'` +

                             `);` +
                             `    });` +


                             `    $("#generate_invoice").click(function(){` +


                             `$(location).attr('href','https://7255402.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=204&recordname=${invIntId}&deploy=1&compid=7255402&h=2d71d4925fcc37fa7ce5'` +

                             `);` +
                             `    });` +
                             `    $("#go_back").click(function(){` +


                             `$(location).attr('href','https://7255402.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=202&deploy=1&compid=7255402&h=87a1ee9455ec305f7ed6'` +

                             `);` +
                             `    });` +


                             `	document.getElementById("url").action = window.location.href;` +
                             `    $(document).ready(function () {` +
                             `        $(".remove-button").click(function () {` +
                             `            const currentClass = $(this).attr(\`class\`);` +
                             `            const getClass = currentClass.split(" ");` +
                             `            const line = getClass[3].split("-");` +
                             `            var totalRows = $(\`.item-table\`).length;` +
                             `            if(parseInt(totalRows-1) == 0)` +
                             `            {` +
                             `                swal({` +
                             `                        title: \`Oops!\`,` +
                             `                        text: \`You have to select at least 1 line\`,` +
                             `                        icon: \`error\`,` +
                             `                    });` +
                             `            }` +
                             `            else` +
                             `            {` +
                             `                $(\`.item-\`+line[1]).remove();` +
                             `            }` +
                             `            ` +
                             `        });` +
                             `    });` +
                             `</script>` +
                             `</html>`;
                         log.debug({
                             title: `PCT-Billing`,
                             details: salesorderId
                         });
                     }


                 }
                 else {
                     invId = invId.split(" ")[0];
                     log.debug({
                         title: 'Invoice given',
                         details: invId
                     })
                     var invoiceSearchObj = search.create({
                         type: "invoice",
                         filters:
                             [
                                 ["type", "anyof", "CustInvc"],
                                 "AND",
                                 ["mainline", "is", "T"],
                                 "AND",
                                 ["numbertext", "is", invId],
                             ],
                         columns:
                             [
                                 search.createColumn({ name: "internalid", label: "Internal ID" })
                             ]
                     });
                     var searchResultCount = invoiceSearchObj.runPaged().count;

                     if (searchResultCount != 0) {
                         var invoiceSearchResult = invoiceSearchObj.run().getRange({ start: 0, end: searchResultCount });
                         var invIntId = invoiceSearchResult[0].getValue({ name: "internalid" });
                     }
                     log.debug({
                         title: "Invoice number",
                         details: invIntId
                     })

                     var content = `<!DOCTYPE html>` +
                         `<html lang="en">` +
                         `` +
                         `<head>` +
                         `    <title>PCT Billing</title>` +
                         `    <meta charset="utf-8">` +
                         `    <meta name="viewport" content="width=device-width, initial-scale=1">` +
                         `    <link rel="icon" href="${pct_logo}">` +
                         `    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">` +
                         `    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>` +
                         `    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>` +
                         '<script type="text/javascript">' +
                         ' window.history.forward();' +
                         'function noBack() {' +
                         'window.history.forward();' +
                         '}' +
                         '</script>' +
                         `</head>` +
                         `<style>` +
                         `    img.logo-navbar {` +
                         `        width: 2.5rem !important;` +
                         `        height: 2.5rem !important;` +
                         `    }` +
                         `    .item-table {` +
                         `        background-color: #f5f4f5;` +
                         `        margin: 10px 0px 0px 1px;` +
                         `        padding: 5px;` +
                         `        border-radius: 5px;` +
                         `        text-align: center;` +
                         `        vertical-align: middle;` +
                         `    }` +
                         `    .top-buffer {` +
                         `        margin-top: 10px;` +
                         `    }` +
                         `</style>` +
                         `<body>` +

                         `    <nav class="navbar navbar-default">` +
                         `        <div class="container-fluid">` +
                         `            <div class="navbar-header">` +
                         `                <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">` +
                         `                    <span class="icon-bar"></span>` +
                         `                    <span class="icon-bar"></span>` +
                         `                    <span class="icon-bar"></span>` +
                         `                </button>` +
                         `                <a class="navbar-brand" href="#"><img src="${pct_logo}"` +
                         `                        class="logo-navbar" width="auto" height="auto"></a>` +
                         `            </div>` +
                         `            <div class="collapse navbar-collapse" id="myNavbar">` +
                         `                <ul class="nav navbar-nav navbar-right">` +
                         //     `                    <li><a><span class="glyphicon glyphicon-user"></span> User Name</a></li>` +
                         `                    <li><a href=\'scriptlet.nl?script=196&deploy=1&compid=7255402&h=38a57cec7478fc49f8d3\'><span class="glyphicon glyphicon-off"></span> Logout</a></li>` +
                         `                </ul>` +
                         `            </div>` +
                         `        </div>` +
                         `    </nav>`;
                     content += `                    <div class="text-center" style="margin-bottom:5px">` +
                         ` <div class="col-1">` + //`<label for="pwd" id="date">${datetime}</label>` + 
                         `</div>` +

                         `                   <button type="button" class="btn btn-primary"  id="generate_invoice">Print ${invId}</button>` +

                         `            </div>` +
                         `                    <div class="text-center" style="margin-bottom:5px">` +

                         `                   <button type="danger" class="btn btn-danger"  id="go_back">Go Back</button>` +

                         `            </div>`;
                     content += `<script>` +
                         `    $("#go_back").click(function(){` +


                         `$(location).attr('href','https://7255402.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=202&deploy=1&compid=7255402&h=87a1ee9455ec305f7ed6'` +

                         `);` +
                         `    });` +
                         `    $("#generate_invoice").click(function(){` +


                         `$(location).attr('href','https://7255402.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=204&recordname=${invIntId}&deploy=1&compid=7255402&h=2d71d4925fcc37fa7ce5'` +

                         `);` +
                         `    });` +
                         `</script>` +
                         `</body>` +
                         `</html>`;

                 }


                 context.response.write(content);
                 log.debug({
                     title: `PCT-Billing`,
                     details: `End`
                 });


             }
         }

         return {
             onRequest: onRequest
         };

     });