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
  Select,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetLessonsQuery, useCreateLessonMutation, useUpdateLessonMutation, useDeleteLessonMutation, useGetCoursesQuery } from '../../api/courseApi';

interface Lesson {
  lesson_id: string;
  title: string;
  summery: string;
  course_id: string;
  video_url: string;
  text: string;
}

const LessonManagement: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const { data: coursesData } = useGetCoursesQuery();
  const { data: lessonsData, isLoading } = useGetLessonsQuery(courseId || '');
  const [createLesson] = useCreateLessonMutation();
  const [updateLesson] = useUpdateLessonMutation();
  const [deleteLesson] = useDeleteLessonMutation();

  const handleCourseChange = (value: string) => {
    navigate(`/admin/courses/${value}/lessons`);
  };

  const handleAdd = () => {
    if (!courseId) {
      message.error('Не выбран курс');
      return;
    }
    setEditingLesson(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: Lesson) => {
    setEditingLesson(record);
    form.setFieldsValue({
      title: record.title,
      description: record.summery,
      summaryURL: record.text,
      video_url: record.video_url
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (lessonId: string) => {
    if (!courseId) {
      message.error('Не выбран курс');
      return;
    }
    try {
      await deleteLesson({ courseId, lessonId }).unwrap();
      message.success('Урок успешно удален');
    } catch (error) {
      message.error('Не удалось удалить урок');
    }
  };

  const handleSubmit = async () => {
    if (!courseId) {
      message.error('Не выбран курс');
      return;
    }
    try {
      const values = await form.validateFields();
      const lessonData = {
        title: values.title,
        description: values.description,
        summaryURL: values.summaryURL,
        video_url: values.video_url
      };

      if (editingLesson) {
        await updateLesson({ 
          lessonId: editingLesson.lesson_id,
          course_id: editingLesson.course_id,
          ...lessonData 
        }).unwrap();
        message.success('Урок успешно обновлен');
      } else {
        await createLesson({
          course_id: courseId,
          ...lessonData
        }).unwrap();
        message.success('Урок успешно создан');
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
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Описание',
      dataIndex: 'summery',
      key: 'summery',
    },
    {
      title: 'Видео',
      dataIndex: 'video_url',
      key: 'video_url',
      render: (url: string) => url ? 'Есть' : 'Нет',
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: Lesson) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Вы уверены, что хотите удалить этот урок?"
            onConfirm={() => handleDelete(record.lesson_id)}
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
          placeholder="Выберите курс для управления уроками"
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
        Добавить урок
      </Button>

      <Table 
        columns={columns} 
        dataSource={lessonsData?.lessons?.map(lesson => ({ ...lesson })) || []} 
        rowKey="lesson_id"
        loading={isLoading}
      />

      <Modal
        title={editingLesson ? 'Редактировать урок' : 'Добавить урок'}
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
            name="video_url"
            label="Видео URL"
            rules={[{ required: true, message: 'Пожалуйста, введите URL видео!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="summaryURL"
            label="Текст урока"
            rules={[{ required: true, message: 'Пожалуйста, введите текст урока!' }]}
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LessonManagement; 