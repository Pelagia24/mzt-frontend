import {Menubar} from 'primereact/menubar';
import {Button} from "primereact/button";
import {NavLink, useNavigate} from "react-router-dom";
import {Avatar} from "primereact/avatar";
import styles from "./NavBar.module.scss";
import {useSelector} from "react-redux";
import {RootState} from "../../store";
import {useRefreshTokenQuery} from "../../api/authApi.ts";

const NavBar = () => {
    useRefreshTokenQuery();
    const navigate = useNavigate();
    const {role} = useSelector((state: RootState) => state.authSlice);

    const start = <NavLink to={'/'}><img alt="Логотип MZT" src="/logo.png" height="40"
                                         className="mr-2"></img></NavLink>;
    const unauthorizedLinks = (
        <Button onClick={() => navigate('/login')}>Войти</Button>
    );
    const authorizedLinks = (
        <div className={styles.links}>
            <NavLink to={'/profile'}><Avatar className={styles.badge} shape={"circle"} icon="pi pi-user"
                                             size="large"/></NavLink>
            {role === 'Admin' && <Button onClick={() => navigate('/admin')}>Админ-панель</Button>}
        </div>
    )

    return (
        <div className="card">
            <Menubar start={start} end={localStorage.getItem('access_token') ? authorizedLinks : unauthorizedLinks}/>
        </div>
    )
}

export default NavBar;