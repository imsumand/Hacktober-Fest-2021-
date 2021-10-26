/**
 *              //////////     PMC CRM 2.0 | HOME PAGE SUITELET (MAIN PAGE/SCANNER PAGE)     //////////
 * 
 *@author       Rajesh Nandi
*@NApiVersion  2.1
*@NScriptType  Suitelet
*@NModuleScope SameAccount
*@since        2021-03-25 yyyy-MM-dd
*@copyright    Paapri Business Technologies (India) Pvt Ltd.
*@license      The SuiteScript 2.0 code in this page is for PMC CRM, you can redistribute
                it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.
                
*@description  This Suitelet is used to scan ticket and complete operations, for every action it will create 
*              a PMC Transation record.
*/
define(['N/file', 'N/render', 'N/search', 'N/log', 'N/redirect', 'N/url', 'N/record', 'N/format', 'N/runtime'],
    function (file, render, search, log, redirect, url, record, format, runtime) {
        /**
         * Definition of the Suitelet script trigger point.
         * 
         * @param {Object} context 
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {Serverresponse} context.response - Encapsulation of the Suitelet response
         */
        var _response;
        var _request;
        function onRequest(context) {
            // Pre data source
            // NoteL All global variables are start with '_' sign
            _request = context.request;
            _response = context.response;

            if (_request.method == 'GET') {
                // Getting Params [GET REQUEST]
                try {
                    var decodedCookie = context.request.headers['cookie']

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
                        title: 'passVal',
                        details: passVal
                    })
                } catch (ex) {
                    redirectToLoginPage();
                }

                var USERDevice = context.request.headers['user-agent']
                var deviceip = context.request.headers['ns-client-ip'];

                var cookie = passVal;

                

                var userName = _request.parameters.custparam_userName;
                var userId = _request.parameters.custparam_userId;


                if (cookie != '') {
                    var validUrl = urlValidation(USERDevice, deviceip, userId, cookie)
                }
                if (validUrl == 0) {
                    redirectToLoginPage();
                }


                var cust_file_id = file.load({
                    id: './PCT CRM JSON CUSTOMER DATA/customerData.json'
                })
                
                log.debug({
                    title: 'cust_file_id',
                    details: cust_file_id
                })
                var cust_file_content = cust_file_id.getContents()
                log.debug({
                    title: 'cust_file_content',
                    details: cust_file_content
                })


                //item JSON FILE
                var item_file_id = file.load({
                    id: './PCT CRM JSON ITEM DATA/itemData.json'
                })
                log.debug({
                    title: 'item_file_id',
                    details: item_file_id
                })
                var item_file_content = item_file_id.getContents()
                log.debug({
                    title: 'item_file_content',
                    details: item_file_content
                })
                //end of item json file

                // var customerJsonId = getFileId('PCT CRM JSON CUSTOMER DATA');


                // Getting the external url of all pages.
                var logoutPageUrl = GetLogoutPageUrl();
                //var breakPageUrl = GetBreakPageUrl();
                var homePageUrl = GetHomePageUrl();
                
               // var loginPageUrl = GetLoginPageUrl();
                //var woCompletionUrl = GetWOCompletionUrl();
                var totalRow = _request.parameters.input_row;
                log.debug({
                    title: 'totalRow',
                    details: totalRow
                });




                // This block is execute when you come from login page
                // Go to the Home Page
                // NOte: qrCode is ticketNumber,
                PageRenderer(userId, userName, logoutPageUrl, homePageUrl, cust_file_content, item_file_content, 'HOME_PAGE', '');



            } else {// POST REQUEST BODY
                // Getting Params [POST REQUEST]

                //var requestedObject = _request.parameters;


                log.debug({
                    title: 'in POST',
                    details: 'in POST'
                })
                var userName = _request.parameters.custparam_userName;
                var userId = _request.parameters.custparam_userId;
                var totalRow = _request.parameters.input_row;
                var customer = _request.parameters.custparam_customer;


                try {
                    var decodedCookie = context.request.headers['cookie']

                    if (decodedCookie == '') {
                        redirectToLoginPage();
                    }

                    var decodedCookieArr = new Array();
                    decodedCookieArr = decodedCookie.split(';');
                    var indexOfArr = getIndexOf(decodedCookieArr)
                    var passVal = decodedCookieArr[indexOfArr].trim();

                    log.debug({
                        title: 'passVal',
                        details: passVal
                    })
                } catch (ex) {
                    redirectToLoginPage();
                }

                var USERDevice = context.request.headers['user-agent'];
                var deviceip = context.request.headers['ns-client-ip'];
                //var cookie = context.request.headers['cookie']
                var cookie = passVal;
                if (cookie != '') {
                    var validUrl = urlValidation(USERDevice, deviceip, userId, cookie)
                }

                if (validUrl == 0 || cookie == '') {
                    redirectToLoginPage();
                }



                var customerId = getCustomerId(customer);


                log.debug({
                    title: 'totalRow',
                    details: totalRow
                });


                if (customerId > 0) {
                    var custom_record = record.create({
                        type: 'customrecord_pct_crm_record',
                        isDynamic: true
                    });

                    custom_record.setValue({
                        fieldId: 'custrecord_pct_crm_customer',
                        value: customerId
                    })



                    for (var row = 1; row <= totalRow; row++) {
                        itemRowName = 'input_row_item' + row; //input_row_item1

                        var item = _request.parameters['input_row_item' + row];
                        var qty = _request.parameters['input_row_qty' + row];
                        var desc = _request.parameters['input_row_desc' + row];
                        var rate = _request.parameters['input_row_rate' + row];
                        var amount = _request.parameters['input_row_amount' + row];

                        var itemId = 0;
                        if (item == ' ' || item == '' || item == 'undefined' || item == null) {


                        } else {
                            itemId = getItemId(item);
                        }

                        log.debug({
                            title: 'sales_detais',
                            details: itemRowName + ' itemRowName  ' + item + ' qty = ' + qty + ' itemId=' + itemId
                        })

                        if (itemId > 0) {
                            custom_record.selectNewLine({ sublistId: 'recmachcustrecord_pct_crm_link' });



                            custom_record.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_pct_crm_link',
                                fieldId: 'custrecord_pct_crm_item',
                                value: itemId
                            });

                            custom_record.setCurrentSublistText({
                                sublistId: 'recmachcustrecord_pct_crm_link',
                                fieldId: 'custrecord_pct_crm_desc',
                                text: desc
                            });

                            custom_record.setCurrentSublistText({
                                sublistId: 'recmachcustrecord_pct_crm_link',
                                fieldId: 'custrecord_pct_crm_quantity',
                                text: qty
                            });

                            custom_record.setCurrentSublistText({
                                sublistId: 'recmachcustrecord_pct_crm_link',
                                fieldId: 'custrecord_pct_crm_rate',
                                text: rate
                            });

                            custom_record.setCurrentSublistText({
                                sublistId: 'recmachcustrecord_pct_crm_link',
                                fieldId: 'custrecord_pct_crm_amount',
                                text: amount
                            });

                            custom_record.commitLine({ sublistId: 'recmachcustrecord_pct_crm_link' });
                        }


                    }
                    var id = custom_record.save();
                    log.debug({
                        title: 'id',
                        details: id
                    })
                }

                var crmId = getCrmId(id);
                
                var logoutPageUrl = GetLogoutPageUrl();
                var homePageUrl = GetHomePageUrl();
                
                PageRenderer(userId, userName, logoutPageUrl, homePageUrl, '', '', 'COMPLETE', crmId);
            }// POST END
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
                var customrecord_pct_crm_otpSearchObj = search.create({
                    type: "customrecord_pct_crm_otp",
                    filters:
                        [
                            ["custrecord_pct_crm_otp_employee", "anyof", userId],
                            "AND",
                            ["custrecord_pct_crm_otp_ip", "is", deviceip],
                            "AND",
                            ["custrecord_pct_crm_otp_device", "is", USERDevice],
                            "AND",
                            ["custrecord_pct_crm_otp_cookie", "is", cookie]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "id",
                                sort: search.Sort.ASC,
                                label: "ID"
                            }),
                            search.createColumn({ name: "scriptid", label: "Script ID" }),
                            search.createColumn({ name: "custrecord_pct_crm_otp_email", label: "Email" }),
                            search.createColumn({ name: "custrecord_pct_crm_otp_pin", label: "PIN" }),
                            search.createColumn({ name: "custrecord_pct_crm_otp_time", label: "Time" }),
                            search.createColumn({ name: "custrecord_pct_crm_otp_ip", label: "IP" })
                        ]
                });
                var searchResultCount = customrecord_pct_crm_otpSearchObj.runPaged().count;
                log.debug("customrecord_pct_crm_otpSearchObj result count", searchResultCount);
                customrecord_pct_crm_otpSearchObj.run().each(function (result) {
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
                scriptId: 'customscript_pct_crm_sl_login_email_page',
                deploymentId: 'customdeploy_pct_crm_sl_login_email_page',
                isExternal: true,
                /*parameters: {
                    'custparam_userName': isUserExisit.userName,
                    'custparam_userId': isUserExisit.userId,
                    'custparam_ip' : ip,
                    'custparam_user_agent' : user_agent
                }*/
            });
        }

        //==================================================== Helper Methods =======================================//
        function getCrmId(id) {
            var customrecord_pct_crm_recordSearchObj = search.create({
                type: "customrecord_pct_crm_record",
                filters:
                    [
                        ["internalid", "anyof", id]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "name",
                            sort: search.Sort.ASC,
                            label: "ID"
                        })
                    ]
            });
            var crmNo;
            var searchResultCount = customrecord_pct_crm_recordSearchObj.runPaged().count;
            log.debug("customrecord_pct_crm_recordSearchObj result count", searchResultCount);
            customrecord_pct_crm_recordSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                // return true;
                crmNo = result.getValue({
                    name: "name",
                    sort: search.Sort.ASC,
                    label: "ID"
                })
            });
            return crmNo;
        }

        /**
         * 
         * This method is used toGet the customer id
         * 
         * @param {string} customer 
         */
        function getCustomerId(customer) {
            //PCT CRM Customer Search
            //https://tstdrv2356536.app.netsuite.com/app/common/search/search.nl?cu=T&e=T&id=2435
            var customerSearchObj = search.create({
                type: "customer",
                filters:
                    [
                        ["stage", "anyof", "CUSTOMER"],
                        "AND",
                        ["entityid", "is", customer]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            });
            var custId;
            var searchResultCount = customerSearchObj.runPaged().count;
            log.debug("customerSearchObj result count", searchResultCount);
            customerSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                //return true;
                custId = result.getValue({ name: "internalid" });
            });
            return custId;
        }

        /**
         * 
         * This method is used toGet the item id
         * 
         * @param {string} item 
         */

        function getItemId(item) {
            log.debug({
                title: 'item Name',
                details: item
            })
            //PCT CRM Item Search
            //https://tstdrv2356536.app.netsuite.com/app/common/search/search.nl?cu=T&e=T&id=2433
            var itemSearchObj = search.create({
                type: "item",
                filters:
                    [
                        [["name", "is", item], "OR", ["displayname", "is", item], "OR", ["description", "is", item], "OR", ["upccode", "is", item]]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            });
            if (itemSearchObj != null) {
                var searchResultCount = itemSearchObj.runPaged().count;
                log.debug("itemSearchObj result count", searchResultCount);
                var itemId = 0;

                itemSearchObj.run().each(function (result) {
                    // .run().each has a limit of 4,000 results
                    itemId = result.getValue({ name: "internalid", label: "Internal ID" });
                    //  return true;
                });
            }
            return itemId;
        }


        /**
         * This method is used to render the Home Page
         * 
         * @param {string} userId 
         * @param {string} userName 
         * @param {string} logoutPageUrl 
         * @param {string} homePageUrl 
         * @param {string} status 
         */
        function PageRenderer(userId, userName, logoutPageUrl, homePageUrl, cust_file_content, item_file_content, status, cust_record_id) {

            var faviconUrl = GetFaviconImgUrl();
            // Assemble Data Source for Home Page
            var dataSource = {
                userId: userId,
                userName: userName,
                status: status,
                cust_record_id: cust_record_id,
                homePageUrl: homePageUrl,
                logoutPageUrl: logoutPageUrl,
                cust_file_content: cust_file_content,
                item_file_content: item_file_content,
                faviconUrl: faviconUrl
            };

            var templateFile = file.load({ id: './PMC CRM Web Application/PMC CRM 2.0 Templates/pct_crm_home_page.html' });
            var pageRenderer = render.create();
            pageRenderer.templateContent = templateFile.getContents();
            pageRenderer.addCustomDataSource({
                format: render.DataSource.OBJECT,
                alias: 'ds',
                data: dataSource
            });

            log.debug({
                title: 'page render to home page after post',
                details: 'page render to home page after post'
            })
            var renderedPage = pageRenderer.renderAsString();
            _response.write(renderedPage);
        }


        /**
         * This method is used to render the Home Page
         * 
         * @param {string} userId 
         * @param {string} userName 
         * @param {string} loginRecordId 
         * @param {string} startRecordId 
         * @param {string} logoutPageUrl 
         * @param {string} breakPageUrl 
         * @param {string} homePageUrl 
         * @param {string} woCompletionUrl 
         * @param {string} ticketNumber 
         * @param {string} mode 
         * @param {string} dataObj 
         */
        function PageRendererByMode(userId, userName, todayQuantity, loginRecordId, startRecordId, logoutPageUrl, breakPageUrl, homePageUrl, woCompletionUrl, ticketNumber, mode, dataObj) {

            var quantity = dataObj.quantity;
            var completedQuantity = dataObj.completedQuantity;
            var remainingQuantity = quantity - completedQuantity;
            var faviconUrl = GetFaviconImgUrl();

            // Assemble Data Source for Home Page
            var dataSource = {
                userId: userId,
                userName: userName,
                loginRecordId: loginRecordId,
                startRecordId: startRecordId,
                logoutPageUrl: logoutPageUrl,
                breakPageUrl: breakPageUrl,
                opInternalId: dataObj.internalId,
                name: dataObj.name,
                status: dataObj.status,
                sequence: dataObj.sequence,
                workorder: dataObj.workorder,
                item: dataObj.item,
                quantity: quantity,
                completedQuantity: completedQuantity,
                remainingQuantity: remainingQuantity,
                mode: mode,
                ticketNumber: ticketNumber,
                homePageUrl: homePageUrl,
                woCompletionUrl: woCompletionUrl,
                todayQuantity: todayQuantity,
                faviconUrl: faviconUrl
            };

            var templateFile = file.load({ id: './PMC CRM Web Application/PMC CRM 2.0 Templates/pct_crm_home_page.html' });
            var pageRenderer = render.create();
            pageRenderer.templateContent = templateFile.getContents();
            pageRenderer.addCustomDataSource({
                format: render.DataSource.OBJECT,
                alias: 'ds',
                data: dataSource
            });
            var renderedPage = pageRenderer.renderAsString();
            _response.write(renderedPage);
        }

        /**
         * 
         * @param {string} userId 
         */
        function GetTodayUnitCount(userId) {
            var count = 0;
            var searchObject = search.create({
                type: "customrecord_pct_crm_transaction_tab",
                filters:
                    [
                        ["custrecord_pct_crm_trans_date", "on", "today"],
                        "AND",
                        ["custrecord_pct_crm_trans_emp_name", "anyof", userId],
                        "AND",
                        ["custrecord_pct_crm_trans_action_type", "anyof", "4"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "custrecord_pct_crm_trans_qty", label: "Quantity" })
                    ]
            });
            var searchResultCount = searchObject.runPaged().count;
            log.debug("Team Innovation | PMC CRM 2.0", "searchResultCount = " + searchResultCount);
            if (searchResultCount > 0) {
                searchObject.run().each(function (result) {
                    // .run().each has a limit of 4,000 results
                    count = count + parseInt(result.getValue({ name: 'custrecord_pct_crm_trans_qty' }));
                    return true;
                });
            } else {
                return count;
            }

            return count;

        }


        /**
         * This method return Manufacturing Operation Task Details
         * 
         * @param {string} internalId - operation's internal id
         */
        function GetManufacturingOperationDetails(internalId) {
            var searchResults = new Object();
            var mfgOpTaskSearchObj = search.create({
                type: "manufacturingoperationtask",
                filters:
                    [
                        ["status", "anyof", "PROGRESS", "NOTSTART", "COMPLETE"],
                        "AND",
                        ["internalid", "anyof", internalId],
                        "AND",
                        ["workorder.mainline", "is", "T"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" }),
                        search.createColumn({ name: "name", label: "Operation Name" }),
                        search.createColumn({ name: "status", label: "Status" }),
                        search.createColumn({ name: "sequence", label: "Operation Sequence" }),
                        search.createColumn({ name: "workorder", label: "Work Order" }),
                        search.createColumn({ name: "item", join: "workOrder", label: "Item" }),
                        search.createColumn({ name: "quantity", join: "workOrder", label: "Quantity" }),
                        search.createColumn({ name: "completedquantity", label: "Completed Quantity" })
                    ]
            });
            var searchResultCount = mfgOpTaskSearchObj.runPaged().count;
            if (searchResultCount > 0) {
                mfgOpTaskSearchObj.run().each(function (result) {
                    searchResults.internalid = result.getValue({ name: 'internalid' });
                    searchResults.name = result.getValue({ name: 'name' });
                    searchResults.status = result.getValue({ name: 'status' });
                    searchResults.sequence = result.getValue({ name: 'sequence' });
                    searchResults.workorder = result.getValue({ name: 'workorder' });
                    searchResults.item = result.getText({ name: "item", join: "workOrder", label: "Item" });
                    searchResults.quantity = result.getValue({ name: "quantity", join: "workOrder", label: "Quantity" });
                    searchResults.completedQuantity = result.getValue({ name: 'completedquantity' });
                    searchResults.isSuccess = true;
                    return true;
                });
            } else {
                searchResults.isSuccess = false;
            }

            return searchResults;
        }

        /**
         * This method split the ticket number to operation's internal id
         * 
         * @param {string} ticketNumber - 10/1234
         */
        function SplitInternalId(ticketNumber) {
            if (ticketNumber.length == 0)
                return 0;
            else
                return ticketNumber.split('/')[1];
        }

        /**
         * This method is used craete the custom record i.e. PCT PMC Transaction Table.
         * 
         * @param {string} userId - Internal ID of Employee (Netsuite Employee)
         * @param {string} actionType - Login, Logout, Break etc.
         * @param {string} operationInternalId - Manufacturing Operation Task' internal id
         * @param {string} operationName - Operation Name
         */
        /*
        function CreateTransactionRecord(userId, actionType, operationInternalId) {
            var now = new Date();
            var createdDate = (now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear();
            var createdTime = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
            var formatedDate = FormateDate(createdDate);
            var formatedTime = FormateTime(createdTime);
            var recordId = record.create({
                type: 'customrecord_pct_crm_transaction_tab',
                isDynamic: true,
            }).setValue({
                fieldId: "custrecord_pct_crm_trans_emp_name",
                value: userId,
                ignoreFieldChange: true
            }).setText({
                fieldId: "custrecord_pct_crm_trans_action_type",
                text: actionType,
                ignoreFieldChange: true
            }).setValue({
                fieldId: "custrecord_pct_crm_trans_date",
                value: formatedDate,
                ignoreFieldChange: true
            }).setValue({
                fieldId: "custrecord_pct_crm_trans_action_st",
                value: formatedTime,
                ignoreFieldChange: true
            }).setValue({
                fieldId: "custrecord_pct_crm_trans_op_number",
                value: operationInternalId,
                ignoreFieldChange: true
            }).save({
                enableSourcing: true,
                ignoreMandatoryFields: false
            });

            return recordId;
        }*/

        /**
         * This method is used to update the transaction Table
         * 
         * @param {string} actionType - Login, Logout, Break etc.
         * @param {string} recordId - PMC Transaction's record internal id
         */
        /*
        function UpdateTransactionRecord(recordId, actionType) {
            var now = new Date();
            var createdTime = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
            var formatedTime = FormateTime(createdTime);

            var customRecord = record.load({
                type: 'customrecord_pct_crm_transaction_tab',
                id: recordId,
                isDynamic: true
            }).setText({
                fieldId: "custrecord_pct_crm_trans_action_type",
                text: actionType,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custrecord_pct_crm_trans_action_et',
                value: formatedTime,
                ignoreFieldChange: true
            }).save({
                enableSourcing: true,
                ignoreMandatoryFields: false
            });
        }*/

        /**
         * This method is used to formate the date (string)
         * Note: In SuiteScript 2.0 you have to strickly follor the Date/Time formate
         * 
         * @param {string} value 
         */
        function FormateDate(value) {
            return format.parse({
                value: value,
                type: format.Type.DATE
            });
        }

        /**
         * This method is used to formate the time (string)
         * Note: In SuiteScript 2.0 you have to strickly follor the Date/Time formate
         * 
         * @param {string} value 
         */
        function FormateTime(value) {
            return format.parse({
                value: value,
                type: format.Type.DATETIME
            });
        }

        /**
         * This method is used to get the external url of Home Page/Scanner Page
         */
         function GetHomePageUrl() {
            return url.resolveScript({
                scriptId: 'customscript_pct_crm_sl_home_page',
                deploymentId: 'customdeploy_pct_crm_sl_home_page',
                returnExternalUrl: true
            });
        }



        /**
         * This method is used to get the external url of Logout Page
         */
         function GetLogoutPageUrl() {
            return url.resolveScript({
                scriptId: 'customscript_pct_crm_sl_logout_page',
                deploymentId: 'customdeploy_pct_crm_sl_logout_page',
                returnExternalUrl: true
            });
        }



        /**
        * This method is used to get the paapri favicon url
        */
        function GetFaviconImgUrl() {
            var fileObj = file.load({
                id: './PMC CRM Web Application/Images/PCT logo.png'
            });
            return fileObj.url;
        }

        //==================================================== Helper Methods =======================================//

        return {
            onRequest: onRequest
        }
    });