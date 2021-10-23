/**
*@NApiVersion 2.1
*@NScriptType Suitelet
*/
define(['N/ui/serverWidget', 'N/xml', 'N/log', 'N/render', 'N/record', 'N/search'],
    function (serverWidget, xml, log, render, record, search) {
        function onRequest(context) {
            if (context.request.method === 'GET') {
                {
                    var id = context.request.parameters.recordname;
                    log.debug({ title: 'PCT-Spectrum', details: "Record Id " + id });
                    var load_record = record.load({ type: 'assemblybuild', id: id })
                    var a_item = load_record.getValue({ fieldId: 'item' });
                    var a_quantity = load_record.getValue({ fieldId: 'quantity' });
                    var inventory_detail = load_record.getValue({ fieldId: 'inventorydetail' });
                    log.debug({ title: 'Pct-Spectrum', details: inventory_detail });
                    function display_search(item) {
                        var itemSearchObj = search.create({
                            type: "item",
                            filters:
                                [
                                    ["internalidnumber", "equalto", a_item]
                                ],
                            columns:
                                [
                                    search.createColumn({ name: "displayname", label: "Display Name" }),
                                    search.createColumn({
                                        name: "itemid",
                                        label: "Name"
                                    })
                                ]
                        });
                        var searchResultCount1 = itemSearchObj.runPaged().count;
                        log.debug("itemSearchObj result count", searchResultCount1);
                        var res1 = itemSearchObj.run().getRange({ start: 0, end: searchResultCount1 });
                        log.debug({ title: "PCT-Spectrum", details: "Result :" + res1 });
                        for (var i = 0; i < searchResultCount1; i++) {
                            var display = res1[i].getValue({ name: "displayname" });
                            var item = res1[i].getValue({ name: "itemid" });
                            log.debug({ title: "PCT-Spectrum", details: "Display Name :" + display });
                        }
                        return {
                            display,
                            item
                        };
                    }
                    var receive1 = display_search(a_item);
                    var display_name = receive1.display;
                    var item_name = receive1.item;

                    var dots = "..";
                    if (display_name == "") {
                        display_name = item_name;
                    }
                    var display_new = display_name.toString();
                    if (display_new.length > 30) {
                        var display_name_cut = display_new.slice(0, 28);
                        var display_name_new = display_name_cut.concat(dots);
                    }

                    var name = item_name.toString();
                    if (name.length > 23) {
                        var upc_cut = name.slice(0, 21);
                        var item_name_new = upc_cut.concat(dots);
                    }
                    if (inventory_detail == "") {
                        var myvar = '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n' +
                            '<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n' +
                            '<pdf>' +
                            '<head>' +
                            '<link name=\"NotoSans\" type=\"font\" subtype=\"truetype\" ' + 'src=\"${nsfont.NotoSans_Regular}\" ' + 'srcbold=\"${nsfont.NotoSans_Bold}\" ' + 'src-italic=\"${nsfont.NotoSans_Italic}\" ' +
                            'src-bolditalic=\"${nsfont.NotoSans_BoldItalic}\" ' + 'bytes=\"2\"/>\n' +
                            '<style type="text/css">* {' +
                            '' +
                            '		}' +
                            '		table {' +
                            '            font-size: 8pt;' +
                            '        }' +
                            '</style>' +
                            '</head>';
                        for (var item_q = 0; item_q < a_quantity; item_q++) {
                            if (display_name.length > 30) {
                                myvar += '<body padding="1px" width="2.50in" height="0.75in">' +

                                    '<table style="width:100%;"><tr>' +
                                    '<td colspan="2" style="align : center; font-size: 5pt;">' +
                                    //'<h2>' + upc + '</h2>' +
                                    '<h2>' + display_name_new + '</h2>' +
                                    '</td>' +
                                    '</tr>' +
                                    '<tr>';
                            }
                            else {
                                myvar += '<body padding="1px" width="2.50in" height="0.75in">' +

                                    '<table style="width:100%;"><tr>' +
                                    '<td colspan="2" style="align : center; font-size: 5pt;">' +
                                    //'<h2>' + upc + '</h2>' +
                                    '<h2>' + display_name + '</h2>' +
                                    '</td>' +
                                    '</tr>' +
                                    '<tr>';
                            }

                            if (item_name.length > 23) {
                                myvar += '<td width="100%">' + '<barcode align="center" width="140" height="17" codetype="code128" showtext="false" value="' + item_name_new + '"/>' + '</td>' + '</tr>';
                                myvar += '<tr>' +
                                    '<td style="align : center; font-size: 4pt;">' +
                                    '<h2>' + item_name_new + '</h2>' +
                                    '</td>';
                                myvar += '</tr>' +
                                    '</table>' +

                                    '</body>';
                            }
                            else {
                                myvar += '<td width="100%">' + '<barcode align="center" width="140" height="17" codetype="code128" showtext="false" value="' + item_name + '"/>' + '</td>' + '</tr>';
                                myvar += '<tr>' +
                                    '<td style="align : center; font-size: 4pt;">' +
                                    '<h2>' + item_name + '</h2>' +
                                    '</td>';
                                myvar += '</tr>' +
                                    '</table>' +

                                    '</body>';
                            }
                        }
                        myvar += '</pdf>';
                        context.response.renderPdf(myvar);
                    }
                    else {
                        function lot_no() {
                            var transactionSearchObj = search.create({
                                type: "transaction",
                                filters:
                                    [
                                        ["item", "anyof", a_item],
                                        "AND",
                                        ["internalidnumber", "equalto", id]
                                    ],
                                columns:
                                    [
                                        search.createColumn({ name: "serialnumber",sort: search.Sort.ASC, label: "Transaction Serial/Lot Number" })
                                    ]
                            });
                            var searchResultCount = transactionSearchObj.runPaged().count;
                            log.debug("transactionSearchObj result count", searchResultCount);
                            var res = transactionSearchObj.run().getRange({ start: 0, end: searchResultCount });
                            log.debug({ title: "PCT-Spectrum", details: "Result :" + res });
                            var number = new Array();
                            //var lot_qu = new Array();
                            for (var i = 0; i < searchResultCount; i++) {
                                //var quantity = res[i].getValue({ name: "quantity" });
                                var lotnumber = res[i].getValue({ name: "serialnumber" });
                                log.debug({ title: "PCT-Spectrum", details: "Lot number :" + lotnumber });
                                number[i] = lotnumber;
                                //lot_qu[i] = quantity;
                            }

                            return {
                                number
                            };
                        }
                        function quantity_a(inv) {
                            var inventorydetailSearchObj = search.create({
                                type: "inventorydetail",
                                filters:
                                    [
                                        ["internalidnumber", "equalto", inventory_detail]
                                    ],
                                columns:
                                    [
                                        search.createColumn({
                                            name: "inventorynumber",
                                            sort: search.Sort.ASC,
                                            label: " Number"
                                        }),
                                        search.createColumn({ name: "quantity", label: "Quantity" })
                                    ]
                            });
                            var searchResultCount = inventorydetailSearchObj.runPaged().count;
                            log.debug("inventorydetailSearchObj result count", searchResultCount);
                            var res = inventorydetailSearchObj.run().getRange({ start: 0, end: searchResultCount });
                            log.debug({ title: "PCT-Spectrum", details: "Result :" + res });
                            //var number = new Array();
                            var lot_qu = new Array();
                            for (var i = 0; i < searchResultCount; i++) {
                                var quantity = res[i].getValue({ name: "quantity" });
                                lot_qu[i] = quantity;
                            }

                            return {
                                searchResultCount,
                                lot_qu
                            };
                        }

                        var receive = quantity_a(inventory_detail);
                        var lot = new Array();
                        var lot_quantity = new Array();
                        lot_quantity = receive.lot_qu;
                        log.debug({ title: "PCT-Spectrum", details: "Lot :" + lot_quantity });
                        var quantity_length = lot_quantity.length;
                        log.debug({ title: "PCT-Spectrum", details: "Quantity :" + quantity_length });
                        var count = receive.searchResultCount;
                        var receive2 = lot_no();
                        lot = receive2.number;

                        var index_test = 0;
                        var count_chk = 0;
                        while (index_test < count) {
                            if (lot[index_test] != "") {
                                count_chk++;
                            }
                            index_test++;
                        }
                        log.debug({ title: "PCT-Spectrum", details: "Checked count :" + count_chk });

                        var myvar = '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n' +
                            '<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n' +
                            '<pdf>' +
                            '<head>' +
                            '<link name=\"NotoSans\" type=\"font\" subtype=\"truetype\" ' + 'src=\"${nsfont.NotoSans_Regular}\" ' + 'srcbold=\"${nsfont.NotoSans_Bold}\" ' + 'src-italic=\"${nsfont.NotoSans_Italic}\" ' +
                            'src-bolditalic=\"${nsfont.NotoSans_BoldItalic}\" ' + 'bytes=\"2\"/>\n' +
                            '<style type="text/css">* {' +
                            '' +
                            '		}' +
                            '		table {' +
                            '            font-size: 8pt;' +
                            '        }' +
                            '</style>' +
                            '</head>';
                        if (count_chk != 0) {
                            for (var lot_label = 0; lot_label < quantity_length; lot_label++) {
                                for (var lot_label1 = 0; lot_label1 < lot_quantity[lot_label]; lot_label1++) {
                                    if (display_name.length > 30) {
                                        myvar += '<body padding="1px" width="2.50in" height="0.75in">' +

                                            '<table style="width:100%;"><tr>' +
                                            '<td colspan="2" style="align : center; font-size: 5pt;">' +
                                            //'<h2>' + upc + '</h2>' +
                                            '<h2>' + display_name_new + '</h2>' +
                                            '</td>' +
                                            '</tr>' +
                                            '<tr>';
                                    }
                                    else {
                                        myvar += '<body padding="1px" width="2.50in" height="0.75in">' +

                                            '<table style="width:100%;"><tr>' +
                                            '<td colspan="2" style="align : center; font-size: 5pt;">' +
                                            //'<h2>' + upc + '</h2>' +
                                            '<h2>' + display_name + '</h2>' +
                                            '</td>' +
                                            '</tr>' +
                                            '<tr>';
                                    }
                                    if (item_name.length > 23) {
                                        myvar += '<td width="100%">' + '<barcode align="center" margin-left="10px" width="85" height="17" codetype="code128" showtext="false" value="' + item_name + '"/>' + '</td>' +
                                            '<td width="100%">' + '<barcode align="center" margin-left="-9px" width="70" height="17" codetype="code128" showtext="false" value="' + lot[lot_label] + '"/>' + '</td>' +
                                            '</tr>';
                                        myvar += '<tr>' +
                                            '<td margin-left=\"10px\" style="align : center; font-size: 4pt;">' +
                                            '<h2>' + item_name_new + '</h2>' +
                                            '</td>' +
                                            '<td margin-left=\"-10px\" style="align : center; font-size: 4pt;">' +
                                            '<h2>' + lot[lot_label] + '</h2>' + //lot_quantity[lot_label1]
                                            '</td>';
                                        myvar += '</tr>' +
                                            '</table>' +

                                            '</body>';
                                    }
                                    else {
                                        myvar += '<td width="100%">' + '<barcode align="center" width="85" height="17" codetype="code128" showtext="false" value="' + item_name + '"/>' + '</td>' +
                                            '<td width="100%">' + '<barcode align="center" margin-left="-10px" width="70" height="17" codetype="code128" showtext="false" value="' + lot[lot_label] + '"/>' + '</td>' + '</tr>';
                                        myvar += '<tr>' +
                                            '<td style="align : center; font-size: 4pt;">' +
                                            '<h2>' + item_name + '</h2>' +
                                            '</td>' +
                                            '<td margin-left=\"-10px\" style="align : center; font-size: 4pt;">' +
                                            '<h2>' + lot[lot_label] + '</h2>' +
                                            '</td>';
                                        myvar += '</tr>' +
                                            '</table>' +

                                            '</body>';
                                    }

                                }
                            }
                            myvar += '</pdf>';
                            context.response.renderPdf(myvar);
                        }
                        else {
                            for (var item_q = 0; item_q < a_quantity; item_q++) {
                                if (display_name.length > 30) {
                                    myvar += '<body padding="1px" width="2.50in" height="0.75in">' +

                                        '<table style="width:100%;"><tr>' +
                                        '<td colspan="2" style="align : center; font-size: 5pt;">' +
                                        //'<h2>' + upc + '</h2>' +
                                        '<h2>' + display_name_new + '</h2>' +
                                        '</td>' +
                                        '</tr>' +
                                        '<tr>';
                                }
                                else {
                                    myvar += '<body padding="1px" width="2.50in" height="0.75in">' +

                                        '<table style="width:100%;"><tr>' +
                                        '<td colspan="2" style="align : center; font-size: 5pt;">' +
                                        //'<h2>' + upc + '</h2>' +
                                        '<h2>' + display_name + '</h2>' +
                                        '</td>' +
                                        '</tr>' +
                                        '<tr>';
                                }

                                if (item_name.length > 23) {
                                    myvar += '<td width="100%">' + '<barcode align="center" width="140" height="17" codetype="code128" showtext="false" value="' + item_name_new + '"/>' + '</td>' + '</tr>';
                                    myvar += '<tr>' +
                                        '<td style="align : center; font-size: 4pt;">' +
                                        '<h2>' + item_name_new + '</h2>' +
                                        '</td>';
                                    myvar += '</tr>' +
                                        '</table>' +

                                        '</body>';
                                }
                                else {
                                    myvar += '<td width="100%">' + '<barcode align="center" width="140" height="17" codetype="code128" showtext="false" value="' + item_name + '"/>' + '</td>' + '</tr>';
                                    myvar += '<tr>' +
                                        '<td style="align : center; font-size: 4pt;">' +
                                        '<h2>' + item_name + '</h2>' +
                                        '</td>';
                                    myvar += '</tr>' +
                                        '</table>' +

                                        '</body>';
                                }
                            }
                            myvar += '</pdf>';
                            context.response.renderPdf(myvar);

                        }
                    }
                }
            }
        }

        return {
            onRequest: onRequest,
        };
    });