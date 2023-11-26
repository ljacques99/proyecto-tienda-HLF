import { useQuery } from "react-query"

export function Login() {
    const {data, isLoading} = useQuery("ping",()=> {
        return fetch('http://localhost:3003/login', {
            method: 'POST',
            body: JSON.stringify({username: "user1", password: "user1pw"}),
            headers : {'Content-type': 'application/json'}
        }).then(res =>  res.text())
    })
    if (isLoading) {
        return <div>Conectando...</div>
    }
    console.log(data)
    return <div>
        {`${data}`}
    </div>
}