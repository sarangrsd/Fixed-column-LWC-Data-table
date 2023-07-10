import { LightningElement } from 'lwc';

const dataFirstTable = [
    {id: 1, name: 'Robert Downy Sarang.', email: 'ironmandad@starc.com'},
    {id: 2, name: 'Robert Downy Jr.', email: 'ironman@starc.com'},
    {id: 3, name: 'Robert Downy Sr.', email: 'ironmandad@starc.com'},
    {id: 4, name: 'Robert Downy Jr.', email: 'ironman@starc.com'},
    {id: 5, name: 'Robert Downy Sr.', email: 'ironmandad@starc.com'},
    {id: 6, name: 'Robert Downy Jr.', email: 'ironman@starc.com'},
    {id: 7, name: 'Robert Downy Sr.', email: 'ironmandad@starc.com'},
    {id: 8, name: 'Robert Downy Jr.', email: 'ironman@starc.com'},
];
const columnFirstTable = [
    { label: 'Name', type:'fc_CustomCell',initialWidth: 200, typeAttributes :{value : { fieldName: 'name' }}},
    { label: 'Email', type:'fc_CustomCell', initialWidth: 200, typeAttributes :{value : { fieldName: 'email' }} }
];

const dataSecondTable = [
    { id: 1, age: 40,address: '107, Parkland avenue,near Mayfair Hotel,across Newlane street, London - 4521452'},
    { id: 2, age: 35,address: '107, Parkland avenue,near Mayfair Hotel,across Newlane street, London - 4521452' },
    { id: 3,age: 50,address: '107, Parkland avenue,near Mayfair Hotel,across Newlane street, London - 4521452' },
    { id: 4,age: 37,address:  '107, Parkland avenue,near Mayfair Hotel,across Newlane street, London - 4521452'},
    { id: 5, age: 40,address: '107, Parkland avenue,near Mayfair Hotel,across Newlane street, London - 4521452'},
    { id: 6, age: 35,address: '107, Parkland avenue,near Mayfair Hotel,across Newlane street, London - 4521452' },
    { id: 7,age: 50,address: '107, Parkland avenue,near Mayfair Hotel,across Newlane street, London - 4521452' },
    { id: 8,age: 37,address: '107, Parkland avenue,near Mayfair Hotel,across Newlane street, London - 4521452'},
];

const columnsSecondTable = [

    {
        label: 'Age',
        fieldName: 'age',
        type: 'number',
        sortable: true,
        cellAttributes: { alignment: 'left' }, initialWidth: 100
    },
    { label: 'Address', fieldName: 'address', type: 'text', wrapText: true, initialWidth: 200 },
    { label: 'Phone Number', fieldName: 'phone', type: 'phone', initialWidth: 200 },
    { label: 'Billing address', fieldName: 'billingAddress', type: 'text', wrapText: true, initialWidth: 200 },
    { label: 'Shipping Address', fieldName: 'shippingAddress', type: 'text', wrapText: true, initialWidth: 200 },
];

export default class fixedColumnedDatatable extends LightningElement {
    dataSecondTable = dataSecondTable;
    columnsSecondTable = columnsSecondTable;
    columnFirstTable = columnFirstTable;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;
    dataFirstTable = dataFirstTable;

    // Used to sort the 'Age' column
    sortBy(field, reverse, primer) {
        const key = primer
            ? function (x) {
                return primer(x[field]);
            }
            : function (x) {
                return x[field];
            };

        return function (a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    }

    onHandleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.dataSecondTable];

        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.dataSecondTable = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }
}