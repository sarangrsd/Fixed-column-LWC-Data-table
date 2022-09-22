/*	
    Created by: Sarang D	
    Description : This component is used to show all inventory information related to Local Expert product.	
*/
import { LightningElement, wire, api, track } from 'lwc';
import getLocalExpertInventoryData from '@salesforce/apex/LM_LocalExpertController.getLocalExpertInventoryData';
import { loadStyle } from 'lightning/platformResourceLoader';
import COLORS from '@salesforce/resourceUrl/datatableColors';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import {
    subscribe,
    unsubscribe,
    MessageContext, publish
} from 'lightning/messageService';
import QUICK_QUOTE_LMC from '@salesforce/messageChannel/AccountDashboardMessageChannel__c';
const OUTER_MODAL_CLASS = 'outerModalContent';
const MODAL_CONTENT = 'modalBody';

export default class LM_LocalExpertComponent extends LightningElement {
    @api recordId;
    // Global variables used	
    data;
    originalData;
    isCssLoaded;
    searchLabel = ' ';// for initializing search input field label	
    showSpinner = true;
    expandLabel = ' ';// for initializing expand LE cities checkbox field label	
    collapseLabel = ' ';
    @track buttonExpand = true;
    @track buttonVariant = 'Brand';
    buttonExpandModal =true;
    dataCheck;
    displayInModal;
    dataForModal;
    leCityProductsMap = new Map();
    leZipProductsMap = new Map();
    leCityProductsMapModal = new Map();
    leZipProductsMapModal = new Map();
    attributesToCPQ = new Object();
    adjacentZipForQuickQuote;
    quickQuoteUrl;
    interestedMarket_QuickQuote;
    interestedCities_quickQuote;
    subscription = null;
    isUrlSent = false;
    showFullDetailLabel;
    modalHeader;
    buttonLabelForModal;
    buttonVariantForModal;
    searchValue;
    searchValueForModal;
    originalDataPrevious;
    errorMessage;
    isFocusedModal = false;
    displayQQModal = false;
    modalblur;
    quickQuoteButtonLabel;
    MRData = '';
    LEData = '';
    CNData = '';
    skipAccount360;
    skipAccount360msg;

    // Column data for the datatable	
    columnData = [
        { label: '', fieldName: 'marketcity', type: 'lM_ActionButton', fixedWidth: 37, typeAttributes: { isButtonVisible: { fieldName: 'isButtonVisible' }, iconName: { fieldName: 'iconName' } }, key: 0, hideDefaultActions: true, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Market', fieldName: 'displayMarketInfo', type: 'lM_EntryType', wrapText: true, key: 1, initialWidth: 150, hideDefaultActions: true, typeAttributes: { entryType: { fieldName: 'displayMarketInfo' } }, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Buy Side Transaction', fieldName: 'finalBST', type: 'String', key: 2, initialWidth: 110, hideDefaultActions: true, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Listings', fieldName: 'finalListings', type: 'String', key: 3, initialWidth: 80, hideDefaultActions: true, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Median Market Price', fieldName: 'medianMarketPrice', type: 'String', key: 4, hideDefaultActions: true, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Entry Types', fieldName: 'uniqueMarket', type: 'lM_EntryType', key: 5, initialWidth: 150, hideDefaultActions: true, typeAttributes: { entryType: { fieldName: 'finalEntryType' } }, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'SOV10 Availability', fieldName: 'sov10Quantity', type: 'String', key: 6, initialWidth: 100, hideDefaultActions: true, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'SOV10 Price', fieldName: 'sov10Price', type: 'String', key: 7, initialWidth: 100, hideDefaultActions: true, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Selected Quantity', fieldName: 'idForQuantity', type: 'lM_InputNumber', key: 8, initialWidth: 80, hideDefaultActions: true, typeAttributes: { quantity: { fieldName: 'sov10Quantity' }, selectedQuantity: { fieldName: 'selectedQuantity' }, uniqueMarket: { fieldName: 'uniqueMarket' }, quantityExceededMsg: { fieldName: 'quantityExceededMsg' }, invalidQuantityMsg: { fieldName: 'invalidQuantityMsg' }, isInputFieldVisible: { fieldName: 'isInputFieldVisible' }, idType: { fieldName: 'idForQuantity' } }, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Total Opportunity', fieldName: 'totalOppty', type: 'lM_EntryType', key: 9, hideDefaultActions: true, typeAttributes: { entryType: { fieldName: 'totalOppty' } }, cellAttributes: { class: { fieldName: 'rowColor' } } }
    ]

    //For adding onclick event to close modal window on click
    constructor() {
        super();

        this.template.addEventListener("click", (event) => {
            if (event.target) {
                const classList = [...event.target.classList];
                if (classList.includes(OUTER_MODAL_CLASS)) {
                    this.displayInModal = false;
                    this.displayQQModal = false;
                    this.originalData = (this.originalDataPrevious) ? this.originalDataPrevious : this.originalData;
                }
            }
        });
    }

    //To subscribe to the message channel
    connectedCallback() {
        document.documentElement.style.setProperty('--display', 'none');
        this.subscribeToMessageChannel();
        this.publishLEData('InitialLoad');
    }

    // Load CSS for Datatable row color functionality	
    renderedCallback() {
        if ((this.displayInModal) && !this.isFocusedModal) {
            this.template.querySelector(".modalSectionToFindFocus").focus();
            this.isFocusedModal = true;
        }
        if (this.isCssLoaded) return
        this.isCssLoaded = true
        loadStyle(this, COLORS).then(() => {
            console.log("Loaded Successfully")
        }).catch(error => {
            console.error("Error in loading the colors" + error)
        })
    }

    //To subscibe to message channel
    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                QUICK_QUOTE_LMC,
                (message) => {
                   if(message.accountId == this.recordId) this.getQQDataFromOtherProducts(message);
                }
            );
        }
    }

    //To unsubscribe to message channel
    unsubscribeToMessageChannel() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    getQQDataFromOtherProducts(message) {
        if (message.QQClickedFrom == 'LocalExpert') return;  // return if event received was from this same component.

        if (message.MRPayload) {
            //If its an inital load notification, send LE data to that component.
            if (message.MRPayload == 'InitialLoad' && this.attributesToCPQ) {
                this.publishLEData({
                    'zipcode_heatmap_selection_quickQuote': this.attributesToCPQ['zipcode_heatmap_selection_quickQuote'],
                    'selectedLECity_quickQuote': this.attributesToCPQ['selectedLECity_quickQuote'],
                    'selectedLEZips_quickQuote': this.attributesToCPQ['selectedLEZips_quickQuote'],
                });
            }
            else {  //If it was change in already loaded component, store it in attributeCPQ
                for (let [key, value] of Object.entries(message.MRPayload)) {
                    this.attributesToCPQ[key] = value;
                }
            }
        }
        
        if (message.CONPayload) {
            console.log('in le '+message.CONPayload);
            //If its an inital load notification, send LE data to that component.
            if (message.CONPayload == 'InitialLoad') {
                console.log('initialLoad')
                this.publishLEData({
                    'zipcode_heatmap_selection_quickQuote': this.attributesToCPQ['zipcode_heatmap_selection_quickQuote'],
                    'selectedLECity_quickQuote': this.attributesToCPQ['selectedLECity_quickQuote'],
                    'selectedLEZips_quickQuote': this.attributesToCPQ['selectedLEZips_quickQuote'],
                });
            }
            else { //If it was change in already loaded component, store it in attributeCPQ
                console.log('connections');
                for (let [key, value] of Object.entries(message.CONPayload)) {
                    this.attributesToCPQ[key] = value;
                }
                console.log(this.attributesToCPQ);
            }
        }
    }


    //To fetch message context from message service
    @wire(MessageContext)
    messageContext;

    // For fetching the data for datatable and metadata for input fields from the controller	
    @wire(getLocalExpertInventoryData, { accId: '$recordId' })
    getData({ error, data }) {
        if (data) {
            this.showSpinner = false;
            this.skipAccount360 = data.skipAcc360;
            this.skipAccount360msg = data.metaDataFields.Skip_Account_360_message__c;
            this.iconname = "utility:info";
            if(!this.skipAccount360){
            this.dataLoaded = true;
            this.dataCheck = data.leCityIntM && data.leCityIntM.length === 0 ? false : true;
            this.data = data.leCityIntM;
            this.searchLabel = data.metaDataFields.LE_Label1__c;
            this.buttonLabel = data.metaDataFields.LE_Label2__c;;
            this.expandLabel = data.metaDataFields.LE_Label2__c;
            this.collapseLabel = data.metaDataFields.LE_Label3__c;
            this.showFullDetailLabel = data.metaDataFields.LE_Label4__c;
            this.quickQuoteButtonLabel = data.metaDataFields.Quick_Quote_Button_label__c;
            this.modalHeader = data.metaDataFields.LE_ModalHeader__c;
            let tempData = JSON.parse(JSON.stringify(this.data));
            this.data = tempData;
            this.originalData = tempData;
            this.dataForModal = data.leCityIntM;
            this.errorMessage = data.metaDataFields.NoDataMsg__c;
            this.adjacentZipForQuickQuote = data.adjacentZipForQuickQuote;
            this.quickQuoteUrl = data.quickQuoteUrl;
            this.interestedMarket_QuickQuote = data.interestedMarket_QuickQuote;
            this.interestedCities_quickQuote = data.interestedCities_quickQuote;
            this.zipcode_heatmap_selection_quickQuote = data.zipcode_heatmap_selection_quickQuote;
            console.log('Data from getlocalec=' + JSON.stringify(data));
            document.documentElement.style.setProperty('--height', data.metaDataFields.LE_DatatableHeight__c);
            }
        } else if (error) {
            console.log(JSON.stringify(error));
            const event = new ShowToastEvent({
                title: 'Error',
                message: error.body.message,
                variant: 'error',
                mode: 'sticky'
            });
            this.dispatchEvent(event);
            this.showSpinner = false;
        }
    }

    // For handling event from datatable custom action button 	
    handleButtonClick(event) {
        let tempData = (this.displayInModal) ? JSON.parse(JSON.stringify(this.dataForModal)) : JSON.parse(JSON.stringify(this.data));
        if (event.detail.type == 'add') {
            let newTemp = this.handleRowAdd(tempData, event.detail.id);
            if (this.displayInModal) {
                this.dataForModal = newTemp;
            }
            else {
                this.data = newTemp;
            }
            if (this.searchValueForModal || this.searchValue) {
                let tempDataOriginal = JSON.parse(JSON.stringify(this.originalData));
                this.originalData = this.handleRowAdd(tempDataOriginal, event.detail.id);
            }
            else {
                this.originalData = newTemp;
            }

        }
        else {
            let returnedArray = this.handleRowRemove(tempData, event.detail.id);
            if (this.displayInModal) {
                this.dataForModal = returnedArray;
            }
            else {
                this.data = returnedArray;
            }
            if (this.searchValueForModal || this.searchValue) {
                let tempDataOriginal = JSON.parse(JSON.stringify(this.originalData));
                this.originalData = this.handleRowRemove(tempDataOriginal, event.detail.id);
            }
            else {
                this.originalData = returnedArray;
            }

        }
    }

    //To handle row addition 
    handleRowAdd(tempData, id) {
        let count = 0;// For calculating the index
        let newTemp = new Array();
        tempData.forEach(element => {
            count++;
            if (element.marketcity == id) {
                newTemp = tempData.slice(0, count);
                if(element.localExpertZip){
                    newTemp.push.apply(newTemp, element.localExpertZip);
                }
                newTemp.push.apply(newTemp, tempData.slice(count));
                element.iconName = 'utility:dash';
            }
        });
        return newTemp;
    }

    //To handle row removal
    handleRowRemove(tempData, id) {
        let index = tempData.findIndex(data => {
            return data.uniqueMarket.toLowerCase() == id.toLowerCase() + 'zip';
        });
        if(index>=0){
            let childLength = tempData[index - 1].localExpertZip.length;
            tempData.splice(index, childLength);
            tempData[index - 1].iconName = 'utility:add';
        }
        else{
            let indexForNoZip = tempData.findIndex(data => {
                return data.marketcity.toLowerCase() == id.toLowerCase();
            });
            tempData[indexForNoZip].iconName = 'utility:add';
        }
        
        let returnArray = tempData;
        return returnArray;
    }

    // For handling event from datatable custom number input field 	
    handleQuantityUpdate(event) {

        let tempData = (this.displayInModal) ? JSON.parse(JSON.stringify(this.dataForModal)) : JSON.parse(JSON.stringify(this.data));
        let tempDataForOriginal = JSON.parse(JSON.stringify(this.originalData));
        let selectedQuantity = event.detail.value;
        let id = event.detail.id;
        let indexForOriginalCurrent = tempDataForOriginal.findIndex(data => {
            return id == data.idForQuantity;
        });
        let tempIndex = tempData.findIndex(data => {
            return id == data.idForQuantity;
        });
        tempData[tempIndex].selectedQuantity = selectedQuantity;
        tempDataForOriginal[indexForOriginalCurrent].selectedQuantity = selectedQuantity;
        if (this.displayInModal) {
            this.dataForModal = tempData;
        }
        else {
            this.data = tempData;
        }
        if (event.detail.uniqueMarket.includes('Zip')) {
            let zip = id.substring(id.lastIndexOf(' ') + 1);
            //this.leZipProductsMap.set(zip, selectedQuantity);
            let index = tempData.findIndex(data => {
                return id.toLowerCase().includes(data.marketcity.toLowerCase());
            });
            if (this.displayInModal) {
                this.dataForModal = this.quantityUpdater(tempData, index, id, selectedQuantity);
                this.leZipProductsMapModal.set(zip, selectedQuantity);
            }
            else {
                this.leZipProductsMap.set(zip, selectedQuantity);
                this.data = this.quantityUpdater(tempData, index, id, selectedQuantity);
            }
            if (this.searchValueForModal || this.searchValue) {
                let indexForOrignal = tempDataForOriginal.findIndex(data => {
                    return id.toLowerCase().includes(data.marketcity.toLowerCase());
                });
                this.originalData = this.quantityUpdater(tempDataForOriginal, indexForOrignal, id, selectedQuantity);
            }
            else {
                this.originalData = (this.displayInModal) ? this.dataForModal : this.data;
            }
        }
        else {
            //this.leCityProductsMap.set(id, selectedQuantity);
            let index = tempData.findIndex(data => {
                return id == data.idForQuantity;
            });
            tempData[index].selectedQuantity = selectedQuantity;
            if (this.displayInModal) {
                this.leCityProductsMapModal.set(id, selectedQuantity);
                this.dataForModal = tempData
            }
            else {
                this.leCityProductsMap.set(id, selectedQuantity);
                this.data = tempData;
            }
            if (this.searchValueForModal || this.searchValue) {
                let indexForOriginal = tempDataForOriginal.findIndex(data => {
                    return id == data.idForQuantity;
                });
                tempDataForOriginal[indexForOriginal].selectedQuantity = selectedQuantity;
                this.originalData = tempDataForOriginal;
            }
            else {
                this.originalData = (this.displayInModal) ? this.dataForModal : tempData;
            }

        }
        if (!this.displayInModal) this.handleQuickQuoteData();
    }

    // Iterator function for quanitity update	
    quantityUpdater(tempData, index, id, selectedQuantity) {
        let localZip = tempData[index].localExpertZip;
        if (localZip) {
            localZip.forEach(element => {
                if (element.idForQuantity == id) {
                    element.selectedQuantity = selectedQuantity;
                }
            });
            tempData[index].localExpertZip = localZip;
        }

        return tempData;
    }

    // For handling event from Show All LE Cities checkbox   	
    handleExpand(event) {

        let newTemp = [];
        let tempData = (this.displayInModal) ? JSON.parse(JSON.stringify(this.dataForModal)) :JSON.parse(JSON.stringify(this.data));
            newTemp = this.handleRowExpandAll(tempData);
            if (this.displayInModal) {
                if(this.buttonExpandModal){
                    this.buttonLabelForModal = this.collapseLabel;
                    this.buttonVariantForModal = 'Neutral';
                    this.dataForModal = newTemp;
                    this.isCollapsedModal = false;

                    let tempDataForOriginal = JSON.parse(JSON.stringify(this.originalData));
                    this.originalData = this.handleRowExpandAll(tempDataForOriginal);
                    if (this.searchValueForModal || this.searchValue) {
                        this.handleSearch();
                    }
                    this.buttonExpandModal = false;
                }
                else{
                    this.buttonLabelForModal = this.expandLabel;
                    this.buttonVariantForModal = 'Brand';
                    this.dataForModal = this.handleRowCollapseAll(tempData);
                    this.isCollapsedModal = true;

                    let tempDataForOriginal = JSON.parse(JSON.stringify(this.originalData));
                    this.originalData = this.handleRowCollapseAll(tempDataForOriginal);
                    if (this.searchValueForModal || this.searchValue) {
                        this.handleSearch();
                    }

                    this.buttonExpandModal = true;
                }
                
            }
            else {
                if(this.buttonExpand){
                    this.buttonLabelForModal = this.collapseLabel;
                    this.buttonVariantForModal = 'Neutral';
                    this.buttonLabel = this.collapseLabel;
                    this.buttonVariant = 'Neutral';
                    this.data = newTemp;
                    this.isCollapsed = false;

                    let tempDataForOriginal = JSON.parse(JSON.stringify(this.originalData));
                    this.originalData = this.handleRowExpandAll(tempDataForOriginal);
                    if (this.searchValueForModal || this.searchValue) {
                        this.handleSearch();
                    }
                    this.buttonExpandModal = false;
                    this.buttonExpand = false;
                }
                else{
                    this.buttonLabelModal = this.expandLabel;
                    this.buttonVariantForModal = 'Brand';
                    this.buttonLabel = this.expandLabel;
                    this.buttonVariant = 'Brand';
                    this.data = this.handleRowCollapseAll(tempData);
                    this.isCollapsed = true;

                    let tempDataForOriginal = JSON.parse(JSON.stringify(this.originalData));
                    this.originalData = this.handleRowCollapseAll(tempDataForOriginal);
                    if (this.searchValueForModal || this.searchValue) {
                        this.handleSearch();
                    }
                    this.buttonExpandModal = true;
                    this.buttonExpand = true;
                }
            }

      
    }

    //To handle expand all rows iteration
    handleRowExpandAll(tempData) {
        let newTemp = tempData.filter(data => {
            return !data.uniqueMarket.includes('Zip');
        });
        newTemp.forEach(element => {
            element.iconName = 'utility:add';
        });
        let returnArray = [];
        newTemp.forEach(element => {
            element.iconName = 'utility:dash';
            returnArray.push(element);
            returnArray.push.apply(returnArray, element.localExpertZip);
        });
        return returnArray;
    }

    //To handle all row collapse iteration
    handleRowCollapseAll(tempData) {
        let newTemp = tempData.filter(data => {
            return !data.uniqueMarket.includes('Zip');
        });
        newTemp.forEach(element => {
            element.iconName = 'utility:add';
        });
        return newTemp;
    }

    // For handling search funcitionality in datatable	
    handleSearch(event) {
        let searchValue;
        if (event) {
            searchValue = event.target.value;
        }
        else {
            searchValue = (this.displayInModal) ? this.searchValueForModal : this.searchValue;
        }
        let tempData = (this.dataForModal) ? this.dataForModal : this.data;
        tempData = searchValue ? this.filterTableData(searchValue) : this.originalData;
        if (this.displayInModal) {
            this.dataForModal = tempData;
            this.searchValueForModal = searchValue;
        }
        else {
            this.data = tempData;
            this.searchValue = searchValue;
        }
    }

    // Generic function to filter out data based on keyword from search input field	
    filterTableData(searchVal) {
        let dataArray = this.originalData;
        let tableColumn = this.columnData;
        let arrayAfterSearch = dataArray.filter(el => {
            for (let i = 0; i < tableColumn.length; i++) {
                let fieldName = tableColumn[i].fieldName;
                if (fieldName == 'uniqueMarket') {
                    let fieldValue = String(el[tableColumn[i].typeAttributes['entryType'].fieldName]);
                    if (fieldValue.toLowerCase().indexOf(searchVal.toLowerCase()) != -1) {
                        return true;
                        break;
                    }
                }
                else if (fieldName == 'idForQuantity') {
                    let fieldValue = String(el[tableColumn[i].typeAttributes['selectedQuantity'].fieldName]);
                    if (fieldValue.toLowerCase().indexOf(searchVal.toLowerCase()) != -1) {
                        return true;
                        break;
                    }
                }
                else {
                    let fieldValue = String(el[fieldName]);
                    if (fieldValue.toLowerCase().indexOf(searchVal.toLowerCase()) != -1) {
                        return true;
                        break;
                    }
                }
            }
        })
        return arrayAfterSearch;
    }

    //To open the modal 
    handleShowAll() {
        /*
        Setting all selected quantities from selections on page in modal.
        */
        this.leCityProductsMap.forEach((value, key) => {
            this.leCityProductsMapModal.set(key, value);
        });
        this.leZipProductsMap.forEach((value, key) => {
            this.leZipProductsMapModal.set(key, value);
        });
        this.displayInModal = true;
        this.dataForModal = this.data;
        this.isCollapsedModal = this.isCollapsed;
        this.buttonLabelForModal = this.buttonLabel;
        this.buttonVariantForModal = this.buttonVariant;
        this.searchValueForModal = this.searchValue;
        this.originalDataPrevious = this.originalData;
    }

    //To close modal when cancel button or close icon is clicked
    handleModalClose() {
        this.displayQQModal = false;
        this.displayInModal = false;
        this.searchValueForModal = '';
        this.buttonExpandModal = this.buttonExpand;
        this.originalData = (this.originalDataPrevious) ? this.originalDataPrevious : this.originalData;
        this.isFocusedModal = false;
    }

    //To close modal on press of Escape key
    handleKeyDown(event) {
        console.log(event.code);
        if (event.code == 'Escape') {
            this.handleModalClose();
            this.handleQQModalClose();
            event.preventDefault();
            event.stopImmediatePropagation();
            if (this.modalblur == true) {
                console.log('modalblur true');
                this.displayQQModal = false;
            }
        }
    }

    //To handle save from modal
    handleModalSave() {
        this.data = this.dataForModal;
        this.displayInModal = false;
        this.buttonLabel = this.buttonLabelForModal;
        this.buttonVariant = this.buttonVariantForModal;
        this.searchValue = this.searchValueForModal;
        this.isFocusedModal = false;
        this.buttonExpand = this.buttonExpandModal;
        this.leCityProductsMapModal.forEach((value, key) => {
            this.leCityProductsMap.set(key, value);
        });
        this.leZipProductsMapModal.forEach((value, key) => {
            this.leZipProductsMap.set(key, value);
        });
        this.handleQuickQuoteData();
    }

    //To handle quick quote data creation 
    handleQuickQuoteData() {
        let selectedLEzipcodes = '';
        let selectedLECities = '';
        if (this.leCityProductsMap.size > 0) {
            for (let [k, v] of this.leCityProductsMap) {
                if (v !== '') {
                    let cityQty = k + '-' + v;
                    if (selectedLECities.length == 0)
                        selectedLECities = cityQty;
                    else
                        selectedLECities = selectedLECities + '$$' + cityQty;
                }
            }
        }
        if (this.leZipProductsMap.size > 0) {
            for (let [k, v] of this.leZipProductsMap) {
                if (v !== '') {
                    let zipQty = k + '-' + v;
                    if (selectedLEzipcodes.length == 0)
                        selectedLEzipcodes = zipQty;
                    else
                        selectedLEzipcodes = selectedLEzipcodes + '$$' + zipQty;
                }
            }
        }
        if (selectedLECities && !selectedLECities.length == 0) {
            this.attributesToCPQ['selectedLECity_quickQuote'] = selectedLECities;
        }
        if (selectedLEzipcodes && !selectedLEzipcodes.length == 0) {
            this.attributesToCPQ['selectedLEZips_quickQuote'] = selectedLEzipcodes;
        }
        if (this.adjacentZipForQuickQuote && !this.adjacentZipForQuickQuote.length == 0) {
            this.attributesToCPQ['adjacentLEZips_quickQuote'] = this.adjacentZipForQuickQuote;
        }
        if (this.zipcode_heatmap_selection_quickQuote) {
            this.attributesToCPQ['zipcode_heatmap_selection_quickQuote'] = this.zipcode_heatmap_selection_quickQuote;
        }
        this.attributesToCPQ['interestedAEMarkets_quickQuote'] = this.interestedMarket_QuickQuote;
        this.attributesToCPQ['interestedCities_quickQuote'] = this.interestedCities_quickQuote;

        console.log(this.attributesToCPQ);
        this.publishLEData({
            'zipcode_heatmap_selection_quickQuote': this.attributesToCPQ['zipcode_heatmap_selection_quickQuote'],
            'selectedLECity_quickQuote': this.attributesToCPQ['selectedLECity_quickQuote'],
            'selectedLEZips_quickQuote': this.attributesToCPQ['selectedLEZips_quickQuote'],
        });//Publish this to all other products.

    }

    publishLEData(lePayload){
        publish(this.messageContext, QUICK_QUOTE_LMC, {
            LEPayload: lePayload,
            QQClickedFrom: 'LocalExpert',
            accountId: this.recordId
        });
    }

    //Open QQ in modal
    openQuickQuote() {
        console.log(this.attributesToCPQ);
        document.documentElement.style.setProperty('--display', 'block');
        this.template.querySelector("c-l-m_-quick-quote-component").payloadUpdater(this.attributesToCPQ);
        this.template.querySelector(".modalSectionToFindFocusQQ").focus();
    }

    handleQQModalClose() {
        document.documentElement.style.setProperty('--display', 'none');
        this.displayQQModal = false;
        this.template.querySelector("c-l-m_-quick-quote-component").removeEventListner();
    }
}