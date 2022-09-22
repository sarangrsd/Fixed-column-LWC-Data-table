import { LightningElement, api } from 'lwc';

export default class LM_LocalExpertEntryTypesTemplate extends LightningElement {

    @api entryType;
    @api isProfitLess;
    @api helpTextMsg;
    @api minimumHeight;

    connectedCallback(){
        this.minimumHeight = this.minimumHeight ? this.minimumHeight : '';
    }
}