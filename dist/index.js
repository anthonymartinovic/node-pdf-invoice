'use strict';

var pdfKit = require('pdfkit');
var moment = require('moment');
var numeral = require('numeral');
var i18n = require('./i18n');
var path = require('path');

var TEXT_SIZE = 8;
var CONTENT_LEFT_PADDING = 50;

function PDFInvoice(_ref) {
  var company = _ref.company,
      customer = _ref.customer,
      items = _ref.items,
      invoiceNumber = _ref.invoiceNumber,
      footerText = _ref.footerText,
      _ref$customDate = _ref.customDate,
      customDate = _ref$customDate === undefined ? undefined : _ref$customDate;

  items.map(function (item) {
    return Object.assign(item, {
      amount: item.unitCost * item.quantity
    });
  });

  var date = new Date();
  var charge = {
    createdAt: date.getDay() + '/' + date.getMonth() + '/' + date.getFullYear(),
    amount: items.reduce(function (acc, item) {
      return acc + item.amount;
    }, 0)
  };
  var doc = new pdfKit({ size: 'A4', margin: 50 });

  doc.fillColor('#333333');

  var translate = i18n[PDFInvoice.lang];
  moment.locale(PDFInvoice.lang);

  var divMaxWidth = 550;
  var table = {
    x: CONTENT_LEFT_PADDING,
    y: 300,
    inc: 110
  };

  return {
    genHeader: function genHeader() {
      var imgPath = path.join(__dirname, '..', 'images', 'logo.png');

      doc.image(imgPath, CONTENT_LEFT_PADDING, 40, { width: 150 });

      doc.font('Helvetica').fontSize(32).fillColor('#666666').text('INVOICE', CONTENT_LEFT_PADDING, 50, { align: 'right' }).fillColor('#333333');

      doc.fontSize(10).fillColor('#222222').text('Unit 1c 30-32 Norman St', CONTENT_LEFT_PADDING, 75).text('Peakhurst 2210', CONTENT_LEFT_PADDING, 87).text('info@gamingtrader.com.au', CONTENT_LEFT_PADDING, 99).text('ABN: 65 629 584 449', CONTENT_LEFT_PADDING, 111);
    },
    genCustomerInfos: function genCustomerInfos() {
      doc.text('Date: ' + moment(customDate).format('MMMM DD, YYYY'), CONTENT_LEFT_PADDING, 130, { align: 'right' }).text('INVOICE #' + invoiceNumber, CONTENT_LEFT_PADDING, 142, { align: 'right' }).text('To: ' + customer.name + ' <' + customer.email + '>', CONTENT_LEFT_PADDING, 180, { align: 'right' });
    },
    genFooter: function genFooter() {
      doc.font('Helvetica-BoldOblique').fontSize(8).fillColor('#222222').text('Please pay invoices to the following account', CONTENT_LEFT_PADDING, 600, { align: 'center' }).text('King Gaming Technology Pty Ltd', CONTENT_LEFT_PADDING, 614, { align: 'center' }).text('Westpac', CONTENT_LEFT_PADDING, 628, { align: 'center' }).text('BSB: 032-250', CONTENT_LEFT_PADDING, 642, { align: 'center' }).text('Account no: 442-828', CONTENT_LEFT_PADDING, 656, { align: 'center' }).text('All invoices must be paid within 7 days', CONTENT_LEFT_PADDING, 670, { align: 'center' });
    },
    genTableHeaders: function genTableHeaders() {
      var _this = this;

      ['name', 'description', 'unitCost', 'quantity', 'amount'].forEach(function (text) {
        var x = _this.getTableRowPaddings(text);

        doc.fontSize(TEXT_SIZE).text(translate[text], x, table.y);
      });
    },
    genTableRow: function genTableRow() {
      var _this2 = this;

      items.map(function (item) {
        return Object.assign({}, item, {
          unitCost: numeral(item.unitCost).format('$ 0,00.00'),
          amount: numeral(item.amount).format('$ 0,00.00')
        });
      }).forEach(function (item, itemIndex) {
        ['name', 'description', 'unitCost', 'quantity', 'amount'].forEach(function (field, i) {
          var x = _this2.getTableRowPaddings(field);
          var rowOffset = table.y + TEXT_SIZE + 6 + itemIndex * 20;

          doc.fontSize(TEXT_SIZE).text(_this2.truncate(item[field]), x, rowOffset);

          var cellXPadding = _this2.getTableRowPaddings(field, 'cell');
          doc.rect(x - 2, rowOffset - 5, cellXPadding, 20).lineWidth(0.4).stroke();
        });
      });
    },
    truncate: function truncate(string) {
      return string.length > 55 ? string.substring(0, 55) + '...' : string;
    },
    genTableLines: function genTableLines() {
      var offset = doc.currentLineHeight() + 2;
      doc.moveTo(table.x, table.y + offset).lineTo(divMaxWidth, table.y + offset).strokeColor('#cccccc').lineWidth(0.4).stroke();
    },
    generate: function generate() {
      this.genHeader();
      this.genCustomerInfos();
      this.genTableHeaders();
      this.genTableLines();
      this.genTableRow();
      this.genFooter();
      doc.end();
    },
    getTableRowPaddings: function getTableRowPaddings(value) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'regular';

      return function (value) {
        switch (value) {
          case 'name':
            return type === 'regular' ? 50 : 110;
          case 'description':
            return type === 'regular' ? 160 : 230;
          case 'unitCost':
            return type === 'regular' ? 390 : 60;
          case 'quantity':
            return type === 'regular' ? 450 : 50;
          case 'amount':
            return type === 'regular' ? 500 : 52;
        }
      }(value);
    },


    get pdfkitDoc() {
      return doc;
    }
  };
}

PDFInvoice.lang = 'en_US';

module.exports = PDFInvoice;