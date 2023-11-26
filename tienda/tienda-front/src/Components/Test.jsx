import { useQuery } from "react-query"

export function Test() {
    const {data, isLoading} = useQuery("ping",()=> {
        return fetch('http://localhost:3003/ping').then(res =>  res.text())
    })
    if (isLoading) {
        return <div>Cargando...</div>
    }
    console.log(data)
    return <div>
        {`${data}`}
    </div>
}