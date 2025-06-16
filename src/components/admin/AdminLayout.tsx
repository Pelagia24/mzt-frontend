import React from 'react';
import { Layout, Menu } from 'antd';
import { BookOutlined, UserOutlined } from '@ant-design/icons';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import CourseManagement from './CourseManagement';
import EventManagement from './EventManagement';
import LessonManagement from './LessonManagement';
import AdminTable from '../adminTable/AdminTable';
import NavBar from '../navBar/NavBar';
import styles from './adminLayout.module.scss';

const { Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'Пользователи',
    },
    {
      key: 'courses',
      icon: <BookOutlined />,
      label: 'Курсы',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(`/admin/${key}`);
  };

  return (
    <Layout className={styles.layout}>
      <NavBar />
      <Layout>
        <Sider width={250} className={styles.sider}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname.split('/')[2] || 'users']}
            className={styles.menu}
            items={menuItems}
            onClick={handleMenuClick}
          />
        </Sider>
        <Layout className={styles.contentLayout}>
          <Content className={styles.content}>
            <Routes>
              <Route path="users" element={<AdminTable />} />
              <Route path="courses" element={<CourseManagement />} />
              <Route path="courses/:courseId/lessons" element={<LessonManagement />} />
              <Route path="courses/:courseId/events" element={<EventManagement />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminLayout; 