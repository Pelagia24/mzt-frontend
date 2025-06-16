import { Button } from "primereact/button";
import { NavLink, useNavigate } from "react-router-dom";
import { Avatar } from "primereact/avatar";
import styles from "./navBar.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useRefreshTokenQuery, useLogoutUserMutation } from "../../api/authApi.ts";

const NavBar = () => {
    useRefreshTokenQuery();
    const navigate = useNavigate();
    const { role } = useSelector((state: RootState) => state.authSlice);
    const [logout] = useLogoutUserMutation();

    const handleLogout = async () => {
        try {
            await logout().unwrap();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.navbarContent}>
                <div className={styles.navbarLeft}>
                    <NavLink to="/" className={styles.logo}>
                        <img src="/logo.png" alt="Логотип MZT" height="40" />
                        <span className={styles.logoText}>MZT</span>
                    </NavLink>
                </div>

                <div className={styles.navbarRight}>
                    {localStorage.getItem('access_token') ? (
                        <div className={styles.authLinks}>
                            <NavLink to="/profile" className={styles.profileLink}>
                                <Avatar 
                                    icon="pi pi-user" 
                                    className={styles.avatar}
                                    size="large"
                                />
                            </NavLink>
                            {role === 'Admin' && (
                                <Button 
                                    icon="pi pi-cog"
                                    label="Админ-панель"
                                    className={styles.adminButton}
                                    onClick={() => navigate('/admin/users')}
                                />
                            )}
                            <Button 
                                icon="pi pi-sign-out"
                                label="Выйти"
                                severity="danger"
                                className={styles.logoutButton}
                                onClick={handleLogout}
                            />
                        </div>
                    ) : (
                        <Button 
                            icon="pi pi-sign-in"
                            label="Войти"
                            className={styles.loginButton}
                            onClick={() => navigate('/login')}
                        />
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;