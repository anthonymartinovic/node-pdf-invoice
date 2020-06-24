const fs = require('fs')
const path = require('path')
const generator = require('../dist/index')

const document = generator({
  company: {
    name: 'Name',
    financialInstitution: 'The Bank',
    bsb: '123 456',
    accountNo: '789 012',
  },
  customer: {
    name: 'Elliot Raque',
    email: 'raque@gmail.com',
  },
  items: [
    { name: 'XYZ', description: 'Lorem ipsum dollor sit amet, Lorem ipsum dollor sit amet, Lorem ipsum dollor sit amet, Lorem ipsum dollor sit amet, Lorem ipsum dollor sit amet, Lorem ipsum dollor sit amet', unitCost: 4.0, quantity: 12 },
    { name: 'ABC', description: 'Lorem ipsum dollor sit amet', unitCost: 1.0, quantity: 12 },
    { name: 'DFE', description: 'Lorem ipsum dollor sit amet', unitCost: 1043, quantity: 12 },
    { name: 'DFE', description: 'Lorem ipsum dollor sit amet', unitCost: 1043, quantity: 12 },
    { name: 'DFE', description: 'Lorem ipsum dollor sit amet', unitCost: 1043, quantity: 12 },
    { name: 'DFE', description: 'Lorem ipsum dollor sit amet', unitCost: 1043, quantity: 12 },
    { name: 'DFE', description: 'Lorem ipsum dollor sit amet', unitCost: 1043, quantity: 12 },
    { name: 'DFE', description: 'Lorem ipsum dollor sit amet', unitCost: 1043, quantity: 1 },
    { name: 'DFE', description: 'Lorem ipsum dollor sit amet', unitCost: 1043, quantity: 12 },
  ],
  invoiceNumber: 'INV-00001',
  footerText: 'Footer Text',
  customDate: '20190204',
})

document.generate()

document
  .pdfkitDoc
  .pipe(
    fs.createWriteStream(
      path.join(process.cwd(), 'tests/testing.pdf')
    )
  )
