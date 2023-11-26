import { useParams } from "react-router-dom"
import { useQuery } from "react-query"

export function OrderDetail() {
    const params = useParams()
    const request = {
        fcn: "getOrderDetailList",
        args: [params.order_id]
    }

    try {const {data, isLoading}= useQuery(`orderDetail${params.order_id}`, () => {
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
        <h3>{`Detalles de la pedida ${params.order_id}:`}</h3>
        <table className="table table-bordered">
            <thead>
                <tr>
                    <th>ID de la pedida </th>
                    <th>ID del producto </th>
                    <th>Cantidad </th>
                    <th>Precio unitario </th>
                    <th>Discount </th>
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => <tr>
                        <td>{item.order_id}</td>
                        <td>{item.product_id}</td>
                        <td>{item.quantity}</td>
                        <td>{item.unit_price}</td>
                        <td>{item.discount}</td>
                    </tr>)
                }
            </tbody>
        </table>
    </div>

    } catch (e) {
        return <div>{`Error ${e.message}`}</div>
    }
}