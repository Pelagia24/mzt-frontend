import {Navigate, Outlet} from 'react-router-dom';
import { useRefreshTokenQuery } from '../../api/authApi.ts';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const PrivateRoute = () => {
    const token = localStorage.getItem('access_token');
    const { id } = useSelector((state: RootState) => state.authSlice);
    
    if (!token) {
        return <Navigate to='/login' />;
    }

    if (!id) {
        const { isLoading, isError } = useRefreshTokenQuery();

        if (isLoading) {
            return <div>Loading...</div>;
        }

        if (isError) {
            return <Navigate to='/login' />;
        }
    }

    return <Outlet />;
};

export default PrivateRoute;