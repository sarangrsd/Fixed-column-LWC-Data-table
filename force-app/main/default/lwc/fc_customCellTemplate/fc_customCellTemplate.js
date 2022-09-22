import { LightningElement,api } from 'lwc';

export default class fc_customCellTemplate extends LightningElement {
    @api value;
    @api minimumHeight;

    connectedCallback(){
        this.minimumHeight = 'minimumHeight';
    }
}