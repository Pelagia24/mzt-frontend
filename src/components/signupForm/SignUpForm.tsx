import {useEffect, useState, JSX} from 'react';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import authFormStyles from './signUpForm.module.scss';
import { NavLink, useNavigate } from 'react-router-dom';
import { useRegisterUserMutation } from '../../api/authApi.ts';

interface FormData {
    fullName: string;
    birthDate: Date | null;
    email: string;
    password: string;
    phone: string;
    city: string;
    age: string;
    profession: string;
    isOwner: string;
    position: string;
    income: string;
    telegram: string;
};

// Вспомогательные функции для очистки ввода
const sanitizeDigits = (value: string): string => value.replace(/\D/g, '');

const sanitizePhone = (value: string): string => {
    if (!value) return '';
    if (!value.startsWith('+')) value = '+' + value;
    return '+' + value.substring(1).replace(/\D/g, '');
};

const sanitizeTelegram = (value: string): string => {
    if (!value) return '';
    if (!value.startsWith('@')) value = '@' + value;
    // Ограничиваем длину: '@' + не более 32 символов
    return value.length > 33 ? value.substring(0, 33) : value;
};

const SignUpForm = () => {
    const [registerUser, { isSuccess }] = useRegisterUserMutation();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        birthDate: null,
        email: '',
        password: '',
        phone: '',
        city: '',
        age: '',
        profession: '',
        isOwner: '',
        position: '',
        income: '',
        telegram: '',
    });

    useEffect(() => {
        if (isSuccess) {
            navigate('/');
        }
    }, [isSuccess, navigate]);

    // Функции валидации
    const isEmailValid = (email: string): boolean => /^\S+@\S+\.\S+$/.test(email);
    const isPasswordValid = (password: string): boolean => password.length >= 8;
    // Номер телефона должен начинаться с + и содержать от 10 до 15 цифр после +
    const isPhoneValid = (phone: string): boolean => /^\+\d{10,15}$/.test(phone);

    // Универсальное обновление данных формы
    const handleChange = (field: keyof FormData, value: string | Date | null) =>
        setFormData(prev => ({ ...prev, [field]: value }));

    // Автоматический расчет возраста по дате рождения
    useEffect(() => {
        if (formData.birthDate) {
            const birth = new Date(formData.birthDate);
            const today = new Date();
            let computedAge = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) computedAge--;
            handleChange('age', computedAge.toString());
        } else {
            handleChange('age', '');
        }
    }, [formData.birthDate]);

    // Функции валидации шагов
    const validateStep1 = () =>
        Boolean(formData.fullName &&
            formData.birthDate &&
            formData.email &&
            isEmailValid(formData.email) &&
            formData.password &&
            isPasswordValid(formData.password));

    const validateStep2 = () =>
        Boolean(formData.phone &&
            isPhoneValid(formData.phone) &&
            formData.city &&
            formData.age &&
            formData.profession);

    const validateStep3 = (): boolean =>
        Boolean(formData.isOwner &&
            formData.position &&
            formData.income &&
            (formData.telegram === '' ||
                (formData.telegram.startsWith('@') &&
                    formData.telegram.slice(1).length >= 5 &&
                    formData.telegram.slice(1).length <= 32)));

    const onSubmit = (): void => {
        setSubmitted(true);
        if (validateStep3()) {
            registerUser({
                email: formData.email,
                password: formData.password,
                age: parseInt(formData.age),
                birthdate: (formData.birthDate as Date).toISOString(),
                city: formData.city,
                employment: formData.profession,
                is_business_owner: formData.isOwner,
                month_income: parseInt(formData.income),
                name: formData.fullName,
                position_at_work: formData.position,
                phone_number: formData.phone,
                telegram: formData.telegram,
            });
        }
    };

    // Универсальная функция отрисовки поля с меткой и условным сообщением об ошибке
    const renderField = (
        label: string,
        element: JSX.Element,
        errorMsg?: string
    ) => (
        <div className="field">
            <label className="block text-900 font-medium mb-2">{label}</label>
            {element}
            {submitted && errorMsg && <small className="p-error">{errorMsg}</small>}
        </div>
    );

    // Отрисовка шагов
    const renderStep1 = () => (
        <>
            {renderField(
                'ФИО',
                <InputText
                    value={formData.fullName}
                    onChange={e => handleChange('fullName', e.target.value)}
                    className={classNames({ 'p-invalid': submitted && !formData.fullName }, 'w-full mb-1')}
                />,
                submitted && !formData.fullName ? 'Введите ФИО' : undefined
            )}
            {renderField(
                'Дата рождения',
                <Calendar
                    value={formData.birthDate}
                    onChange={e => handleChange('birthDate', e.value!)}
                    showIcon
                    dateFormat="dd.mm.yy"
                    className={classNames({ 'p-invalid': submitted && !formData.birthDate }, 'w-full mb-1')}
                />,
                submitted && !formData.birthDate ? 'Выберите дату рождения' : undefined
            )}
            {renderField(
                'Email',
                <InputText
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value)}
                    className={classNames(
                        { 'p-invalid': submitted && (!formData.email || !isEmailValid(formData.email)) },
                        'w-full mb-1'
                    )}
                />,
                submitted
                    ? !formData.email
                        ? 'Введите email'
                        : !isEmailValid(formData.email)
                            ? 'Неверный email'
                            : undefined
                    : undefined
            )}
            {renderField(
                'Пароль',
                <InputText
                    type="password"
                    value={formData.password}
                    onChange={e => handleChange('password', e.target.value)}
                    className={classNames(
                        { 'p-invalid': submitted && (!formData.password || !isPasswordValid(formData.password)) },
                        'w-full mb-1'
                    )}
                />,
                submitted
                    ? !formData.password
                        ? 'Введите пароль'
                        : !isPasswordValid(formData.password)
                            ? 'Мин. 8 символов'
                            : undefined
                    : undefined
            )}
            <Button
                label="Далее"
                onClick={() => {
                    setSubmitted(true);
                    if (validateStep1()) {
                        setStep(2);
                        setSubmitted(false);
                    }
                }}
            />
        </>
    );

    const renderStep2 = () => (
        <>
            {renderField(
                'Номер телефона',
                <InputText
                    value={formData.phone}
                    onChange={e =>
                        handleChange('phone', sanitizePhone(e.target.value))
                    }
                    className={classNames(
                        { 'p-invalid': submitted && (!formData.phone || !isPhoneValid(formData.phone)) },
                        'w-full mb-1'
                    )}
                />,
                submitted
                    ? !formData.phone
                        ? 'Введите номер телефона'
                        : !isPhoneValid(formData.phone)
                            ? 'Номер должен начинаться с + и содержать от 10 до 15 цифр'
                            : undefined
                    : undefined
            )}
            {renderField(
                'Город',
                <InputText
                    value={formData.city}
                    onChange={e => handleChange('city', e.target.value)}
                    className={classNames({ 'p-invalid': submitted && !formData.city }, 'w-full mb-1')}
                />,
                submitted && !formData.city ? 'Введите город проживания' : undefined
            )}
            {renderField(
                'Возраст',
                <InputText
                    value={formData.age}
                    readOnly
                    className={classNames({ 'p-invalid': submitted && !formData.age }, 'w-full mb-1')}
                />,
                submitted && !formData.age ? 'Введите свой возраст' : undefined
            )}
            {renderField(
                'Сфера деятельности',
                <InputText
                    value={formData.profession}
                    onChange={e => handleChange('profession', e.target.value)}
                    className={classNames({ 'p-invalid': submitted && !formData.profession }, 'w-full mb-1')}
                />,
                submitted && !formData.profession ? 'Введите вашу сферу деятельности' : undefined
            )}
            <div>
                <Button label="Назад" className="p-button-secondary mr-2" onClick={() => setStep(1)} />
                <Button
                    label="Далее"
                    onClick={() => {
                        setSubmitted(true);
                        if (validateStep2()) {
                            setStep(3);
                            setSubmitted(false);
                        }
                    }}
                />
            </div>
        </>
    );

    const renderStep3 = () => (
        <>
            {renderField(
                'Вы собственник бизнеса?',
                <Dropdown
                    value={formData.isOwner}
                    options={[
                        { label: 'Да', value: 'yes' },
                        { label: 'Нет', value: 'no' },
                        { label: 'Другое', value: 'other' }
                    ]}
                    onChange={e => handleChange('isOwner', e.value)}
                    placeholder="Выберите"
                    className={classNames({ 'p-invalid': submitted && !formData.isOwner }, 'w-full mb-1')}
                />,
                submitted && !formData.isOwner ? 'Выберите вариант' : undefined
            )}
            {renderField(
                'Должность',
                <InputText
                    value={formData.position}
                    onChange={e => handleChange('position', e.target.value)}
                    className={classNames({ 'p-invalid': submitted && !formData.position }, 'w-full mb-1')}
                />,
                submitted && !formData.position ? 'Введите свою должность' : undefined
            )}
            {renderField(
                'Ежемесячный личный доход',
                <InputText
                    value={formData.income}
                    onChange={e =>
                        handleChange('income', sanitizeDigits(e.target.value))
                    }
                    className={classNames({ 'p-invalid': submitted && !formData.income }, 'w-full mb-1')}
                />,
                submitted && !formData.income ? 'Введите Ваш доход' : undefined
            )}
            {renderField(
                'Ник в Телеграме (необязательно)',
                <InputText
                    value={formData.telegram}
                    onChange={e =>
                        handleChange('telegram', sanitizeTelegram(e.target.value))
                    }
                    className="w-full mb-1"
                />,
                formData.telegram !== '' &&
                ( !formData.telegram.startsWith('@') ||
                    formData.telegram.slice(1).length < 5 ||
                    formData.telegram.slice(1).length > 32)
                    ? 'Телеграм должен начинаться с @ и содержать от 5 до 32 символов (без @)'
                    : undefined
            )}
            <div>
                <Button label="Назад" className="p-button-secondary mr-2" onClick={() => setStep(2)} />
                <Button label="Зарегистрироваться" onClick={onSubmit} />
            </div>
        </>
    );

    return (
        <div className={authFormStyles.container}>
            <div className="surface-card p-4 shadow-2 border-round w-30rem">
                <div className="text-center mb-5">
                    <img src="/logo.png" alt="Логотип MZT" height={100} className="mb-3" />
                    <div className="text-900 text-3xl font-medium mb-3">Давайте знакомиться!</div>
                    <span className="text-600 font-medium line-height-3">Есть аккаунт?</span>
                    <NavLink to="/login">&nbsp;Войдите</NavLink>
                </div>
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </div>
        </div>
    );
};

export default SignUpForm;
