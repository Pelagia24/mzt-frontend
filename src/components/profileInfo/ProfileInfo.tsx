import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { useGetProfileQuery, useUpdateProfileMutation } from '../../api/authApi';
import { useGetCoursesByUserIdQuery } from '../../api/courseApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { NavLink } from 'react-router-dom';
import styles from './profileInfo.module.scss';
import dayjs from 'dayjs';

interface EditFormData {
  name: string;
  birthdate: Date | null;
  phone_number: string;
  city: string;
  employment: string;
  is_business_owner: string;
  position_at_work: string;
  month_income: string;
  telegram: string;
}

const ProfileInfo = () => {
  const { data, isLoading, isError } = useGetProfileQuery();
  const { data: coursesData } = useGetCoursesByUserIdQuery();
  const [updateProfile] = useUpdateProfileMutation();
  const { id: userId } = useSelector((state: RootState) => state.authSlice);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editingField, setEditingField] = useState<keyof EditFormData | null>(null);
  const [formData, setFormData] = useState<EditFormData>({
    name: '',
    birthdate: null,
    phone_number: '',
    city: '',
    employment: '',
    is_business_owner: '',
    position_at_work: '',
    month_income: '',
    telegram: ''
  });

  const handleEdit = (field: keyof EditFormData) => {
    if (!data?.user) return;
    
    setEditingField(field);
    const value = data.user[field];
    setFormData({
      ...formData,
      [field]: field === 'birthdate' ? (value ? new Date(value) : null) : value
    });
    setEditDialogVisible(true);
  };

  const handleSave = async () => {
    if (!editingField || !data?.user || !userId) return;

    try {
      const value = formData[editingField];
      const updateData = {
        ...data.user,
        id: userId,
        [editingField]: editingField === 'month_income' 
          ? parseInt(value as string, 10) || 0
          : editingField === 'birthdate' && value instanceof Date
            ? value.toISOString()
            : value
      };
      
      await updateProfile(updateData).unwrap();
      setEditDialogVisible(false);
      setEditingField(null);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const renderEditDialog = () => {
    if (!editingField) return null;

    const fieldLabels: Record<keyof EditFormData, string> = {
      name: 'ФИО',
      birthdate: 'Дата рождения',
      phone_number: 'Номер телефона',
      city: 'Город',
      employment: 'Сфера деятельности',
      is_business_owner: 'Владелец бизнеса',
      position_at_work: 'Должность',
      month_income: 'Ежемесячный доход',
      telegram: 'Telegram'
    };

    const renderFieldInput = () => {
      switch (editingField) {
        case 'birthdate':
          return (
            <Calendar
              value={formData.birthdate || undefined}
              onChange={(e) => setFormData({ ...formData, birthdate: e.value || null })}
              dateFormat="dd.mm.yy"
              showIcon
              className="w-full"
            />
          );
        case 'is_business_owner':
          return (
            <Dropdown
              value={formData.is_business_owner}
              options={[
                { label: 'Да', value: 'yes' },
                { label: 'Нет', value: 'no' },
                { label: 'Другое', value: 'other' }
              ]}
              onChange={(e) => setFormData({ ...formData, is_business_owner: e.value })}
              className="w-full"
            />
          );
        case 'month_income':
          return (
            <InputText
              value={formData.month_income}
              onChange={(e) => setFormData({ ...formData, month_income: e.target.value.replace(/\D/g, '') })}
              className="w-full"
            />
          );
        default:
          return (
            <InputText
              value={formData[editingField] as string}
              onChange={(e) => setFormData({ ...formData, [editingField]: e.target.value })}
              className="w-full"
            />
          );
      }
    };

    return (
      <Dialog
        header={`Редактировать ${fieldLabels[editingField].toLowerCase()}`}
        visible={editDialogVisible}
        style={{ width: '450px' }}
        onHide={() => setEditDialogVisible(false)}
        footer={
          <div>
            <Button label="Отмена" icon="pi pi-times" onClick={() => setEditDialogVisible(false)} className="p-button-text" />
            <Button label="Сохранить" icon="pi pi-check" onClick={handleSave} autoFocus />
          </div>
        }
      >
        <div className="p-fluid">
          <div className="field">
            <label htmlFor={editingField}>{fieldLabels[editingField]}</label>
            {renderFieldInput()}
          </div>
        </div>
      </Dialog>
    );
  };

  const processMyCourses = () => {
    if (!coursesData || coursesData.courses.length === 0) {
      return <p>У вас пока что нет курсов</p>;
    }
    return (
      <div className={styles.coursesList}>
        {coursesData.courses.map((course) => (
          <NavLink key={course.course_id} className={styles.courseLink} to={`/course/${course.course_id}`}>
            {course.name}
          </NavLink>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div className={styles.wrapper}>Загрузка...</div>;
  }

  if (isError || !data) {
    return <div className={styles.wrapper}>Произошла ошибка, попробуйте позже</div>;
  }

  const { user } = data;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1>Моя информация</h1>
      </div>

      <div className={styles.section}>
        <h2>Мои курсы</h2>
        {processMyCourses()}
      </div>

      <div className={styles.section}>
        <h2>Личная информация</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label>ФИО</label>
            <div className={styles.value}>{user.name}</div>
            <Button icon="pi pi-pencil" className="p-button-text" onClick={() => handleEdit('name')} />
          </div>

          <div className={styles.infoItem}>
            <label>Дата рождения</label>
            <div className={styles.value}>{dayjs(user.birthdate).format('DD.MM.YYYY')}</div>
            <Button icon="pi pi-pencil" className="p-button-text" onClick={() => handleEdit('birthdate')} />
          </div>

          <div className={styles.infoItem}>
            <label>Город</label>
            <div className={styles.value}>{user.city}</div>
            <Button icon="pi pi-pencil" className="p-button-text" onClick={() => handleEdit('city')} />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Работа</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label>Сфера деятельности</label>
            <div className={styles.value}>{user.employment}</div>
            <Button icon="pi pi-pencil" className="p-button-text" onClick={() => handleEdit('employment')} />
          </div>

          <div className={styles.infoItem}>
            <label>Владелец бизнеса</label>
            <div className={styles.value}>
              {user.is_business_owner === 'yes' ? 'Да' : 
               user.is_business_owner === 'no' ? 'Нет' : 'Другое'}
            </div>
            <Button icon="pi pi-pencil" className="p-button-text" onClick={() => handleEdit('is_business_owner')} />
          </div>

          <div className={styles.infoItem}>
            <label>Должность</label>
            <div className={styles.value}>{user.position_at_work}</div>
            <Button icon="pi pi-pencil" className="p-button-text" onClick={() => handleEdit('position_at_work')} />
          </div>

          <div className={styles.infoItem}>
            <label>Ежемесячный доход</label>
            <div className={styles.value}>{`${user.month_income} ₽`}</div>
            <Button icon="pi pi-pencil" className="p-button-text" onClick={() => handleEdit('month_income')} />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Контакты</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label>Номер телефона</label>
            <div className={styles.value}>{user.phone_number}</div>
            <Button icon="pi pi-pencil" className="p-button-text" onClick={() => handleEdit('phone_number')} />
          </div>
          <div className={styles.infoItem}>
            <label>Telegram</label>
            <div className={styles.value}>{user.telegram || 'Не указан'}</div>
            <Button icon="pi pi-pencil" className="p-button-text" onClick={() => handleEdit('telegram')} />
          </div>
        </div>
      </div>

      {renderEditDialog()}
    </div>
  );
};

export default ProfileInfo;