import React from 'react';
import { Layout, Button, Space } from 'antd';
import { LogoutOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLogoutUserMutation } from '../../api/authApi';
import styles from './header.module.scss';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  showLogout?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showLogout = true }) => {
  const navigate = useNavigate();
  const [logout] = useLogoutUserMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AntHeader className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.headerLeft}>
          <Button 
            type="text" 
            icon={<HomeOutlined />} 
            onClick={() => navigate('/')}
            className={styles.logoButton}
          >
            MZT
          </Button>
        </div>
        <div className={styles.headerRight}>
          {showLogout && (
            <Space>
              <Button 
                type="primary"
                danger
                icon={<LogoutOutlined />} 
                onClick={handleLogout}
              >
                Выйти
              </Button>
            </Space>
          )}
        </div>
      </div>
    </AntHeader>
  );
};

export default Header; 