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
  invoiceNumber,
  footerText,
  customDate = undefined
}){
  items.map(item => Object.assign(item, {
    amount: item.unitCost * item.quantity
  }));

  const date = new Date();
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
    y: 300,
    inc: 110,
  };

  return {
    genHeader(){
      const imgPath = path.join(__dirname, '..', 'images', 'logo.png');

      doc
        .image(imgPath, CONTENT_LEFT_PADDING, 40, { width: 150 });

      doc
        .font('Helvetica')
        .fontSize(32)
        .fillColor('#666666')
        .text('INVOICE', CONTENT_LEFT_PADDING, 50, { align: 'right' })
        .fillColor('#333333');

      doc
        .fontSize(10)
        .fillColor('#222222')
        .text('Unit 1c 30-32 Norman St', CONTENT_LEFT_PADDING, 75)
        .text('Peakhurst 2210', CONTENT_LEFT_PADDING, 87)
        .text('info@gamingtrader.com.au', CONTENT_LEFT_PADDING, 99)
        .text('ABN: 65 629 584 449', CONTENT_LEFT_PADDING, 111);
    },

    genCustomerInfos(){
      doc
        .text('Date: ' + moment(customDate).format('MMMM DD, YYYY'), CONTENT_LEFT_PADDING, 130, { align: 'right' })
        .text('INVOICE #' + invoiceNumber, CONTENT_LEFT_PADDING, 142, { align: 'right' })
        .text(`To: ${customer.name} <${customer.email}>`, CONTENT_LEFT_PADDING, 180, { align: 'right' })
    },

    genFooter(){
      doc
        .font('Helvetica-BoldOblique')
        .fontSize(8)
        .fillColor('#222222')
        .text('Please pay invoices to the following account', CONTENT_LEFT_PADDING, 600, { align: 'center' })
        .text('King Gaming Technology Pty Ltd', CONTENT_LEFT_PADDING, 614, { align: 'center' })
        .text('Westpac', CONTENT_LEFT_PADDING, 628, { align: 'center' })
        .text('BSB: 032-250', CONTENT_LEFT_PADDING, 642, { align: 'center' })
        .text('Account no: 442-828', CONTENT_LEFT_PADDING, 656, { align: 'center' })
        .text('All invoices must be paid within 7 days', CONTENT_LEFT_PADDING, 670, { align: 'center' });
    },

    genTableHeaders(){
      [
        'name',
        'description',
        'unitCost',
        'quantity',
        'amount',
      ].forEach(text => {
        const x = this.getTableRowPaddings(text);

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
            const x = this.getTableRowPaddings(field);
            const rowOffset = table.y + TEXT_SIZE + 6 + itemIndex * 20;

            doc
              .fontSize(TEXT_SIZE)
              .text(this.truncate(item[field]), x, rowOffset);

            const cellXPadding = this.getTableRowPaddings(field, 'cell');
            doc
              .rect(x - 2, rowOffset - 5, cellXPadding, 20)
              .lineWidth(0.4)
              .stroke();
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
        .strokeColor('#cccccc')
        .lineWidth(0.4)
        .stroke()
    },

    generate(){
      this.genHeader();
      this.genCustomerInfos();
      this.genTableHeaders();
      this.genTableLines();
      this.genTableRow();
      this.genFooter();
      doc.end();
    },

    getTableRowPaddings(value, type = 'regular') {
      return (function(value) {
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
      })(value);
    },

    get pdfkitDoc(){
      return doc
    },
  };
}

PDFInvoice.lang = 'en_US'

module.exports = PDFInvoice
