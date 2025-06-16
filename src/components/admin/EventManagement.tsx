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
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetEventsQuery, useCreateEventMutation, useUpdateEventMutation, useDeleteEventMutation, useGetCoursesQuery } from '../../api/courseApi';
import dayjs from 'dayjs';
import Event from '../../types/models/Event';

const EventManagement: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const { data: coursesData } = useGetCoursesQuery();
  const { data: eventsData, isLoading } = useGetEventsQuery(courseId || '');
  const [createEvent] = useCreateEventMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();

  const handleCourseChange = (value: string) => {
    navigate(`/admin/courses/${value}/events`);
  };

  const handleAdd = () => {
    if (!courseId) {
      message.error('Не выбран курс');
      return;
    }
    setEditingEvent(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: Event) => {
    setEditingEvent(record);
    form.setFieldsValue({
      ...record,
      event_date: dayjs(record.event_date)
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!courseId) {
      message.error('Не выбран курс');
      return;
    }
    try {
      await deleteEvent({ courseId, eventId }).unwrap();
      message.success('Событие успешно удалено');
    } catch (error) {
      message.error('Не удалось удалить событие');
    }
  };

  const handleSubmit = async () => {
    if (!courseId) {
      message.error('Не выбран курс');
      return;
    }
    try {
      const values = await form.validateFields();
      const eventData = {
        course_id: courseId,
        title: values.title,
        description: values.description,
        event_date: values.event_date.toISOString(),
        secret_info: values.secret_info
      };

      if (editingEvent) {
        await updateEvent({ 
          course_id: courseId,
          event_id: editingEvent.event_id,
          event: eventData
        }).unwrap();
        message.success('Событие успешно обновлено');
      } else {
        await createEvent({ 
          course_id: courseId,
          event: eventData
        }).unwrap();
        message.success('Событие успешно создано');
      }
      
      setIsModalVisible(false);
    } catch (error) {
      message.error('Операция не удалась');
    }
  };

  const columns = [
    {
      title: 'Название',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Дата',
      dataIndex: 'event_date',
      key: 'event_date',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: 'Секретная информация',
      dataIndex: 'secret_info',
      key: 'secret_info',
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: Event) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Вы уверены, что хотите удалить это событие?"
            onConfirm={() => handleDelete(record.event_id)}
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!courseId) {
    return (
      <div style={{ padding: '24px' }}>
        <Select
          style={{ width: '100%', marginBottom: '16px' }}
          placeholder="Выберите курс для управления событиями"
          onChange={handleCourseChange}
          value={courseId}
        >
          {coursesData?.courses.map(course => (
            <Select.Option key={course.course_id} value={course.course_id}>
              {course.name}
            </Select.Option>
          ))}
        </Select>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Select
        style={{ width: '100%', marginBottom: '16px' }}
        placeholder="Выберите курс"
        onChange={handleCourseChange}
        value={courseId}
      >
        {coursesData?.courses.map(course => (
          <Select.Option key={course.course_id} value={course.course_id}>
            {course.name}
          </Select.Option>
        ))}
      </Select>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAdd}
        style={{ marginBottom: '16px' }}
      >
        Добавить событие
      </Button>

      <Table 
        columns={columns} 
        dataSource={eventsData?.events || []} 
        rowKey="event_id"
        loading={isLoading}
      />

      <Modal
        title={editingEvent ? 'Редактировать событие' : 'Добавить событие'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
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
            name="event_date"
            label="Дата события"
            rules={[{ required: true, message: 'Пожалуйста, выберите дату!' }]}
          >
            <DatePicker showTime format="DD.MM.YYYY HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="secret_info"
            label="Секретная информация"
            rules={[{ required: true, message: 'Пожалуйста, введите секретную информацию!' }]}
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EventManagement; 