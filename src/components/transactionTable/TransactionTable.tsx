import {Dialog} from "primereact/dialog";
import {useGetUserTransactionsQuery} from "../../api/adminApi.ts";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {skipToken} from "@reduxjs/toolkit/query";

interface Props {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    userId: string;
}

interface Transaction {
    payment_id: string;
    user_id: string;
    course_id: string;
    amount: number;
    currency_code: string;
    date: string;
    status: string;
    payment_ref: string;
}

const TransactionTable = ({visible, setVisible, userId}: Props) => {
    const {data} = useGetUserTransactionsQuery(userId && visible ? userId : skipToken);

    const dateTemplate = (transaction: Transaction) => {
        return new Date(transaction.date).toLocaleDateString("ru-RU");
    };

    const amountTemplate = (transaction: Transaction) => {
        return `${transaction.amount} ${transaction.currency_code}`;
    };

    return (
        <Dialog 
            header="Транзакции" 
            visible={visible} 
            onHide={() => {if (!visible) return; setVisible(false);}}
            style={{width: '80vw'}}
        >
            <DataTable value={data as Transaction[]} tableStyle={{minWidth: '50rem'}}>
                <Column field="payment_id" header="ID платежа"></Column>
                <Column field="course_id" header="ID курса"></Column>
                <Column field="amount" header="Сумма" body={amountTemplate}></Column>
                <Column field="date" header="Дата" body={dateTemplate}></Column>
                <Column field="status" header="Статус"></Column>
                <Column field="payment_ref" header="Референс платежа"></Column>
            </DataTable>
        </Dialog>
    );
}

export default TransactionTable;