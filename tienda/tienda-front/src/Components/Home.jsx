import {Route, Routes, Outlet, BrowserRouter} from 'react-router-dom'
import { Header } from './Header'

export function Home() {
    return <div className='d-flex flex-column h-100'>
        <div><Header/></div>
        <div className='pb-5'><Outlet/></div>
    </div>
}