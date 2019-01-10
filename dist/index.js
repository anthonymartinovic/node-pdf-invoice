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
      items = _ref.items;

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
    y: 200,
    inc: 110
  };

  return {
    genHeader: function genHeader() {
      var imgPath = path.join(__dirname, '..', 'images', 'logo.png');
      var borderOffset = doc.currentLineHeight() + 70;

      doc.image(imgPath, CONTENT_LEFT_PADDING, 38, { width: 150 });

      doc.fontSize(16).fillColor('#cccccc').text(moment().format('MMMM, DD, YYYY'), CONTENT_LEFT_PADDING, 50, {
        align: 'right'
      }).fillColor('#333333');

      doc.strokeColor('#cccccc').moveTo(CONTENT_LEFT_PADDING, borderOffset).lineTo(divMaxWidth, borderOffset);
    },
    genFooter: function genFooter() {
      doc.fillColor('#cccccc');

      doc.fontSize(12).text(company.name, CONTENT_LEFT_PADDING, 450);

      doc.text(company.address);
      doc.text(company.phone);
      doc.text(company.email);

      doc.fillColor('#333333');
    },
    genCustomerInfos: function genCustomerInfos() {
      doc.fontSize(TEXT_SIZE).text(translate.chargeFor, CONTENT_LEFT_PADDING, 400);

      doc.text(customer.name + ' <' + customer.email + '>');
    },
    genTableHeaders: function genTableHeaders() {
      var _this = this;

      ['name', 'description', 'unitCost', 'quantity', 'amount'].forEach(function (text) {
        var x = _this.getTablePaddings(text);
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
          var x = _this2.getTablePaddings(field);
          doc.fontSize(TEXT_SIZE).text(_this2.truncate(item[field]), x, table.y + TEXT_SIZE + 6 + itemIndex * 20);
        });
      });
    },
    truncate: function truncate(string) {
      return string.length > 55 ? string.substring(0, 55) + '...' : string;
    },
    genTableLines: function genTableLines() {
      var offset = doc.currentLineHeight() + 2;
      doc.moveTo(table.x, table.y + offset).lineTo(divMaxWidth, table.y + offset).stroke();
    },
    generate: function generate() {
      this.genHeader();
      this.genTableHeaders();
      this.genTableLines();
      this.genTableRow();
      this.genCustomerInfos();
      this.genFooter();
      doc.end();
    },
    getTablePaddings: function getTablePaddings(value) {
      return function (value) {
        switch (value) {
          case 'name':
            return 50;
          case 'description':
            return 160;
          case 'unitCost':
            return 390;
          case 'quantity':
            return 450;
          case 'amount':
            return 500;
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