import { useParams } from "react-router-dom"
import { useQuery } from "react-query"
import { Link } from "react-router-dom"

export function Orders() {
    const params = useParams()
    const request = {
        fcn: "getOrderList",
        args: [params.customer_id]
    }

    try {const {data, isLoading}= useQuery(`orderList${params.customer_id}`, () => {
        return fetch(`http://localhost:3003/consult`, {
            method: 'POST',
            body: JSON.stringify(request),
            headers : {'Content-type': 'application/json'}
        }).then(res => res.json())
    })
    if (isLoading) {
        return <div>Cargando...</div>
    }

    return <div>
        <h3>{`Lista de las facturas del cliente ${params.customer_id}:`}</h3>
        <table className="table table-bordered">
            <thead>
                <tr>
                    <th>Cliente </th>
                    <th>Empleado </th>
                    <th>Peso </th>
                    <th>ID pedida </th>
                    <th>Fecha de pedida </th>
                    <th>Region </th>
                    <th>Fecha limita </th>
                    <th>Ciudad </th>
                    <th>Codigo postal </th>
                    <th>Pais </th>
                    <th>Nombre de destinatorio </th>
                    <th>Fecha de envio </th>
                    <th>Via </th> 
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) =>{
                    const fecha_pedida=new Date(Date.parse(item.order_date))
                    const fecha_limita=new Date(Date.parse(item.required_date))
                    const fecha_envio=new Date(Date.parse(item.shipped_date))
                    return <tr>
                        <td>{item.customer_id}</td>
                        <td>{item.employee_id}</td>
                        <td>{item.freight}</td>
                        <td><Link to={`/orderdetail/${item.id}`}>{item.id}</Link></td>
                        <td>{fecha_pedida.toLocaleDateString()}</td>
                        <td>{item.region}</td>
                        <td>{fecha_limita.toLocaleDateString()}</td>
                        <td>{item.ship_city}</td>
                        <td>{item.ship_postal_code}</td>
                        <td>{item.ship_country}</td>
                        <td>{item.ship_name}</td>
                        <td>{fecha_envio.toLocaleDateString()}</td>
                        <td>{item.shipped_via}</td>
                    </tr>
                    })
                }
            </tbody>
        </table>
    </div>

    } catch (e) {
        return <div>{`Error ${e.message}`}</div>
    }
}