const pdfKit = require('pdfkit')
const moment = require('moment')
const numeral = require('numeral')
const i18n = require('./i18n')
const path = require('path')

const TEXT_SIZE = 8
const CONTENT_LEFT_PADDING = 50

function PDFInvoice({
  company, // {phone, email, address}
  customer, // {name, email}
  items, // [{amount, name, description}]
}){
  items.map(item => Object.assign(item, {
    amount: item.unitCost * item.quantity
  }));

  const date = new Date()
  const charge = {
    createdAt: `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}`,
    amount: items.reduce((acc, item) => acc + item.amount, 0),
  }
  const doc = new pdfKit({size: 'A4', margin: 50});

  doc.fillColor('#333333');

  const translate = i18n[PDFInvoice.lang]
  moment.locale(PDFInvoice.lang)

  const divMaxWidth = 550;
  const table = {
    x: CONTENT_LEFT_PADDING,
    y: 200,
    inc: 110,
  };

  return {
    genHeader(){
      const imgPath = path.join(__dirname, '..', 'images', 'logo.png');
      const borderOffset = doc.currentLineHeight() + 70;

      doc.image(imgPath, CONTENT_LEFT_PADDING, 38, { width: 150 });

      doc
        .fontSize(16)
        .fillColor('#cccccc')
        .text(moment().format('MMMM, DD, YYYY'), CONTENT_LEFT_PADDING, 50, {
          align: 'right',
        })
        .fillColor('#333333');

      doc
        .strokeColor('#cccccc')
        .moveTo(CONTENT_LEFT_PADDING, borderOffset)
        .lineTo(divMaxWidth, borderOffset);
    },

    genFooter(){
      doc.fillColor('#cccccc');

      doc
        .fontSize(12)
        .text(company.name, CONTENT_LEFT_PADDING, 450);

      doc.text(company.address);
      doc.text(company.phone);
      doc.text(company.email);

      doc.fillColor('#333333');
    },

    genCustomerInfos(){
      doc
        .fontSize(TEXT_SIZE)
        .text(translate.chargeFor, CONTENT_LEFT_PADDING, 400);

      doc.text(`${customer.name} <${customer.email}>`);
    },

    genTableHeaders(){
      [
        'name',
        'description',
        'unitCost',
        'quantity',
        'amount',
      ].forEach(text => {
        const x = this.getTablePaddings(text);
        doc
          .fontSize(TEXT_SIZE)
          .text(translate[text], x, table.y);
      });
    },

    genTableRow(){
      items
        .map(item => Object.assign({}, item, {
          unitCost: numeral(item.unitCost).format('$ 0,00.00'),
          amount: numeral(item.amount).format('$ 0,00.00')
        }))
        .forEach((item, itemIndex) => {
          [
            'name',
            'description',
            'unitCost',
            'quantity',
            'amount',
          ].forEach((field, i) => {
            const x = this.getTablePaddings(field);
            doc
              .fontSize(TEXT_SIZE)
              .text(this.truncate(item[field]), x, table.y + TEXT_SIZE + 6 + itemIndex * 20);
          });
        })
    },
    truncate(string){
      return string.length > 55
        ? string.substring(0, 55) + '...'
        : string;
    },

    genTableLines(){
      const offset = doc.currentLineHeight() + 2;
      doc
        .moveTo(table.x, table.y + offset)
        .lineTo(divMaxWidth, table.y + offset)
        .stroke();
    },

    generate(){
      this.genHeader();
      this.genTableHeaders();
      this.genTableLines();
      this.genTableRow();
      this.genCustomerInfos();
      this.genFooter();
      doc.end();
    },

    getTablePaddings(value) {
      return (function(value) {
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
      })(value);
    },

    get pdfkitDoc(){
      return doc
    },
  };
}

PDFInvoice.lang = 'en_US'

module.exports = PDFInvoice
