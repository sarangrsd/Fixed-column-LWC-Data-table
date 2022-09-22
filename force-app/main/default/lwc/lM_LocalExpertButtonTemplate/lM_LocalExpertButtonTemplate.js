import { LightningElement,api } from 'lwc';

export default class LM_LocalExpertButtonTemplate extends LightningElement {

    @api uniqMarketCity;
    @api isButtonVisible;
    @api iconName;

// Dispatch event to parent component on the button click
    handleButtonClick(){

        let type = (this.iconName=='utility:add')?'add':'remove';
        // if(this.id.includes('-')){
        //     let tempId = this.id.replace(/\d+/g,'');
        //     this.id = tempId.replaceAll('-','');
        // }
        console.log(this.uniqMarketCity);
        const event = CustomEvent('buttonclick',{
            composed:true,
            bubbles:true,
            detail : {id:this.uniqMarketCity,type:type}
        });
        this.dispatchEvent(event);

}
}