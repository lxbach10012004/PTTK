import {useNavigate } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate()

    return (
        <>
            <div className=" container mx-auto pt-2 justify-between">
                <ul className="flex gap-3 ">
                    <li className="border rounded px-2 py-3"><button onClick={() => navigate('/service')} className="cursor-pointer">Dịch vụ</button></li>
                    <li className="border rounded px-2 py-3"><button onClick={() => navigate('/bill')} className="cursor-pointer">Hoá đơn</button></li>
                    <li className="border rounded px-2 py-3"><button onClick={() => navigate('/comment')} className="cursor-pointer">Góp ý</button></li>
                    <li className="border rounded px-2 py-3"><button onClick={() => navigate('/information')} className="cursor-pointer">Thông tin</button></li>
                    <li className="border rounded px-2 py-3"><button onClick={() => navigate('/notification')} className="cursor-pointer">Thông báo</button></li>
                </ul>
            </div>
        </>
    )
}

export default Navbar;