const fs = require('fs')
const path = require('path')
const generator = require('../dist/index')

const document = generator({
  company: {
    phone: '(99) 9 9999-9999',
    email: 'company@evilcorp.com',
    address: 'Av. Companhia, 182, Água Branca, Piauí',
    name: 'Evil Corp.',
  },
  customer: {
    name: 'Elliot Raque',
    email: 'raque@gmail.com',
  },
  items: [
    { name: 'XYZ', description: 'Lorem ipsum dollor sit amet, Lorem ipsum dollor sit amet, Lorem ipsum dollor sit amet, Lorem ipsum dollor sit amet, Lorem ipsum dollor sit amet, Lorem ipsum dollor sit amet', unitCost: 4.0, quantity: 12 },
    { name: 'ABC', description: 'Lorem ipsum dollor sit amet', unitCost: 1.0, quantity: 12 },
    { name: 'DFE', description: 'Lorem ipsum dollor sit amet', unitCost: 1043, quantity: 12 },
  ],
})

document.generate()

document
  .pdfkitDoc
  .pipe(
    fs.createWriteStream(
      path.join(process.cwd(), 'tests/testing.pdf')
    )
  )
