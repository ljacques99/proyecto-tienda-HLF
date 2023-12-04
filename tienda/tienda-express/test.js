//fetch('http://localhost:3003/ping').then(res => res.text()).then(res => console.log(res))

const lines = JSON.parse('[{"ProductId": "prod1", "quantity": "2"},{"ProductId": "prod2", "quantity": "3"}]')
//const lines = JSON.parse("[{'ProductId': 'prod1', 'quantity': '2'},{'ProductId': 'prod2', 'quantity': '3'}]")
console.log(lines)
const A = JSON.stringify(lines)
console.log(A)
console.log(JSON.parse(A))
