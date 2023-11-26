import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export function Customers() {
    const {register, handleSubmit} = useForm()
    var [customer_id, setCustomer_id] = useState("")
    var [table, setTable] = useState()



    function onSubmit(data) {
        //console.log(data, data.customer_id)
        setCustomer_id(data.customer_id)
    }
    return <div className="h-100">
        <h2 className="mb-3">{`Ver los detalles de un cliente`}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="w-25">
            <input {...register('customer_id')} type="string" className='form-control'/>
            <button className="btn btn-primary mt-3">Ver</button>
        </form>
        <div className="h-100">
            {customer_id != ""  && <iframe src = {`customerDetail/${customer_id}`} className="w-100 h-100"></iframe>}
            {customer_id != ""  && <button className="btn btn-primary mt-3"><Link className='text-white' to={`/orders/${customer_id}`}>Ver lista de pedidas</Link></button>}
        </div>
    </div>
}