/*
    Created by: Sarang D
    Description : This is the template bundle for selected quantity column in the custom datatable used in lM_LocalExpertComponent
*/
import { LightningElement, api } from 'lwc';

export default class LM_LocalExpertInputTemplate extends LightningElement {

    @api uniqMarketCity;
    @api quantity;
    @api minQuantity;
    @api selectedQuantity;
    @api uniqueMarket;
    @api type;
    @api quantityExceededMsg;
    @api invalidQuantityMsg;
    @api isInputFieldVisible;
    @api isConnections;
    @api hasAEXAsset;
    @api idType; 
    @api styleClass;


    connectedCallback() {
        // if (this.id.includes('-')) {
        //     let index = this.id.indexOf('-');
        //     this.id = this.id.slice(0, index);
        // }
        this.styleClass = (this.styleClass==undefined)?'slds-p-around_small adjustPadding':this.styleClass;
        this.type=='marketreach' ? document.documentElement.style.setProperty('--width', '100%') : document.documentElement.style.setProperty('--width', '67%');
    }
    

    // Dispatch event to parent component on value change
    handleChange(event) {
        let value = event.target.value;
        let id;
        let input;

        console.log('data Type >> '+ this.idType);
        input = this.template.querySelector(`[name="${this.idType}"]`);
        // if (this.id.includes('-')) {
        //     let index = this.id.indexOf('-');
        //     id = this.id.slice(0, index);
        // }
        // else {
            id = this.uniqMarketCity;
        // }
        
       // for market reach product 
        if(this.type=='marketreach'){
            if(event.type !== 'keyup'){

                if (!this.hasAEXAsset) {
                    if(value){
                        if (parseInt(value) < this.minQuantity) {
                            input.setCustomValidity(this.quantityExceededMsg);
                            input.reportValidity();
                            setTimeout(() => {
                                input.value = null;
                                this.sendDataToParent(id,null);
                            }, 50);
                        
                        }
                        else{
                            input.setCustomValidity('');
                            input.reportValidity();
                            this.sendDataToParent(id,value);
                        }
                    }
                    else{
                        input.setCustomValidity('');
                        input.reportValidity();
                        this.sendDataToParent(id,null);
                    }
                }
                else{
                    input.setCustomValidity(this.invalidQuantityMsg);
                    setTimeout(() => {
                        input.value = null;
                        this.sendDataToParent(id,null);
                    }, 50);
                }
                console.log('your Id >> '+id)
                console.log('your Entered >> '+value)
            }
        }

        //for local export and connection
        else{
            if (value > this.quantity) {
                input.setCustomValidity(this.quantityExceededMsg);
                input.reportValidity();
                setTimeout(() => {
                    input.value = null;
                    this.sendDataToParent(id,null);
                }, 50);
                return;
            }
            if (value == '0' || value.includes('-') || value.includes('.')) {
                input.setCustomValidity(this.invalidQuantityMsg);
                input.reportValidity();
                setTimeout(() => {
                    input.value = null;
                    this.sendDataToParent(id,null);
                }, 50);
                return;
            }
            input.setCustomValidity('');
            input.reportValidity();
            if(event.type=='change'){
                this.sendDataToParent(id,value);
            }
        }
    }

    sendDataToParent(id,value){
        const eventUpdate = CustomEvent('quantityupdate', {
            composed: true,
            bubbles: true,
            detail: { id: this.uniqMarketCity, value: value, uniqueMarket: this.uniqueMarket,type:this.type }
        });
        this.dispatchEvent(eventUpdate);
    }

}