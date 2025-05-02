import { useState } from "react";
import Navbar from "../components/Navbar";
import { DateCalendar } from '@mui/x-date-pickers'
const Service = () => {
    const [status, setStatus] = useState(false);

    return (
        <>
            <Navbar/>
            <ul>
                <li >Lịch bơi</li>
                <li>Lịch Gym</li>
                <DateCalendar/>
            </ul>
        </>
    )
}

export default Service;