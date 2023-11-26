import { useParams } from "react-router-dom"
import { useQuery } from "react-query"

export function CustomerDetail() {
    const params = useParams()
    const request = {
        fcn: "getCustomer",
        args: [params.customer_id]
    }
    console.log(request)
    try {const {data, isLoading}= useQuery(`customerDetail${params.customer_id}`, () => {
        return fetch(`http://localhost:3003/consult`, {
            method: 'POST',
            body: JSON.stringify(request),
            headers : {'Content-type': 'application/json'}
        }).then(res => res.json())
    })
    if (isLoading) {
        return <div>Cargando...</div>
    }
    console.log(data)
    return <div className="h-50">
        <p>{`Aqui estan los detalles del cliente ${params.customer_id} `}</p>
        {/* <p>{`${data.map(item => JSON.stringify(item))}`}</p> */}
        {/* <p>{`${JSON.stringify(data)}`}</p> */}
        <ul>
            <li>{`ID del cliente: ${data.id}`}</li>
            <li>{`Empresa del cliente: ${data.company_name}`}</li>
            <li>{`Contacto del cliente: ${data.contact_name}`}</li>
            <li>{`Cargo del contacto: ${data.contact_title}`}</li>
            <li>{`Direccion del cliente: ${data.address}`}</li>
            <li>{`Ciudad del cliente: ${data.city}`}</li>
            <li>{`Codigo postal: ${data.postal_code}`}</li>
            <li>{`Region del cliente: ${data.region}`}</li>
            <li>{`Pais del cliente: ${data.country}`}</li>
            <li>{`Telefono del cliente: ${data.phone}`}</li>
            <li>{`Fax del cliente: ${data.fax}`}</li>
        </ul>
    </div>

    } catch (e) {
        return <div>{`Error ${e.message}`}</div>
    }
}