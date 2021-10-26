/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
 define(['N/search', 'N/record', 'N/log', 'N/url'], function (search, record, log, url) {
    function onRequest(context) {
        var pct_logo = 'https://7255402.app.netsuite.com/core/media/media.nl?id=15929&c=7255402&h=JQwcI60yognaw9GYp6fd5EeOIT7-Is4SkbaYIMxzBRxM5QOI';
        var request = context.request;
        var id = request.parameters.recordname;

        var currentdate = new Date();
            var datetime = "Sync date: " + currentdate.getDate() + "/"
                + (currentdate.getMonth() + 1) + "/"
                + currentdate.getFullYear() + "<br> Sync time: "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();


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



        var salesObjRecord = record.load({
            type: record.Type.SALES_ORDER,
            id: id,
            isDynamic: true,
        });

        var docNo = salesObjRecord.getValue({ fieldId: "tranid" });

        var invoiceSearchObj = search.create({
            type: "salesorder",
            filters:
                [
                    ["type", "anyof", "SalesOrd"],
                    "AND",
                    ["numbertext", "is", docNo],
                    "AND",
                    ["mainline", "is", "F"],
                    "AND",
                    ["applyingtransaction.type", "anyof", "CustInvc"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "tranid",
                        join: "applyingTransaction",
                        label: "Document Number"
                    }),
                    search.createColumn({ name: "applyingtransaction", label: "Applying Transaction" }),
                    search.createColumn({
                        name: "internalid",
                        join: "applyingTransaction",
                        label: "Internal ID"
                    })
                ]
        });
        var searchResultCount = invoiceSearchObj.runPaged().count;
        log.debug("salesorderSearchObj result count", searchResultCount);
        var invoiceSearchResult = invoiceSearchObj.run().getRange({ start: 0, end: searchResultCount });



        

        if (searchResultCount!=0) {
            var documentNumber = invoiceSearchResult[0].getValue({ name: "tranid", join: "applyingTransaction" });
            var invoiceInternalId = invoiceSearchResult[0].getValue({ name: "internalid", join: "applyingTransaction" });
            var invoiceId = documentNumber;
            log.debug({
                title: 'PCT-Billing',
                details: documentNumber[0]
            })
        }

        else {
            var objRecord = record.transform({
                fromType: record.Type.SALES_ORDER,
                fromId: id,
                toType: record.Type.INVOICE,
                isDynamic: true,
            });
            log.debug({
                title: 'AS-log',
                details: id
            });
            var recId = objRecord.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            })
            log.debug({
                title: 'AS-log',
                details: recId
            });
            var invoiceObjRecord = record.load({
                type: record.Type.INVOICE,
                id: recId,
                isDynamic: true,
            });
            var invoiceId = invoiceObjRecord.getValue({
                fieldId: 'tranid'
            })
            invoiceInternalId = recId;
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
            `    <script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>` +
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
            //`                    <li><a><span class="glyphicon glyphicon-user"></span> User Name</a></li>` +
            `                    <li><a href=\'scriptlet.nl?script=196&deploy=1&compid=7255402&h=38a57cec7478fc49f8d3\'><span class="glyphicon glyphicon-off"></span> Logout</a></li>` +
            `                </ul>` +
            `            </div>` +
            `        </div>` +
            `    </nav>`;
        content +=
            `<div class="text-center">` +
            ` <div class="col-1">` + `<label for="pwd" id="date">${datetime}</label>` + `</div>` +
            `<label >Invoice Generated</label>` +
            `</div>` +
            `        <div class="text-center">` +
            `             <button type="submit" class="btn btn-success status">Check Status</button>` +
            `             <button type="submit" class="btn btn-info back">Go Back</button>` +
            `             <button type="submit" class="btn btn-danger print">Download</button>` +
            `</div>` + `</body>`;
        content += `<script>` +
            `    $(".status").click(function(){` +

            `                swal({` +
            `                        title: \`Success!\`,` +
            `                        text: \`Invoice ID: ${invoiceId}\`,` +
            `                        icon: \`success\`,` +
            `                    });` +
            `    });` +
            `    $(".back").click(function(){` +


            `$(location).attr('href','https://7255402.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=202&deploy=1&compid=7255402&h=87a1ee9455ec305f7ed6'` +

            `);` +
            `    });` +
            `    $(".print").click(function(){` +
            `$(location).attr('href','https://7255402.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=204&recordname=${invoiceInternalId}&deploy=1&compid=7255402&h=2d71d4925fcc37fa7ce5'` +

            `);` +
            `    });` +
            `</script>` +
            `</html>`;

        context.response.write(content);
    }

    return {
        onRequest: onRequest
    }

});