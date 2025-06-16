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
  InputNumber,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReadOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useGetCoursesQuery, useCreateCourseMutation, useUpdateCourseMutation, useDeleteCourseMutation } from '../../api/courseApi';

interface Course {
  course_id: string;
  name: string;
  description: string;
  price: {
    amount: number;
    currency_code: string;
  };
}

const CourseManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const navigate = useNavigate();

  const { data: coursesData, isLoading } = useGetCoursesQuery();
  const [createCourse] = useCreateCourseMutation();
  const [updateCourse] = useUpdateCourseMutation();
  const [deleteCourse] = useDeleteCourseMutation();

  const handleAdd = () => {
    setEditingCourse(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: Course) => {
    setEditingCourse(record);
    form.setFieldsValue({
      ...record,
      price: record.price.amount
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCourse(id).unwrap();
      message.success('Course deleted successfully');
    } catch (error) {
      message.error('Failed to delete course');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const courseData = {
        name: values.name,
        description: values.description,
        price: {
          amount: Number(values.price),
          currency_code: 'RUB'
        }
      };

      if (editingCourse) {
        await updateCourse({ 
          courseId: editingCourse.course_id,
          name: courseData.name,
          description: courseData.description,
          price: courseData.price
        }).unwrap();
        message.success('Курс успешно обновлен');
      } else {
        await createCourse(courseData).unwrap();
        message.success('Курс успешно создан');
      }
      
      setIsModalVisible(false);
    } catch (error) {
      console.error('Operation failed:', error);
      message.error('Операция не удалась');
    }
  };

  const columns = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Цена',
      dataIndex: ['price', 'amount'],
      key: 'price',
      render: (price: number) => `${price} ₽`,
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: Course) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            icon={<ReadOutlined />}
            onClick={() => navigate(`/admin/courses/${record.course_id}/lessons`)}
          >
            Уроки
          </Button>
          <Button
            icon={<CalendarOutlined />}
            onClick={() => navigate(`/admin/courses/${record.course_id}/events`)}
          >
            События
          </Button>
          <Popconfirm
            title="Вы уверены, что хотите удалить этот курс?"
            onConfirm={() => handleDelete(record.course_id)}
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAdd}
        style={{ marginBottom: '16px' }}
      >
        Добавить курс
      </Button>

      <Table 
        columns={columns} 
        dataSource={coursesData?.courses} 
        rowKey="course_id"
        loading={isLoading}
      />

      <Modal
        title={editingCourse ? 'Редактировать курс' : 'Добавить курс'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Название"
            rules={[{ required: true, message: 'Пожалуйста, введите название!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Описание"
            rules={[{ required: true, message: 'Пожалуйста, введите описание!' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="price"
            label="Цена (₽)"
            rules={[{ required: true, message: 'Пожалуйста, введите цену!' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseManagement; 