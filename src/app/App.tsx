import {PrimeReactProvider} from 'primereact/api';
import {Route, BrowserRouter as Router, Routes, Navigate} from 'react-router-dom';
import {LoginPage} from '../pages/loginPage/loginPage';
import {RegistrationPage} from '../pages/registrationPage/registrationPage';
import MainPage from "../pages/mainPage/MainPage.tsx";
import ProfilePage from "../pages/profilePage/ProfilePage.tsx";
import PrivateRoute from "../components/privateRoute/PrivateRoute.tsx";
import AdminLayout from "../components/admin/AdminLayout.tsx";
import CoursePage from "../pages/coursePage/CoursePage.tsx";

function App() {
    return (
        <PrimeReactProvider>
            <Router>
                <Routes>
                    <Route path='/login' element={<LoginPage/>}/>
                    <Route path='/signup' element={<RegistrationPage/>}/>
                    <Route element={<PrivateRoute />}>
                        <Route path='/profile' element={<ProfilePage/>} />
                        <Route path='/course/:courseId' element={<CoursePage/>}/>
                    </Route>
                    <Route path='/admin/*' element={<AdminLayout />} />
                    <Route path='/' element={<MainPage/>}/>
                </Routes>
            </Router>
        </PrimeReactProvider>
    );
}

export default App;
