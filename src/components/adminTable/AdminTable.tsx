import React from 'react';
import { DataTable, DataTableRowEditCompleteEvent } from 'primereact/datatable';
import { Column, ColumnEditorOptions } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import styles from './adminTableStyles.module.scss';
import User from '../../types/models/User.ts';
import {useDeleteUserMutation, useGetUsersQuery, useUpdateUserMutation} from "../../api/adminApi.ts";

/**
 * Вспомогательные функции
 */

// Извлекаем только цифры (для дохода)
const sanitizeDigits = (value: string): string => value.replace(/\D/g, '');

// Для поля телефона: если значение не начинается с "+" — добавляем его, оставляем только цифры после
const sanitizePhone = (value: string): string => {
    if (!value) return '';
    if (!value.startsWith('+')) value = '+' + value;
    return '+' + value.substring(1).replace(/\D/g, '');
};

// Для Telegram: если не начинается с "@", добавляем; ограничиваем длину до "@"+32 символа.
const sanitizeTelegram = (value: string): string => {
    if (!value) return '';
    if (!value.startsWith('@')) value = '@' + value;
    return value.length > 33 ? value.substring(0, 33) : value;
};

// Пересчет возраста по дате рождения
const computeAge = (birthdate: string): number => {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

// Валидация пользователя (email не редактируется)
const validateUser = (user: User): boolean => {
    if (!user.name) return false;
    if (!user.birthdate) return false;
    if (!/^\+\d{10,15}$/.test(user.phone_number)) return false;
    if (!user.city) return false;
    if (!user.employment) return false;
    if (!user.is_business_owner) return false;
    if (!user.position_at_work) return false;
    if (isNaN(user.month_income) || user.month_income <= 0) return false;
    if (user.telegram) {
        if (!user.telegram.startsWith('@')) return false;
        const len = user.telegram.slice(1).length;
        if (len < 5 || len > 32) return false;
    }
    return true;
};

export default function AdminTable() {
    const {data: usersFromServer, isLoading} = useGetUsersQuery();
    const [deleteUser] = useDeleteUserMutation();
    const [updateUser] = useUpdateUserMutation();

    // Обработчик завершения редактирования строки
    const onRowEditComplete = (e: DataTableRowEditCompleteEvent) => {
        const { newData } = e;
        // Пересчитываем возраст, если изменена дата рождения
        if (newData.birthdate) {
            newData.age = computeAge(newData.birthdate as string);
        }
        if (!validateUser(newData as User)) {
            // Можно вывести сообщение об ошибке (например, через Toast или alert)
            alert('Некорректные данные, изменения не сохранены!');
            return;
        }
        updateUser(newData as User);
    };

    const textEditor = (options: ColumnEditorOptions) => {
        return (
            <InputText
                type="text"
                value={options.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    options.editorCallback!(e.target.value)
                }
            />
        );
    };

    const calendarEditor = (options: ColumnEditorOptions) => {
        return (
            <Calendar
                value={options.value}
                onChange={(e) => options.editorCallback!(e.value)}
                dateFormat="dd.mm.yy"
            />
        );
    };

    const phoneEditor = (options: ColumnEditorOptions) => {
        return (
            <InputText
                type="text"
                value={options.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    options.editorCallback!(sanitizePhone(e.target.value))
                }
            />
        );
    };

    const incomeEditor = (options: ColumnEditorOptions) => {
        return (
            <InputText
                type="text"
                value={options.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    options.editorCallback!(parseInt(sanitizeDigits(e.target.value)))
                }
            />
        );
    };

    const telegramEditor = (options: ColumnEditorOptions) => {
        return (
            <InputText
                type="text"
                value={options.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    options.editorCallback!(sanitizeTelegram(e.target.value))
                }
            />
        );
    };

    const dropdownEditor = (options: ColumnEditorOptions) => {
        return (
            <Dropdown
                value={options.value}
                options={[
                    { label: 'Да', value: 'yes' },
                    { label: 'Нет', value: 'no' },
                    { label: 'Другое', value: 'other' }
                ]}
                onChange={(e: DropdownChangeEvent) =>
                    options.editorCallback!(e.value)
                }
                placeholder="Выберите"
            />
        );
    };

    const dateTemplate = (user: User) =>
        new Date(user.birthdate).toLocaleDateString("ru-RU");

    const businessOwnerTemplate = (user: User) => {
        switch (user.is_business_owner) {
            case 'yes':
                return 'Да';
            case 'no':
                return 'Нет';
            case 'other':
                return 'Другое';
            default:
                return '';
        }
    };

    return (
        <div className={styles.section}>
            <h1 className={styles.heading}>Таблица пользователей</h1>
            <DataTable
                loading={isLoading}
                value={usersFromServer?.users}
                editMode="row"
                dataKey="email" // email используется как уникальный идентификатор и не редактируется
                onRowEditComplete={onRowEditComplete}
                tableStyle={{ minWidth: '50rem' }}
            >
                <Column field="email" header="Email"></Column>
                <Column field="name" header="ФИО" editor={(options) => textEditor(options)}></Column>
                <Column field="age" header="Возраст" body={(user: User) => user.age}></Column>
                <Column
                    field="birthdate"
                    header="Дата рождения"
                    editor={(options) => calendarEditor(options)}
                    body={(user: User) => dateTemplate(user)}
                ></Column>
                <Column field="phone_number" header="Телефон" editor={(options) => phoneEditor(options)}></Column>
                <Column field="city" header="Город" editor={(options) => textEditor(options)}></Column>
                <Column field="employment" header="Сфера деятельности" editor={(options) => textEditor(options)}></Column>
                <Column
                    field="is_business_owner"
                    header="Владелец бизнеса"
                    editor={(options) => dropdownEditor(options)}
                    body={(user: User) => businessOwnerTemplate(user)}
                ></Column>
                <Column field="position_at_work" header="Должность" editor={(options) => textEditor(options)}></Column>
                <Column field="month_income" header="Доход" editor={(options) => incomeEditor(options)}></Column>
                <Column field="telegram" header="Telegram" editor={(options) => telegramEditor(options)}></Column>
                <Column rowEditor header="Редактировать" style={{ minWidth: '8rem' }}></Column>
                <Column
                    header="Удалить"
                    body={(user: User) => (
                        <Button
                            severity="danger"
                            label="Удалить"
                            onClick={() =>
                                deleteUser(user.id)
                            }
                        />
                    )}
                ></Column>
            </DataTable>
        </div>
    );
}
