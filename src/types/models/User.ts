interface User {
    id: string;
    email: string;
    age: number;
    birthdate: string;
    city: string;
    employment: string;
    is_business_owner: 'yes' | 'no' | 'other';
    month_income: number;
    name: string;
    phone_number: string;
    position_at_work: string;
    telegram: string
}

export default User;