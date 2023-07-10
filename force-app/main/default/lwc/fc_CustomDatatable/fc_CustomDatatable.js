import LightningDatatable from 'lightning/datatable';
import fc_CustomCell from './fc_CustomCell.html';

export default class Fc_CustomDatatable extends LightningDatatable  {
    static customTypes = {
        fc_CustomCell: {
            template: fc_CustomCell,
            typeAttributes: ['value'],
        }
    }
}