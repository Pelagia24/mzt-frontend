import React, { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Popconfirm,
  DatePicker,
  Select,
  InputNumber,
} from 'antd';
import { EditOutlined, DeleteOutlined, TransactionOutlined } from '@ant-design/icons';
import { useGetUsersQuery, useDeleteUserMutation, useUpdateUserMutation } from "../../api/adminApi";
import User from '../../types/models/User';
import TransactionTable from "../transactionTable/TransactionTable";
import dayjs from 'dayjs';

const AdminTable: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTransactionModalVisible, setIsTransactionModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const { data: usersData, isLoading } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const handleEdit = (record: User) => {
    setEditingUser(record);
    form.setFieldsValue({
      ...record,
      birthdate: dayjs(record.birthdate)
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id).unwrap();
      message.success('Пользователь успешно удален');
    } catch (error) {
      message.error('Не удалось удалить пользователя');
    }
  };

  const handleShowTransactions = (userId: string) => {
    setSelectedUserId(userId);
    setIsTransactionModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const userData = {
        ...values,
        birthdate: values.birthdate.toISOString(),
        age: dayjs().diff(values.birthdate, 'year')
      };

      if (editingUser) {
        await updateUser({ ...editingUser, ...userData }).unwrap();
        message.success('Пользователь успешно обновлен');
      }
      
      setIsModalVisible(false);
    } catch (error) {
      message.error('Операция не удалась');
    }
  };

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'ФИО',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Возраст',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Дата рождения',
      dataIndex: 'birthdate',
      key: 'birthdate',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Телефон',
      dataIndex: 'phone_number',
      key: 'phone_number',
    },
    {
      title: 'Город',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: 'Сфера деятельности',
      dataIndex: 'employment',
      key: 'employment',
    },
    {
      title: 'Владелец бизнеса',
      dataIndex: 'is_business_owner',
      key: 'is_business_owner',
      render: (value: string) => {
        switch (value) {
          case 'yes': return 'Да';
          case 'no': return 'Нет';
          case 'other': return 'Другое';
          default: return value;
        }
      }
    },
    {
      title: 'Должность',
      dataIndex: 'position_at_work',
      key: 'position_at_work',
    },
    {
      title: 'Доход',
      dataIndex: 'month_income',
      key: 'month_income',
      render: (value: number) => `${value} ₽`,
    },
    {
      title: 'Telegram',
      dataIndex: 'telegram',
      key: 'telegram',
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            icon={<TransactionOutlined />}
            onClick={() => handleShowTransactions(record.id)}
          />
          <Popconfirm
            title="Вы уверены, что хотите удалить этого пользователя?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Table 
        columns={columns} 
        dataSource={usersData?.users} 
        rowKey="id"
        loading={isLoading}
      />

      <Modal
        title="Редактировать пользователя"
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="ФИО"
            rules={[{ required: true, message: 'Пожалуйста, введите ФИО!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="birthdate"
            label="Дата рождения"
            rules={[{ required: true, message: 'Пожалуйста, выберите дату рождения!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="phone_number"
            label="Телефон"
            rules={[
              { required: true, message: 'Пожалуйста, введите номер телефона!' },
              { pattern: /^\+\d{10,15}$/, message: 'Неверный формат номера телефона!' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="city"
            label="Город"
            rules={[{ required: true, message: 'Пожалуйста, введите город!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="employment"
            label="Сфера деятельности"
            rules={[{ required: true, message: 'Пожалуйста, введите сферу деятельности!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="is_business_owner"
            label="Владелец бизнеса"
            rules={[{ required: true, message: 'Пожалуйста, выберите статус!' }]}
          >
            <Select>
              <Select.Option value="yes">Да</Select.Option>
              <Select.Option value="no">Нет</Select.Option>
              <Select.Option value="other">Другое</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="position_at_work"
            label="Должность"
            rules={[{ required: true, message: 'Пожалуйста, введите должность!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="month_income"
            label="Доход (₽)"
            rules={[{ required: true, message: 'Пожалуйста, введите доход!' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="telegram"
            label="Telegram"
            rules={[
              { pattern: /^@[\w\d]{5,32}$/, message: 'Неверный формат Telegram!' }
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <TransactionTable 
        userId={selectedUserId} 
        visible={isTransactionModalVisible} 
        setVisible={setIsTransactionModalVisible} 
      />
    </div>
  );
};

export default AdminTable;
