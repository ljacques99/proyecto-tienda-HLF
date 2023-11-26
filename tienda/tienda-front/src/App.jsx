import { useState } from 'react'
import {Route, Routes, BrowserRouter} from 'react-router-dom'
import {QueryClient, QueryClientProvider} from 'react-query'

//import viteLogo from '/vite.svg'

import {Home} from './Components/Home'
import { Welcome } from './Components/Welcome'
import { Customers } from './Components/Customers'
import { CustomerDetail } from './Components/CustomerDetail'
import { Test } from './Components/Test'
import { Login } from './Components/login'
import { Orders } from './Components/Orders'
import { OrderDetail } from './Components/OrderDetail'

const queryClient = new QueryClient()  

function App() {
  const [count, setCount] = useState(0)

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element ={<Home/>}>
            <Route path="*" element ={<Welcome/>}/>
            <Route index element ={<Welcome/>}/>
            <Route path="/customers" element ={<Customers/>}/>
            <Route path="/orders/:customer_id" element ={<Orders/>}/>
            <Route path="/orderdetail/:order_id" element ={<OrderDetail/>}/>
          </Route>
          <Route path="/customerDetail/:customer_id" element={<CustomerDetail/>}>
          </Route>
          <Route path="/ping" element={<Test/>}/>
          <Route path="/login" element={<Login/>}/> 
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>  
  )
}

export default App
