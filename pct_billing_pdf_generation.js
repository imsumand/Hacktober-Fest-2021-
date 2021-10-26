/**
* @NApiVersion 2.1
* @NScriptType Suitelet
*/
define(['N/record', 'N/render', 'N/log'],
    function (record, render, log) {
        function onRequest(context) {
            var pct_logo = 'https://7255402.app.netsuite.com/core/media/media.nl?id=15879&c=7255402&h=1GdiaCo-ZxSq4b7ZW5Crn8zJIeA6ud9GGocx3xg56jFatBrf';
            var request = context.request;
            var response = context.response;
            var id = request.parameters.recordname;

            var invoiceObjRecord = record.load({
                type: record.Type.INVOICE,
                id: id,
                isDynamic: true,
            });
            log.debug({
                title: "Invoice Id:",
                details: id
            })
            var idInt=parseInt(id);
            /*var invId = invoiceObjRecord.getValue({ fieldId: 'tranid' });
            var invDate = invoiceObjRecord.getValue({ fieldId: 'trandate' });
            var bill_add = invoiceObjRecord.getValue({ fieldId: 'billaddress' });
            var ship_add = invoiceObjRecord.getValue({ fieldId: 'shipaddress' });
            var orderTotal = invoiceObjRecord.getValue({ fieldId: 'total' });*/

            var transactionFile = render.transaction({
                entityId: idInt,
                printMode: render.PrintMode.PDF,
                inCustLocale: true
            });
            log.debug({
                title: "Invoice record:",
                details: transactionFile
            })
           /* var pdfFile = render.xmlToPdf({
                xmlString: transactionFile
            });*/
           // context.response.renderPdf({ xmlString: pdfFile });
             //response.write(pdfFile.getContents());//

             context.response.writeFile(transactionFile);


            // response.renderPdf(transactionFile)
        }
        return {

            onRequest: onRequest

        };


    });