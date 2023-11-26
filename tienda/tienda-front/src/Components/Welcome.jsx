import { useState } from "react"

import { useQuery } from "react-query"


export function Welcome() {

    const [logged, setLogged] = useState(false)
    const [test, setTest] =useState(false)

    




    return <div className="d-flex justify-content-center">
        <div className="d-flex flex-column w-50">
            <h2 className="text-center">Puede consultar la base de datos North</h2>
            <a className="btn btn-outline-secondary m-1" href="/login" role="button" onClick={() => {event.preventDefault(); setLogged(!logged)}}>login</a>
            {logged && <iframe src = {`login`}></iframe>}
            <a className="btn btn-outline-secondary m-1" href="/login" role="button" onClick={() => {event.preventDefault(); setTest(!test)}}>Ping</a>
            {test && <iframe src = {`ping`}></iframe>}
            <a className="btn btn-outline-secondary m-1" href="/customers" role="button">Consultar clientes</a>
        </div>

    </div>
}