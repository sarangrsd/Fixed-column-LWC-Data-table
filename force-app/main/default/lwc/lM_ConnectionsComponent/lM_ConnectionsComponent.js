/*	
    Created by: Jai Khandelwal	
    Description : This component is used to show all inventory information related to Connections plus product.	
*/
import { LightningElement, wire, api, track } from 'lwc';
import getConnectionsInventoryData from '@salesforce/apex/LM_ConnectionsController.getConnectionsInventoryData';
import { loadStyle } from 'lightning/platformResourceLoader';
import COLORS from '@salesforce/resourceUrl/datatableColors';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import {
    subscribe,
    unsubscribe,
    MessageContext, publish
} from 'lightning/messageService';
import QUICK_QUOTE_LMC from '@salesforce/messageChannel/AccountDashboardMessageChannel__c';
import accountSummary from '@salesforce/messageChannel/AccountSummaryMessageChannel__c';
import MARKET_LMC from '@salesforce/messageChannel/MarketResponseMessageChannel__c';

const OUTER_MODAL_CLASS = 'outerModalContent';

export default class LM_ConnectionsComponent extends LightningElement {

    @api recordId;

    //Global variables used in component
    data;
    showSpinner = true;
    errorMessage;
    dataCheck;
    isCssLoaded;
    noOfRowsValue;
    currentPage;
    firstRecordIndex;
    totalPage;
    totalRecord;
    firstRecordIndex;
    lastRecordIndex;
    isFirstRecord;
    isLastRecord;
    originalData;
    protectedMarket;
    protectedMarketList;
    showCBCVariant = 'brand';
    showCBCLabel = 'Show All Markets';
    showCBCVariantForModal = 'brand';
    showCBCLabelForModal = 'Show All Markets';
    searchLabel;
    modalHeader;
    collapseLabel;
    showFullDetailLabel;
    protectedMarketLabel;
    conversionRateLabel;
    commissionRateLabel;
    agentSplitLabel;
    sixMonthPricingLabel;
    twelveMonthPricingLabel;
    buttonLabel;
    sortDirection = 'desc';
    sortBy = 'flexAvailability';
    sortByModal;
    sortDirectionModal = 'desc';
    searchValue;
    searchValueForModal;
    dataBeforeSearch;
    dataBeforeSearchForModal;
    originalDataForModal;
    dataForModal;
    displayInModal = false;
    isSelected = false;
    isSelectedModal = false;
    commissionRate = 2.5;
    agentSplit = 70;
    sixMonthPricing = false;
    twelveMonthPricing = false;
    pricing = 12;
    conversionRate = 4;
    columnDataPrev = [];
    selectedListFlex = [];
    selectedListFast = [];
    selectedListFlexModal = [];
    selectedListFastModal = [];
    totalMCV = 0;
    totalTCV = 0;
    totalLeads = 0;
    totalROI = 0;
    totalCommission = 0;
    totalProfit = 0;
    noOfRowsValueArray = [];
    isFocusedModal = false;
    productType = 'connections';
    displayQQModal;
    attributesToCPQ = new Object();;
    adjacentZipForQuickQuote;
    quickQuoteUrl;
    interestedAEMarkets_quickQuote;
    interestedMarket_QuickQuote;
    interestedCities_quickQuote;
    quickQuoteButtonLabel;
    flexProductsMap = new Map();
    fastProductsMap = new Map();
    flexProductsMapModal = new Map();
    fastProductsMapModal = new Map();
    modalTableHeight;
    totalflexprice = 0;
    totalfastprice = 0;
    iconNameNoData;
    showSpinnerModal = true;
    timeOut;
    skipAccount360;
    skipAccount360msg;
    subscription;
    subscription2;
    subscription3;
    eligibilityResponse;
    accountSummerydata;

    priceLabelArray = ['Median Market Price', 'Flex Price', 'Fast Price', 'Buy Side Transaction', 'Listings', 'Flex MCV', 'Flex TCV', 'Fast TCV', 'Fast MCV', 'Commission Per Sale', 'Commission Per Sale After Split'];


    dataForROI = [{
        totalMCV: '-',
        totalTCV: '-',
        totalEstLeads: '-',
        totalEstCommission: '-',
        totalEstProfit: '-',
        totalEstROI: '-',
        isVisibleMCV: false,
        isVisibleTCV: false,
        isVisibleLeads: false,
        isVisibleCommission: false,
        isVisibleProfit: false,
        isVisibleROI: false,
        optionMCV: '',
        optionTCV: '',
        optionLeads: '',
        optionCommission: '',
        optionProfit: '',
        optionROI: '',
    }];


    // Column data for the datatable	
    columnData = [
        { label: 'Market', fieldName: 'market', type: 'lM_EntryType', wrapText: true, sortable: true, key: 1, initialWidth: 80, hideDefaultActions: true, typeAttributes: { entryType: { fieldName: 'market' } }, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Slot Size', fieldName: 'slotSize', type: 'String', sortable: true, key: 2, initialWidth: 100, hideDefaultActions: true, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Flex Availability', fieldName: 'flexAvailability', type: 'lM_InputNumber', sortable: true, key: 3, initialWidth: 110, hideDefaultActions: true, typeAttributes: { quantity: { fieldName: 'flexAvailability' }, isConnections: { fieldName: 'isConnections' }, selectedQuantity: { fieldName: 'selectedQuantityFlex' }, quantityExceededMsg: { fieldName: 'validationMsg' }, invalidQuantityMsg: { fieldName: 'validationMsg2' }, uniqueMarket: { fieldName: 'uniqueId' }, type: 'flex', isInputFieldVisible: { fieldName: 'isFlexAvail' }, idType: { fieldName: 'uniqueId' }, styleClass: { fieldName: 'connectionsCSSFlex' } }, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Flex Price', fieldName: 'flexPrice', type: 'String', sortable: true, key: 4, initialWidth: 80, hideDefaultActions: true, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Fast Availability', fieldName: 'fastAvailability', type: 'lM_InputNumber', sortable: true, key: 5, initialWidth: 110, hideDefaultActions: true, typeAttributes: { quantity: { fieldName: 'fastAvailability' }, isConnections: { fieldName: 'isConnections' }, selectedQuantity: { fieldName: 'selectedQuantityFast' }, quantityExceededMsg: { fieldName: 'validationMsg' }, invalidQuantityMsg: { fieldName: 'validationMsg2' }, uniqueMarket: { fieldName: 'uniqueId' }, type: 'fast', isInputFieldVisible: { fieldName: 'isFastAvail' }, idType: { fieldName: 'uniqueId' }, styleClass: { fieldName: 'connectionsCSSFast' } }, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Fast Price', fieldName: 'fastPrice', type: 'String', sortable: true, key: 6, initialWidth: 80, hideDefaultActions: true, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Total Opportunity Flex', fieldName: 'intflexTotal', type: 'lM_EntryType', sortable: true, key: 7, initialWidth: 150, hideDefaultActions: true, typeAttributes: { entryType: { fieldName: 'totalFlexOpt' } }, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Total Opportunity Fast', fieldName: 'intfastTotal', type: 'lM_EntryType', sortable: true, key: 8, initialWidth: 150, hideDefaultActions: true, typeAttributes: { entryType: { fieldName: 'totalFastOpt' } }, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Entry Type', fieldName: 'entryTypeFull', type: 'lM_EntryType', wrapText: true, sortable: true, key: 9, initialWidth: 110, hideDefaultActions: true, typeAttributes: { entryType: { fieldName: 'entryTypeFull' } }, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Median Market Price', fieldName: 'medianMarketPriceToUse', type: 'lM_InputWithDefaultValue', initialWidth: 120, sortable: true, key: 4, hideDefaultActions: true, typeAttributes: { defaultValue: { fieldName: 'medianMarketPrice' }, changedValue: { fieldName: 'medianMarketPriceToUse' }, uniqueId: { fieldName: 'uniqueId' } }, cellAttributes: { class: { fieldName: 'rowColor' } } },
    ]

    // Column data for the datatable	
    columnDataModal = [
        { label: 'Buy Side Transactions', fieldName: 'BST', type: 'String', sortable: true, key: 2, initialWidth: 110, hideDefaultActions: true, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Listings', fieldName: 'listings', type: 'String', sortable: true, key: 3, initialWidth: 60, hideDefaultActions: true, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Entry Type', fieldName: 'entryType', type: 'lM_EntryType', wrapText: true, sortable: true, key: 5, initialWidth: 200, hideDefaultActions: true, typeAttributes: { entryType: { fieldName: 'entryType' }, minimumHeight: 'minimumHeight slds-align_absolute-center' }, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Market Level', fieldName: 'marketLevel', type: 'String', sortable: true, key: 6, initialWidth: 80, hideDefaultActions: true, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Slot Size', fieldName: 'slotSize', type: 'String', sortable: true, key: 7, initialWidth: 100, hideDefaultActions: true, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Flex Availability', fieldName: 'flexAvailability', type: 'lM_InputNumber', sortable: true, key: 8, initialWidth: 110, hideDefaultActions: true, typeAttributes: { quantity: { fieldName: 'flexAvailability' }, isConnections: { fieldName: 'isConnections' }, selectedQuantity: { fieldName: 'selectedQuantityFlex' }, quantityExceededMsg: { fieldName: 'validationMsg' }, invalidQuantityMsg: { fieldName: 'validationMsg2' }, uniqueMarket: { fieldName: 'uniqueId' }, type: 'flex', isInputFieldVisible: { fieldName: 'isFlexAvail' }, idType: { fieldName: 'uniqueId' }, styleClass: { fieldName: 'connectionsCSSFlex' } }, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Flex Price', fieldName: 'flexPrice', type: 'String', sortable: true, key: 9, initialWidth: 80, hideDefaultActions: true, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Fast Availability', fieldName: 'fastAvailability', type: 'lM_InputNumber', sortable: true, key: 10, initialWidth: 110, hideDefaultActions: true, typeAttributes: { quantity: { fieldName: 'fastAvailability' }, isConnections: { fieldName: 'isConnections' }, selectedQuantity: { fieldName: 'selectedQuantityFast' }, quantityExceededMsg: { fieldName: 'validationMsg' }, invalidQuantityMsg: { fieldName: 'validationMsg2' }, uniqueMarket: { fieldName: 'uniqueId' }, type: 'fast', isInputFieldVisible: { fieldName: 'isFastAvail' }, idType: { fieldName: 'uniqueId' }, styleClass: { fieldName: 'connectionsCSSFast' } }, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Fast Price', fieldName: 'fastPrice', type: 'String', sortable: true, key: 11, initialWidth: 80, hideDefaultActions: true, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Best Available Promo', fieldName: 'bestPromoAvailable', type: 'String', sortable: true, key: 14, initialWidth: 150, hideDefaultActions: true, cellAttributes: { class: { fieldName: 'rowColor' } } },
    ]

    marketColumnData = [
        { label: 'Market', fieldName: 'market', type: 'lM_EntryType', wrapText: true, sortable: true, key: 1, initialWidth: 80, hideDefaultActions: true, typeAttributes: { entryType: { fieldName: 'market' }, minimumHeight: 'minimumHeight slds-align_absolute-center' }, cellAttributes: { class: { fieldName: 'rowColorForMarket' } } },
        { label: 'Median Market Price', fieldName: 'medianMarketPriceToUse', type: 'lM_InputWithDefaultValue', initialWidth: 120, sortable: true, key: 4, hideDefaultActions: true, typeAttributes: { defaultValue: { fieldName: 'medianMarketPrice' }, changedValue: { fieldName: 'medianMarketPriceToUse' }, uniqueId: { fieldName: 'uniqueId' } }, cellAttributes: { class: { fieldName: 'rowColorForMarket' } } },
    ];

    marketData;


    // Column data for the datatable	
    columnDataModalExtension = [
        { label: 'Buy Side Transactions', fieldName: 'BST', type: 'String', sortable: true, key: 2, initialWidth: 110, hideDefaultActions: true, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Listings', fieldName: 'listings', type: 'String', sortable: true, key: 3, initialWidth: 60, hideDefaultActions: true, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Entry Type', fieldName: 'entryType', type: 'lM_EntryType', wrapText: true, sortable: true, key: 5, initialWidth: 200, hideDefaultActions: true, typeAttributes: { entryType: { fieldName: 'entryType' } }, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Market Level', fieldName: 'marketLevel', type: 'String', sortable: true, key: 6, initialWidth: 80, hideDefaultActions: true, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Slot Size', fieldName: 'slotSize', type: 'String', sortable: true, key: 7, initialWidth: 100, hideDefaultActions: true, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Flex Availability', fieldName: 'flexAvailability', type: 'lM_InputNumber', sortable: true, key: 8, initialWidth: 110, hideDefaultActions: true, typeAttributes: { quantity: { fieldName: 'flexAvailability' }, isConnections: { fieldName: 'isConnections' }, selectedQuantity: { fieldName: 'selectedQuantityFlex' }, quantityExceededMsg: { fieldName: 'validationMsg' }, invalidQuantityMsg: { fieldName: 'validationMsg2' }, uniqueMarket: { fieldName: 'uniqueId' }, type: 'flex', isInputFieldVisible: { fieldName: 'isFlexAvail' }, idType: { fieldName: 'uniqueId' }, styleClass: { fieldName: 'connectionsCSSFlex' } }, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Flex Price', fieldName: 'flexPrice', type: 'String', sortable: true, key: 9, initialWidth: 80, hideDefaultActions: true, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Fast Availability', fieldName: 'fastAvailability', type: 'lM_InputNumber', sortable: true, key: 10, initialWidth: 110, hideDefaultActions: true, typeAttributes: { quantity: { fieldName: 'fastAvailability' }, isConnections: { fieldName: 'isConnections' }, selectedQuantity: { fieldName: 'selectedQuantityFast' }, quantityExceededMsg: { fieldName: 'validationMsg' }, invalidQuantityMsg: { fieldName: 'validationMsg2' }, uniqueMarket: { fieldName: 'uniqueId' }, type: 'fast', isInputFieldVisible: { fieldName: 'isFastAvail' }, idType: { fieldName: 'uniqueId' }, styleClass: { fieldName: 'connectionsCSSFast' } }, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Fast Price', fieldName: 'fastPrice', type: 'String', sortable: true, key: 11, initialWidth: 80, hideDefaultActions: true, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Best Available Promo', fieldName: 'bestPromoAvailable', type: 'String', sortable: true, key: 14, initialWidth: 150, hideDefaultActions: true, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Est. Commission ', fieldName: 'estCommission', type: 'lM_EntryType', sortable: false, key: 14, initialWidth: 160, hideDefaultActions: true, typeAttributes: { entryType: { fieldName: 'estCommission' } }, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Est. Converted Leads', fieldName: 'noLeadsConverted', type: 'lM_EntryType', sortable: false, key: 14, initialWidth: 150, hideDefaultActions: true, typeAttributes: { entryType: { fieldName: 'noLeadsConverted' } }, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Flex MCV', fieldName: 'flexMCV', type: 'String', sortable: false, key: 14, initialWidth: 80, hideDefaultActions: true, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Flex TCV', fieldName: 'flexTCV', type: 'String', sortable: false, key: 14, initialWidth: 80, hideDefaultActions: true, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Flex ROI', fieldName: 'flexROI', type: 'lM_EntryType', sortable: false, key: 14, initialWidth: 155, hideDefaultActions: true, typeAttributes: { entryType: { fieldName: 'flexROI' }, isProfitLess: { fieldName: 'isProfitLess' }, helpTextMsg: { fieldName: 'helpTextMsg' }, minimumHeight: 'minimumHeight' }, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Fast MCV', fieldName: 'fastMCV', type: 'String', sortable: false, key: 14, initialWidth: 80, hideDefaultActions: true, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Fast TCV', fieldName: 'fastTCV', type: 'String', sortable: false, key: 14, initialWidth: 80, hideDefaultActions: true, cellAttributes: { class: { fieldName: 'rowColor' } } },
        { label: 'Fast ROI', fieldName: 'fastROI', type: 'lM_EntryType', sortable: false, key: 14, initialWidth: 155, hideDefaultActions: true, typeAttributes: { entryType: { fieldName: 'fastROI' }, minimumHeight: 'minimumHeight' }, cellAttributes: { class: { fieldName: 'rowColor' } } },

    ]

    // Column data for the datatable	
    columnDataForROI = [
        { label: 'Total MCV', fieldName: 'totalMCV', type: 'lM_HighlightIcon', key: 1, initialWidth: 140, hideDefaultActions: true, typeAttributes: { currentValue: { fieldName: 'totalMCV' }, isVisible: { fieldName: 'isVisibleMCV' }, optionForIcon: { fieldName: 'optionMCV' } } },
        { label: 'Total TCV', fieldName: 'totalTCV', type: 'lM_HighlightIcon', key: 2, initialWidth: 140, hideDefaultActions: true, typeAttributes: { currentValue: { fieldName: 'totalTCV' }, isVisible: { fieldName: 'isVisibleTCV' }, optionForIcon: { fieldName: 'optionTCV' } } },
        { label: 'Est. Converted Leads', fieldName: 'totalEstLeads', type: 'lM_HighlightIcon', key: 2, initialWidth: 140, hideDefaultActions: true, typeAttributes: { currentValue: { fieldName: 'totalEstLeads' }, isVisible: { fieldName: 'isVisibleLeads' }, optionForIcon: { fieldName: 'optionLeads' } } },
        { label: 'Est. Commission', fieldName: 'totalEstCommission', type: 'lM_HighlightIcon', key: 3, initialWidth: 140, hideDefaultActions: true, typeAttributes: { currentValue: { fieldName: 'totalEstCommission' }, isVisible: { fieldName: 'isVisibleCommission' }, optionForIcon: { fieldName: 'optionCommission' } } },
        { label: 'Est. Profit', fieldName: 'totalEstProfit', type: 'lM_HighlightIcon', key: 4, initialWidth: 140, hideDefaultActions: true, typeAttributes: { currentValue: { fieldName: 'totalEstProfit' }, isVisible: { fieldName: 'isVisibleProfit' }, optionForIcon: { fieldName: 'optionProfit' } } },
        { label: 'Est. Total ROI', fieldName: 'totalEstROI', type: 'lM_HighlightIcon', key: 5, initialWidth: 140, hideDefaultActions: true, typeAttributes: { currentValue: { fieldName: 'totalEstROI' }, isVisible: { fieldName: 'isVisibleROI' }, optionForIcon: { fieldName: 'optionROI' } } },
    ]

    //For adding onclick event to close modal window on click
    constructor() {
        super();
        this.template.addEventListener("click", (event) => {
            if (event.target) {
                const classList = [...event.target.classList];
                if (classList.includes(OUTER_MODAL_CLASS)) {
                    this.handleModalClose();
                    this.handleQQModalClose();
                }
            }
        });
    }

    //To subscribe to the message channel
    connectedCallback() {
        document.documentElement.style.setProperty('--display', 'none');
        this.subscribeToMessageChannel();
        this.subscribeToMarketInfoMessageChannel();
        this.subscribeAccountSummery();
        this.publishCONData('InitialLoad');
        this.handleDataFetch();
    }

    disconnectedCallback() {
        this.unsubscribeToMessageChannel();
    }

    // Load CSS for Datatable row color functionality	
    renderedCallback() {
        if (this.displayInModal && !this.isFocusedModal) {
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

    //To fetch all data from the controller
    handleDataFetch() {
        getConnectionsInventoryData({ accId: this.recordId })
            .then(data => {
                if (data) {
                    this.showSpinner = false;
                    this.skipAccount360 = data.skipAcc360;
                    this.skipAccount360msg = data.metaDataFields.Skip_Account_360_message__c;
                    this.iconNameNoData = "utility:info";
                    if (!this.skipAccount360) {
                        this.dataCheck = data.connectionsData && data.connectionsData.length === 0 ? false : true;
                        this.originalData = data.connectionsData.filter(e => {
                            return (!data.protectedMarkets.includes(e.zip) && (e.fastAvailability > 0 || e.flexAvailability > 0));
                        });
                        this.accountSummerydata = data;
                        this.handleAccountSummaryPublish(this.accountSummerydata.flexTotal,this.accountSummerydata.fastTotal,this.accountSummerydata.leCityTotal,this.accountSummerydata.leZipTotal,this.accountSummerydata.mrTotal);
                        this.data = this.originalData;
                        this.protectedMarketList = data.connectionsData.filter(e => {
                            return (data.protectedMarkets.includes(e.zip) || (e.fastAvailability < 1 && e.flexAvailability < 1));
                        });
                        this.originalDataForModal = this.originalData;
                        this.protectedMarkets = data.protectedMarkets;
                        this.eligibilityResponse = data.eligibilityResponse;
                        this.publishMarketInfoData();
                        this.totalRecord = this.data.length;
                        this.columnDataPrev = this.columnDataModal;
                        this.dataBeforeSearch = this.originalData;
                        this.dataBeforeSearchForModal = this.originalData;
                        this.searchLabel = data.metaDataFields.LE_Label1__c;
                        this.showCBCLabel = data.metaDataFields.LE_Label2__c;
                        this.buttonLabel = this.showCBCLabel;
                        this.collapseLabel = data.metaDataFields.LE_Label3__c;
                        this.showFullDetailLabel = data.metaDataFields.LE_Label4__c;
                        this.modalHeader = data.metaDataFields.LE_ModalHeader__c;
                        this.protectedMarketLabel = data.metaDataFields.Con_Label__c;
                        this.commissionRateLabel = data.metaDataFields.Con_Label1__c;
                        this.agentSplitLabel = data.metaDataFields.Con_Label2__c;
                        this.sixMonthPricingLabel = data.metaDataFields.Con_Label3__c;
                        this.twelveMonthPricingLabel = data.metaDataFields.Con_Label4__c;
                        this.conversionRateLabel = data.metaDataFields.Con_Label5__c;
                        this.errorMessage = data.metaDataFields.NoDataMsg__c;
                        this.quickQuoteButtonLabel = data.metaDataFields.Quick_Quote_Button_label__c;
                        this.commissionRate = data.metaDataFields2.Con_Comm_Rate_Value__c;
                        this.agentSplit = data.metaDataFields2.Con_Comm_Split_Value__c;
                        this.conversionRate = data.metaDataFields2.Con_Conv_Rate_Value__c;
                        if (data.metaDataFields2.Con_ROI_Pricing__c == '12 Month Pricing') {
                            this.twelveMonthPricing = true;
                            this.pricing = 12;
                        } else {
                            this.sixMonthPricing = true;
                            this.pricing = 6;
                        }
                        this.adjacentZipForQuickQuote = data.adjacentZipForQuickQuote;
                        this.quickQuoteUrl = data.quickQuoteUrl;
                        this.interestedMarket_QuickQuote = data.interestedMarket_QuickQuote;
                        this.interestedCities_quickQuote = data.interestedCities_quickQuote;
                        this.zipcode_heatmap_selection_quickQuote = data.zipcode_heatmap_selection_quickQuote;
                        let noOfRowsValueArray = data.metaDataFields.Con_Enteries__c.split(',');
                        this.noOfRowsValueArray = noOfRowsValueArray.map(obj => {
                            let newObj = {};
                            newObj.label = obj;
                            newObj.value = obj;
                            return newObj;
                        });

                        this.noOfRowsValue = (noOfRowsValueArray.includes('25')) ? '25' : this.noOfRowsValueArray[0].value;
                        this.handleSort();
                        this.handleQuickQuoteData();
                        document.documentElement.style.setProperty('--modalTableHeight', data.metaDataFields.Con_Modal_Table_Height__c);
                        document.documentElement.style.setProperty('--heightConnections', data.metaDataFields.LE_DatatableHeight__c);
                    }
                }
            })
            .catch(error => {
                if(error && error.body){
                    console.log(JSON.stringify(error));
                this.showToast('Error', error.body.message.substring(0,error.body.message.indexOf('***')), 'error', 'sticky');
                this.showSpinner = false;
                let response = JSON.parse(error.body.message.substring(error.body.message.indexOf('***')+3));
                console.log(response);
                this.handleAccountSummaryPublish(response.flex,response.fast,response.lecity,response.lezip,response.mr);
                this.dataCheck = false;
                this.errorMessage = 'No data available due to error';
                this.iconNameNoData = "utility:info";
                this.eligibilityResponse = response.eligibilityResponse;
                this.publishMarketInfoData();
                }
            })
    }


    //To fetch message context from message service
    @wire(MessageContext)
    messageContext;

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

    subscribeToMarketInfoMessageChannel(){
        console.log('Inside market Info LMS function');
        if(!this.subscription2){
            this.subscription2 = subscribe(
                this.messageContext,
                MARKET_LMC,
                (message) => this.getMarketInfoFromDashboard(message)
            );
        }
    }

    subscribeAccountSummery(){
        if(!this.subscription3){
            this.subscription3 = subscribe(
                this.messageContext,
                accountSummary,
                (message) =>{
                    if(message.accountId == this.recordId) this.getAccountSummeryMsg(message);
                } 
            );
        }
    }

    publishMarketInfoData(){
        publish(this.messageContext, MARKET_LMC, {
            Payload: this.eligibilityResponse,
            accId : this.recordId
        });
    }

    //To unsubscribe to message channel
    unsubscribeToMessageChannel() {
        unsubscribe(this.subscription);
        this.subscription = null;
        unsubscribe(this.subscription2);
        this.subscription2 = null;
        unsubscribe(this.subscription3);
        this.subscription3 = null;
    }

    getMarketInfoFromDashboard(message){
        console.log('Inside market Info LMS');
        if(message.Payload=='MarketReach'){
            this.publishMarketInfoData();
            console.log('published from Connections');
        }
    }

    getAccountSummeryMsg(message){
        if(message.Payload=='DashboardLoaded'){
            this.handleAccountSummaryPublish(this.accountSummerydata.flexTotal,this.accountSummerydata.fastTotal,this.accountSummerydata.leCityTotal,this.accountSummerydata.leZipTotal,this.accountSummerydata.mrTotal);
            console.log('published from Connections');
        }
    }

    getQQDataFromOtherProducts(message) {
        if (message.QQClickedFrom == 'Connections') return;  // return if event received was from this same component.

        if (message.MRPayload) {
            //If its an inital load notification, send LE data to that component.
            if (message.MRPayload == 'InitialLoad' && this.attributesToCPQ) {
                this.publishCONData(
                    {
                        'selectedCBCmarkets': this.attributesToCPQ['selectedCBCmarkets'],
                        'interestedAEMarkets_quickQuote': this.attributesToCPQ['interestedAEMarkets_quickQuote'],
                        'interestedCities_quickQuote': this.attributesToCPQ['interestedCities_quickQuote'],
                        'adjacentLEZips_quickQuote': this.attributesToCPQ['adjacentLEZips_quickQuote']
                    }
                );
            }
            else {  //If it was change in already loaded component, store it in attributeCPQ
                for (let [key, value] of Object.entries(message.MRPayload)) {
                    this.attributesToCPQ[key] = value;
                }
            }
        }

        if (message.LEPayload) {
            //If its an inital load notification, send LE data to that component.
            if (message.LEPayload == 'InitialLoad') {
                this.publishCONData(
                    {
                        'selectedCBCmarkets': this.attributesToCPQ['selectedCBCmarkets'],
                        'interestedAEMarkets_quickQuote': this.attributesToCPQ['interestedAEMarkets_quickQuote'],
                        'interestedCities_quickQuote': this.attributesToCPQ['interestedCities_quickQuote'],
                        'adjacentLEZips_quickQuote': this.attributesToCPQ['adjacentLEZips_quickQuote'],
                    });
            }
            else { //If it was change in already loaded component, store it in attributeCPQ
                for (let [key, value] of Object.entries(message.LEPayload)) {
                    this.attributesToCPQ[key] = value;
                }
            }
        }
    }

    //To show all markets in datatable 
    handleAllCBC(event) {
        let tempData = (this.displayInModal) ? JSON.parse(JSON.stringify(this.originalDataForModal)) : JSON.parse(JSON.stringify(this.originalData));
        let tempDataBeforeSearch = JSON.parse(JSON.stringify(this.dataBeforeSearch));
        if (event.target.label == this.showCBCLabel) {
            tempData.push.apply(tempData, this.protectedMarketList);
            tempDataBeforeSearch.push.apply(tempDataBeforeSearch, this.protectedMarketList);
            if (this.displayInModal) {
                this.showCBCLabelForModal = this.collapseLabel;
                this.showCBCVariantForModal = 'neutral';
            }
            else {
                this.buttonLabel = this.collapseLabel;
                this.showCBCVariant = 'neutral';
            }

        }
        else {
            tempData = tempData.filter(e => {
                return (!this.protectedMarkets.includes(e.zip) && e.flexAvailability > 0 || e.fastAvailability > 0);
            });
            tempDataBeforeSearch = tempDataBeforeSearch.filter(e => {
                return (!this.protectedMarkets.includes(e.zip) && e.flexAvailability > 0 || e.fastAvailability > 0);
            });
            if (this.displayInModal) {
                this.showCBCLabelForModal = this.showCBCLabel;
                this.showCBCVariantForModal = 'brand';
            }
            else {
                this.buttonLabel = this.showCBCLabel;
                this.showCBCVariant = 'brand';
            }

        }
        if (this.displayInModal) {
            this.originalDataForModal = tempData;
            this.totalRecord = this.originalDataForModal.length;
            this.dataBeforeSearch = tempDataBeforeSearch;
        }
        else {
            this.originalData = tempData;
            this.totalRecord = this.originalData.length;
            this.dataBeforeSearch = tempDataBeforeSearch;
        }
        if (this.searchValue || this.searchValueForModal) {
            this.handleSearch();
        }
        if (this.noOfRowsValue != 'All') {
            this.handleFirst();
        } else {
            this.handleRowNumChange();
        }

    }

    //To set commission rate
    setCommissionRate(event) {
        this.commissionRate = event.target.value;
        this.handleRatesUpdate();
    }

    //To set conversion rate
    setConversionRate(event) {
        this.conversionRate = event.target.value;
        this.handleRatesUpdate();
    }

    //To set agent split rate
    setAgentSplit(event) {
        this.agentSplit = event.target.value;
        this.handleRatesUpdate();
    }

    //To set pricing to 6 months
    set6MonthPricing(event) {
        this.pricing = (event.detail.checked) ? 6 : 12;
        this.sixMonthPricing = (event.detail.checked) ? true : false;
        this.twelveMonthPricing = (event.detail.checked) ? false : true;
        this.handleRatesUpdate();
    }

    //To set pricing to 12 months
    set12MonthPricing(event) {
        this.pricing = (event.detail.checked) ? 12 : 6;
        this.twelveMonthPricing = (event.detail.checked) ? true : false;
        this.sixMonthPricing = (event.detail.checked) ? false : true;
        this.handleRatesUpdate();
    }

    //To handle quantity change in datatable and related functionalities
    handleQuantityUpdate(event) {

        let tempData = (this.displayInModal) ? JSON.parse(JSON.stringify(this.originalDataForModal)) : JSON.parse(JSON.stringify(this.originalData));
        let tempdataBeforeSearch = JSON.parse(JSON.stringify(this.dataBeforeSearch));
        let id = event.detail.uniqueMarket;
        let index = tempData.findIndex(data => {
            return id == data.uniqueId;
        });
        let indexForSearch = tempdataBeforeSearch.findIndex(data => {
            return id == data.uniqueId;
        });
        let selectedQuantity = (event.detail.value == null) ? '' : event.detail.value;
        let type = event.detail.type;
        if (this.selectedListFlex.includes(id) && type == 'flex' || this.selectedListFast.includes(id) && type == 'fast' || this.selectedListFlexModal.includes(id) && type == 'flex' || this.selectedListFastModal.includes(id) && type == 'fast') {
            this.handleROISummarySub(tempData[index], type);
        }
        if (selectedQuantity != '') {
            if (type == 'flex') {
                if (this.displayInModal) {
                    console.log('inflex ' + this.displayInModal);
                    this.selectedListFlexModal.push(id);
                }
                else {
                    console.log(this.displayInModal);
                    this.selectedListFlex.push(id);
                }

            }
            else {
                if (this.displayInModal) {
                    this.selectedListFastModal.push(id);
                }
                else {
                    this.selectedListFast.push(id);
                }
            }
        }
        else {
            if (type == 'flex') {
                if (this.displayInModal) {
                    let tempFlex = [];
                    tempFlex = this.selectedListFlexModal.filter(e => e != id);
                    this.selectedListFlexModal = tempFlex;
                }
                else {
                    let tempFlex = [];
                    tempFlex = this.selectedListFlex.filter(e => e != id);
                    this.selectedListFlex = tempFlex;
                }

            }
            else {
                if (this.displayInModal) {
                    let tempFast = [];
                    tempFast = this.selectedListFastModal.filter(e => e != id);
                    this.selectedListFastModal = tempFast;
                }
                else {
                    let tempFast = [];
                    tempFast = this.selectedListFast.filter(e => e != id);
                    this.selectedListFast = tempFast;
                }

            }
        }

        if (selectedQuantity != '') {
            tempData = this.quantityUpdaterAdd(tempData, type, selectedQuantity, index);
            tempdataBeforeSearch = this.quantityUpdaterAdd(tempdataBeforeSearch, type, selectedQuantity, indexForSearch);
            this.setMapForQuickQuote(tempData[index].zip, tempData[index].slotSize, type, selectedQuantity);
            this.handleROISummaryAdd(tempData[index], type);
        }
        else if (selectedQuantity == '') {
            tempData = this.quantityUpdaterRemove(tempData, type, id, index);
            tempdataBeforeSearch = this.quantityUpdaterRemove(tempdataBeforeSearch, type, id, indexForSearch);
            this.unsetMapForQuickQuote(tempData[index].zip, tempData[index].slotSize, type);
        }

        if (this.displayInModal) {
            this.originalDataForModal = tempData;
            this.isSelectedModal = (this.selectedListFlexModal.length > 0 || this.selectedListFastModal.length > 0) ? true : false;
            this.columnDataModal = (this.isSelectedModal) ? this.columnDataModalExtension : this.columnDataPrev;
        }
        else {
            this.originalData = tempData;
            this.isSelected = (this.selectedListFlex.length > 0 || this.selectedListFast.length > 0) ? true : false;
            this.columnDataModal = (this.isSelected) ? this.columnDataModalExtension : this.columnDataPrev;
        }
        this.dataBeforeSearch = tempdataBeforeSearch;

        if (this.noOfRowsValue != 'All') {
            this.pagination();
        } else {
            this.handleRowNumChange();
        }
        if (!this.displayInModal) this.handleQuickQuoteData();
        if (this.searchValueForModal) this.handleSearch();

    }

    //To add values to ROI summary fields
    handleROISummaryAdd(element, type) {
        if (type == 'flex') {
            this.totalMCV += parseFloat(element.flexMCV.replaceAll(',', '').substring(1));
            this.totalTCV += parseFloat(element.flexTCV.replaceAll(',', '').substring(1));
            this.totalCommission += parseFloat(element.noLeadsConvertedFlex * element.commissionPerSaleAfterSplit.replaceAll(',', '').substring(1));
            this.totalProfit += parseFloat(element.noLeadsConvertedFlex * element.commissionPerSaleAfterSplit.replaceAll(',', '').substring(1)) - parseFloat(element.flexTCV.replaceAll(',', '').substring(1));
            this.totalROI += parseFloat(element.flexTCV.replaceAll(',', '').substring(1)) / (parseFloat(element.noLeadsConvertedFlex * element.commissionPerSaleAfterSplit.replaceAll(',', '').substring(1)) - parseFloat(element.flexTCV.replaceAll(',', '').substring(1)));
            // if (this.pricing == 12) {
            //     this.totalLeads += (element.slotSize == 'Half') ? element.selectedQuantityFlex * this.conversionRate * 20 / 100 : element.selectedQuantityFlex * this.conversionRate * 40 / 100;
            // }
            // else {
            //     this.totalLeads += (element.slotSize == 'Half') ? element.selectedQuantityFlex * this.conversionRate * 10 / 100 : element.selectedQuantityFlex * this.conversionRate * 20 / 100;
            // }
            this.totalLeads += element.noLeadsConvertedFlex;
        }
        else {
            this.totalMCV += parseFloat(element.fastMCV.replaceAll(',', '').substring(1));
            this.totalTCV += parseFloat(element.fastTCV.replaceAll(',', '').substring(1));
            this.totalCommission += parseFloat(element.noLeadsConvertedFast * element.commissionPerSaleAfterSplit.replaceAll(',', '').substring(1));
            this.totalProfit += parseFloat(element.noLeadsConvertedFast * element.commissionPerSaleAfterSplit.replaceAll(',', '').substring(1)) - parseFloat(element.fastTCV.replaceAll(',', '').substring(1));
            this.totalROI += parseFloat(element.fastTCV.replaceAll(',', '').substring(1)) / (parseFloat(element.noLeadsConvertedFast * element.commissionPerSaleAfterSplit.replaceAll(',', '').substring(1)) - parseFloat(element.fastTCV.replaceAll(',', '').substring(1)));
            // if (this.pricing == 12) {
            //     this.totalLeads += (element.slotSize == 'Half') ? element.selectedQuantityFast * this.conversionRate * 20 / 100 : element.selectedQuantityFast * this.conversionRate * 40 / 100;
            // }
            // else {
            //     this.totalLeads += (element.slotSize == 'Half') ? element.selectedQuantityFast * this.conversionRate * 10 / 100 : element.selectedQuantityFast * this.conversionRate * 20 / 100;
            // }
            this.totalLeads += element.noLeadsConvertedFast;
        }
        this.handleROISummaryDataFormat();
    }

    //To remove or subtract values from ROI summary fields
    handleROISummarySub(element, type) {
        if (type == 'flex') {
            this.totalMCV -= parseFloat(element.flexMCV.replaceAll(',', '').substring(1));
            this.totalTCV -= parseFloat(element.flexTCV.replaceAll(',', '').substring(1));
            this.totalCommission -= parseFloat(element.noLeadsConvertedFlex * element.commissionPerSaleAfterSplit.replaceAll(',', '').substring(1));
            this.totalProfit -= parseFloat(element.noLeadsConvertedFlex * element.commissionPerSaleAfterSplit.replaceAll(',', '').substring(1)) - parseFloat(element.flexTCV.replaceAll(',', '').substring(1));
            this.totalROI -= parseFloat(element.flexTCV.replaceAll(',', '').substring(1)) / (parseFloat(element.noLeadsConvertedFlex * element.commissionPerSaleAfterSplit.replaceAll(',', '').substring(1)) - parseFloat(element.flexTCV.replaceAll(',', '').substring(1)));
            // if (this.pricing == 12) {
            //     this.totalLeads -= (element.slotSize == 'Half') ? element.selectedQuantityFlex * this.conversionRate * 20 / 100 : element.selectedQuantityFlex * this.conversionRate * 40 / 100;
            // }
            // else {
            //     this.totalLeads -= (element.slotSize == 'Half') ? element.selectedQuantityFlex * this.conversionRate * 10 / 100 : element.selectedQuantityFlex * this.conversionRate * 20 / 100;
            // }
            this.totalLeads -= element.noLeadsConvertedFlex;
        }
        else {
            this.totalMCV -= parseFloat(element.fastMCV.replaceAll(',', '').substring(1));
            this.totalTCV -= parseFloat(element.fastTCV.replaceAll(',', '').substring(1));
            this.totalCommission -= parseFloat(element.noLeadsConvertedFast * element.commissionPerSaleAfterSplit.replaceAll(',', '').substring(1));
            this.totalProfit -= parseFloat(element.noLeadsConvertedFast * element.commissionPerSaleAfterSplit.replaceAll(',', '').substring(1)) - parseFloat(element.fastTCV.replaceAll(',', '').substring(1));
            this.totalROI -= parseFloat(element.fastTCV.replaceAll(',', '').substring(1)) / (parseFloat(element.noLeadsConvertedFast * element.commissionPerSaleAfterSplit.replaceAll(',', '').substring(1)) - parseFloat(element.fastTCV.replaceAll(',', '').substring(1)));
            // if (this.pricing == 12) {
            //     this.totalLeads -= (element.slotSize == 'Half') ? element.selectedQuantityFast * this.conversionRate * 20 / 100 : element.selectedQuantityFast * this.conversionRate * 40 / 100;
            // }
            // else {
            //     this.totalLeads -= (element.slotSize == 'Half') ? element.selectedQuantityFast * this.conversionRate * 10 / 100 : element.selectedQuantityFast * this.conversionRate * 20 / 100;
            // }
            this.totalLeads -= element.noLeadsConvertedFast;
        }
    }

    //To add formatting to ROI summary fields
    handleROISummaryDataFormat() {
        let tempDataForROI = JSON.parse(JSON.stringify(this.dataForROI));
        let totalMCVPrev = (tempDataForROI[0].totalMCV != '-') ? parseFloat(tempDataForROI[0].totalMCV.replaceAll(',', '').substring(1)) : 0;
        let totalTCVPrev = (tempDataForROI[0].totalTCV != '-') ? parseFloat(tempDataForROI[0].totalTCV.replaceAll(',', '').substring(1)) : 0;
        let totalROIPrev = (tempDataForROI[0].totalEstROI != '-') ? parseFloat(tempDataForROI[0].totalEstROI.replaceAll('X', '')) : 0;
        let totalCommissionPrev = (tempDataForROI[0].totalEstCommission != '-') ? parseFloat(tempDataForROI[0].totalEstCommission.replaceAll(',', '').substring(1)) : 0;
        let totalProfitPrev = (tempDataForROI[0].totalEstProfit != '-') ? parseFloat(tempDataForROI[0].totalEstProfit.replaceAll(',', '').substring(1)) : 0;
        let totalLeadsPrev = (tempDataForROI[0].totalEstLeads != '-') ? parseInt(tempDataForROI[0].totalEstLeads) : 0;
        tempDataForROI[0].totalEstROI = (tempDataForROI[0].totalROI != '-'&&this.totalTCV!=0) ? (this.totalCommission / this.totalTCV).toString().match(/^-?\d+(?:\.\d{0,1})?/)[0] + 'X' : '0X';
        tempDataForROI[0].totalTCV = (tempDataForROI[0].totalTCV != '-') ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.totalTCV) : '$0.00';
        tempDataForROI[0].totalMCV = (tempDataForROI[0].totalMCV != '-') ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.totalMCV) : '$0.00';
        tempDataForROI[0].totalEstCommission = (tempDataForROI[0].totalCommission != '-') ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.totalCommission) : '$0.00';
        tempDataForROI[0].totalEstProfit = (tempDataForROI[0].totalProfit != '-') ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.totalProfit) : '$0.00';
        tempDataForROI[0].totalEstLeads = (tempDataForROI[0].totalEstLeads != '-') ? this.totalLeads: '0';
        if(this.totalProfit<0){
            tempDataForROI[0].totalEstProfit = '$0.00'
        }
        this.dataForROI = tempDataForROI;
        this.handleHightlightIcon(totalMCVPrev, totalTCVPrev, totalCommissionPrev, totalProfitPrev, totalROIPrev, totalLeadsPrev);
    }

    //To handle ROI summary highlight icon changes
    handleHightlightIcon(totalMCVPrev, totalTCVPrev, totalCommissionPrev, totalProfitPrev, totalROIPrev, totalLeadsPrev) {
        let tempDataForROI = JSON.parse(JSON.stringify(this.dataForROI));
        let element = tempDataForROI[0];
        if (totalMCVPrev != this.totalMCV) {
            element.optionMCV = (totalMCVPrev <= this.totalMCV) ? 'up' : 'down';
            element.isVisibleMCV = true;
        }
        if (totalTCVPrev != this.totalTCV) {
            element.optionTCV = (totalTCVPrev <= this.totalTCV) ? 'up' : 'down';
            element.isVisibleTCV = true;
        }
        if (totalLeadsPrev != this.totalLeads) {
            element.optionLeads = (totalLeadsPrev <= Math.round(this.totalLeads)) ? 'up' : 'down';
            element.isVisibleLeads = true;
        }
        if (totalROIPrev != (this.totalCommission / this.totalTCV).toFixed(1)) {
            element.optionROI = (totalROIPrev <= (this.totalCommission / this.totalTCV).toFixed(1)) ? 'up' : 'down';
            element.isVisibleROI = true;
        }
        if (totalCommissionPrev != this.totalCommission) {
            element.optionCommission = (totalCommissionPrev <= this.totalCommission) ? 'up' : 'down';
            element.isVisibleCommission = true;
        }
        if (totalProfitPrev != this.totalProfit) {
            element.optionProfit = (totalProfitPrev <= this.totalProfit) ? 'up' : 'down';
            element.isVisibleProfit = true;
        }
        this.dataForROI = tempDataForROI;

        clearTimeout(this.timeOut);
        this.timeOut = setTimeout(() => {
            let tempDataForROI1 = JSON.parse(JSON.stringify(this.dataForROI));
            tempDataForROI1[0].isVisibleMCV = false;
            tempDataForROI1[0].isVisibleTCV = false;
            tempDataForROI1[0].isVisibleCommission = false;
            tempDataForROI1[0].isVisibleProfit = false;
            tempDataForROI1[0].isVisibleROI = false;
            tempDataForROI1[0].isVisibleLeads = false;
            tempDataForROI1[0].optionMCV = '';
            tempDataForROI1[0].optionTCV = '';
            tempDataForROI1[0].optionROI = '';
            tempDataForROI1[0].optionCommission = '';
            tempDataForROI1[0].optionProfit = '';
            tempDataForROI1[0].optionLeads = '';
            this.dataForROI = tempDataForROI1;
        }, 8000);
    }

    //To set quick quote related maps
    setMapForQuickQuote(zip, slotSize, type, selectedQuantity) {
        if (type == 'flex') {
            if (this.displayInModal) {
                this.flexProductsMapModal.set(zip + '-' + slotSize + '-' + 'Flex', selectedQuantity);
            }
            else {
                this.flexProductsMap.set(zip + '-' + slotSize + '-' + 'Flex', selectedQuantity);
            }
        }
        else {
            if (this.displayInModal) {
                this.fastProductsMapModal.set(zip + '-' + slotSize + '-' + 'Fast', selectedQuantity);
            }
            else {
                this.fastProductsMap.set(zip + '-' + slotSize + '-' + 'Fast', selectedQuantity);
            }
        }
    }

    //To delete instance from quick quote related maps
    unsetMapForQuickQuote(zip, slotSize, type) {
        if (type == 'flex') {
            if (this.displayInModal) {
                this.flexProductsMapModal.delete(zip + '-' + slotSize + '-' + 'Flex');
            }
            else {
                this.flexProductsMap.delete(zip + '-' + slotSize + '-' + 'Flex');
            }
        }
        else {
            if (this.displayInModal) {
                this.fastProductsMapModal.delete(zip + '-' + slotSize + '-' + 'Fast');
            }
            else {
                this.fastProductsMap.delete(zip + '-' + slotSize + '-' + 'Fast');
            }
        }
    }

    //Called when a valid change in quantity is detected 
    quantityUpdaterAdd(tempData, type, selectedQuantity, index) {
        let element = tempData[index];
        if (type == 'flex') {

            element.selectedQuantityFlex = selectedQuantity;
            element.commissionPerSale = parseFloat(element.medianMarketPriceToUse.replaceAll(',','').substring(1)) * this.commissionRate / 100;
            element.commissionPerSaleAfterSplit = parseFloat(element.commissionPerSale) * this.agentSplit / 100;
            if (this.pricing == 12) {
                element.noLeadsConvertedFlex = (element.slotSize == 'Half') ? Math.round(selectedQuantity * this.conversionRate * 20 / 100) : Math.round(selectedQuantity * this.conversionRate * 40 / 100);
            }
            else {
                element.noLeadsConvertedFlex = (element.slotSize == 'Half') ? Math.round(selectedQuantity * this.conversionRate * 10 / 100) : Math.round(selectedQuantity * this.conversionRate * 20 / 100);
            }
            element.flexMCV = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(element.intflexPrice * selectedQuantity);
            element.flexTCV = element.intflexPrice * selectedQuantity * this.pricing;
            let profit = parseFloat(element.noLeadsConvertedFlex) * parseFloat(element.commissionPerSaleAfterSplit) - parseFloat(element.flexTCV);
            let finalProfit = (profit <= 0) ? 0 : profit;
            element.isProfitLess = (finalProfit == 0) ? true : false;
            element.flexROI = '<p>Est. Commission: ' + new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(element.noLeadsConvertedFlex * element.commissionPerSaleAfterSplit) + '</p><p>Est. ROI: ' + (element.noLeadsConvertedFlex * element.commissionPerSaleAfterSplit / (element.flexTCV)).toString().match(/^-?\d+(?:\.\d{0,1})?/)[0] + 'X</p>Est. Profit: ' + new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(finalProfit) + ' ';
            element.commissionPerSale = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(element.commissionPerSale);
            element.commissionPerSaleAfterSplit = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(element.commissionPerSaleAfterSplit);
            element.flexTCV = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(element.intflexPrice * selectedQuantity * this.pricing);
            element.noLeadsConverted = '<p>Flex: ' + element.noLeadsConvertedFlex + '</p><p>Fast: ' + element.noLeadsConvertedFast + '</p>';
            element.estCommission = '<p>Per Sale: ' + element.commissionPerSale + '</p><p>After Split: ' + element.commissionPerSaleAfterSplit + '</p>';
        }
        else {
            element.selectedQuantityFast = selectedQuantity;
            element.commissionPerSale = parseFloat(element.medianMarketPriceToUse.replaceAll(',','').substring(1)) * this.commissionRate / 100;
            element.commissionPerSaleAfterSplit = parseFloat(element.commissionPerSale) * this.agentSplit / 100;
            if (this.pricing == 12) {
                element.noLeadsConvertedFast = (element.slotSize == 'Half') ? Math.round(selectedQuantity * this.conversionRate * 20 / 100) : Math.round(selectedQuantity * this.conversionRate * 40 / 100);
            }
            else {
                element.noLeadsConvertedFast = (element.slotSize == 'Half') ? Math.round(selectedQuantity * this.conversionRate * 10 / 100) : Math.round(selectedQuantity * this.conversionRate * 20 / 100);
            }
            element.fastMCV = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(element.intfastPrice * selectedQuantity);
            element.fastTCV = element.intfastPrice * selectedQuantity * this.pricing;
            let profit = parseFloat(element.noLeadsConvertedFast) * parseFloat(element.commissionPerSaleAfterSplit) - parseFloat(element.fastTCV);
            let finalProfit = (profit <=0) ? 0 : profit;
            element.fastROI = '<p>Est. Commission: ' + new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(element.noLeadsConvertedFast * element.commissionPerSaleAfterSplit) + '</p><p>Est. ROI: ' + (element.noLeadsConvertedFast * element.commissionPerSaleAfterSplit / (element.fastTCV)).toString().match(/^-?\d+(?:\.\d{0,1})?/)[0] + 'X</p><p>Est. Profit: ' + new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(finalProfit) + '</p>';
            element.commissionPerSale = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(element.commissionPerSale);
            element.commissionPerSaleAfterSplit = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(element.commissionPerSaleAfterSplit);
            element.fastTCV = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(element.intfastPrice * selectedQuantity * this.pricing);
            element.noLeadsConverted = '<p>Flex: ' + element.noLeadsConvertedFlex + '</p><p>Fast: ' + element.noLeadsConvertedFast + '</p>';
            element.estCommission = '<p>Per Sale: ' + element.commissionPerSale + '</p><p>After Split: ' + element.commissionPerSaleAfterSplit + '</p>';
        }
        return tempData;
    }

    //Called when quantity is either removed or invalid quantity is detected
    quantityUpdaterRemove(tempData, type, id, index) {
        let element = tempData[index];
        if (type == 'flex') {
            element.selectedQuantityFlex = '';
            if (this.selectedListFast.length < 1 && !this.selectedListFast.includes(id) && this.selectedListFastModal.length < 1 && !this.selectedListFastModal.includes(id)) {
                element.commissionPerSale = '-';
                element.commissionPerSaleAfterSplit = '-';
                element.estCommission = '-';
            }
            element.noLeadsConvertedFlex = '-';
            element.flexMCV = '-';
            element.flexTCV = '-';
            element.flexROI = '-';
            element.noLeadsConverted = (element.noLeadsConvertedFast>0)?'<p>Flex: ' + element.noLeadsConvertedFlex + '</p><p>Fast: ' + element.noLeadsConvertedFast + '</p>':'-';
            element.isProfitLess = false;
        }
        else {
            element.selectedQuantityFast = '';
            if (this.selectedListFlex.length < 1 && !this.selectedListFlex.includes(id) && this.selectedListFlexModal.length < 1 && !this.selectedListFlexModal.includes(id)) {
                element.commissionPerSale = '-';
                element.commissionPerSaleAfterSplit = '-';
                element.estCommission = '-';
            }
            element.noLeadsConvertedFast = '-';
            element.fastMCV = '-';
            element.fastTCV = '-';
            element.fastROI = '-';
            element.noLeadsConverted = (element.noLeadsConvertedFlex>0)?'<p>Flex: ' + element.noLeadsConvertedFlex + '</p><p>Fast: ' + element.noLeadsConvertedFast + '</p>':'-';
        }
        this.handleROISummaryDataFormat();
        return tempData;
    }

    //Handles overall values when any update in ROI rates is done
    handleRatesUpdate() {
        let tempData = (this.displayInModal) ? JSON.parse(JSON.stringify(this.originalDataForModal)) : JSON.parse(JSON.stringify(this.originalData));
        let totalMCV = 0;
        let totalTCV = 0;
        let totalCommission = 0;
        let totalProfit = 0;
        let totalLeads = 0;
        let tempDataForROI = JSON.parse(JSON.stringify(this.dataForROI));
        let totalMCVPrev = (tempDataForROI[0].totalMCV != '-') ? parseFloat(tempDataForROI[0].totalMCV.replaceAll(',', '').substring(1)) : 0;
        let totalTCVPrev = (tempDataForROI[0].totalTCV != '-') ? parseFloat(tempDataForROI[0].totalTCV.replaceAll(',', '').substring(1)) : 0;
        let totalROIPrev = (tempDataForROI[0].totalEstROI != '-') ? parseFloat(tempDataForROI[0].totalEstROI.replaceAll('X', '')) : 0;
        let totalCommissionPrev = (tempDataForROI[0].totalEstCommission != '-') ? parseFloat(tempDataForROI[0].totalEstCommission.replaceAll(',', '').substring(1)) : 0;
        let totalProfitPrev = (tempDataForROI[0].totalEstProfit != '-') ? parseFloat(tempDataForROI[0].totalEstProfit.replaceAll(',', '').substring(1)) : 0;
        let totalLeadsPrev = (tempDataForROI[0].totalEstLeads != '-') ? parseInt(tempDataForROI[0].totalEstLeads) : 0;

        if (this.searchValueForModal || this.searchValue) {
            tempData = (this.displayInModal) ? JSON.parse(JSON.stringify(this.dataBeforeSearch)) : JSON.parse(JSON.stringify(this.dataBeforeSearch));
        }
        let tempFlex = (this.displayInModal) ? this.selectedListFlexModal : this.selectedListFlex;
        let tempFast = (this.displayInModal) ? this.selectedListFastModal : this.selectedListFast;

        tempData.forEach(element => {
            if (tempFlex.includes(element.uniqueId)) {
                element.commissionPerSale = parseFloat(element.medianMarketPriceToUse.replaceAll(',','').substring(1)) * this.commissionRate / 100;
                element.commissionPerSaleAfterSplit = element.commissionPerSale * this.agentSplit / 100;

                if (this.pricing == 12) {
                    element.noLeadsConvertedFlex = (element.slotSize == 'Half') ? Math.round(element.selectedQuantityFlex * this.conversionRate * 20 / 100) : Math.round(element.selectedQuantityFlex * this.conversionRate * 40 / 100);
                }
                else {
                    element.noLeadsConvertedFlex = (element.slotSize == 'Half') ? Math.round(element.selectedQuantityFlex * this.conversionRate * 10 / 100) : Math.round(element.selectedQuantityFlex * this.conversionRate * 20 / 100);
                }
                totalCommission += element.noLeadsConvertedFlex * element.commissionPerSaleAfterSplit;
                // if (this.pricing == 12) {
                //     totalLeads += (element.slotSize == 'Half') ? element.selectedQuantityFlex * this.conversionRate * 20 / 100 : element.selectedQuantityFlex * this.conversionRate * 40 / 100;
                // }
                // else {
                //     totalLeads += (element.slotSize == 'Half') ? element.selectedQuantityFlex * this.conversionRate * 10 / 100 : element.selectedQuantityFlex * this.conversionRate * 20 / 100;
                // }
                totalLeads +=element.noLeadsConvertedFlex;
                totalMCV += (element.intflexPrice * element.selectedQuantityFlex);
                element.flexMCV = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(element.intflexPrice * element.selectedQuantityFlex);
                element.flexTCV = element.intflexPrice * element.selectedQuantityFlex * this.pricing;
                totalTCV += element.flexTCV;
                totalProfit += (element.noLeadsConvertedFlex * element.commissionPerSaleAfterSplit) - element.flexTCV;
                let profit = (parseFloat(element.noLeadsConvertedFlex) * parseFloat(element.commissionPerSaleAfterSplit)) - parseFloat(element.flexTCV);
                let finalProfit = (profit <=0) ? 0 : profit;
                element.isProfitLess = (finalProfit == 0) ? true : false;
                element.flexROI = '<p>Est. Commission: ' + new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(element.noLeadsConvertedFlex * element.commissionPerSaleAfterSplit) + '</p><p>Est. ROI: ' + (element.noLeadsConvertedFlex * element.commissionPerSaleAfterSplit / (element.flexTCV)).toString().match(/^-?\d+(?:\.\d{0,1})?/)[0] + 'X</p>Est. Profit: ' + new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(finalProfit) + ' ';
                element.commissionPerSale = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(element.commissionPerSale);
                element.commissionPerSaleAfterSplit = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(element.commissionPerSaleAfterSplit);
                element.flexTCV = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(element.intflexPrice * element.selectedQuantityFlex * this.pricing);
                element.noLeadsConverted = '<p>Flex: ' + element.noLeadsConvertedFlex + '</p><p>Fast: ' + element.noLeadsConvertedFast + '</p>';
                element.estCommission = '<p>Per Sale: ' + element.commissionPerSale + '</p><p>After Split: ' + element.commissionPerSaleAfterSplit + '</p>';
            }

            if (tempFast.includes(element.uniqueId)) {
                element.commissionPerSale = parseFloat(element.medianMarketPriceToUse.replaceAll(',','').substring(1)) * this.commissionRate / 100;
                element.commissionPerSaleAfterSplit = element.commissionPerSale * this.agentSplit / 100;
                if (this.pricing == 12) {
                    element.noLeadsConvertedFast = (element.slotSize == 'Half') ? Math.round(element.selectedQuantityFast * this.conversionRate * 20 / 100) : Math.round(element.selectedQuantityFast * this.conversionRate * 40 / 100);
                }
                else {
                    element.noLeadsConvertedFast = (element.slotSize == 'Half') ? Math.round(element.selectedQuantityFast * this.conversionRate * 10 / 100) : Math.round(element.selectedQuantityFast * this.conversionRate * 20 / 100);
                }
                totalCommission += element.noLeadsConvertedFast * element.commissionPerSaleAfterSplit;
                // if (this.pricing == 12) {
                //     totalLeads += (element.slotSize == 'Half') ? element.selectedQuantityFast * this.conversionRate * 20 / 100 : element.selectedQuantityFast * this.conversionRate * 40 / 100;
                // }
                // else {
                //     totalLeads += (element.slotSize == 'Half') ? element.selectedQuantityFast * this.conversionRate * 10 / 100 : element.selectedQuantityFast * this.conversionRate * 20 / 100;
                // }
                totalLeads +=element.noLeadsConvertedFast;
                totalMCV += (element.intfastPrice * element.selectedQuantityFast);
                element.fastMCV = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(element.intfastPrice * element.selectedQuantityFast);
                element.fastTCV = element.intfastPrice * element.selectedQuantityFast * this.pricing;
                totalTCV += element.fastTCV;
                totalProfit += (element.noLeadsConvertedFast * element.commissionPerSaleAfterSplit) - element.fastTCV;
                let profit = parseFloat(element.noLeadsConvertedFast) * parseFloat(element.commissionPerSaleAfterSplit) - parseFloat(element.fastTCV);
                let finalProfit = (profit <=0) ? 0 : profit;
                element.fastROI = '<p>Est. Commission: ' + new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(element.noLeadsConvertedFast * element.commissionPerSaleAfterSplit) + '</p><p>Est. ROI: ' + (element.noLeadsConvertedFast * element.commissionPerSaleAfterSplit / (element.fastTCV)).toString().match(/^-?\d+(?:\.\d{0,1})?/)[0] + 'X</p><p>Est. Profit: ' + new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(finalProfit) + '</p>';
                element.commissionPerSale = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(element.commissionPerSale);
                element.commissionPerSaleAfterSplit = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(element.commissionPerSaleAfterSplit);
                element.fastTCV = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(element.intfastPrice * element.selectedQuantityFast * this.pricing);
                element.noLeadsConverted = '<p>Flex: ' + element.noLeadsConvertedFlex + '</p><p>Fast: ' + element.noLeadsConvertedFast + '</p>';
                element.estCommission = '<p>Per Sale: ' + element.commissionPerSale + '</p><p>After Split: ' + element.commissionPerSaleAfterSplit + '</p>';
            }
        });

        tempDataForROI[0].totalEstROI = (totalTCV != 0) ? (totalCommission / totalTCV).toString().match(/^-?\d+(?:\.\d{0,1})?/)[0] + 'X' : '0X';
        tempDataForROI[0].totalTCV = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalTCV);
        tempDataForROI[0].totalMCV = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalMCV);
        tempDataForROI[0].totalEstCommission = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalCommission);
        tempDataForROI[0].totalEstProfit = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalProfit);
        tempDataForROI[0].totalEstLeads = totalLeads;
        if(totalProfit<0){
            //tempDataForROI[0].totalEstROI = '0X';
            tempDataForROI[0].totalEstProfit = '$0.00'
        }
        this.dataForROI = tempDataForROI;
        this.totalMCV = totalMCV;
        this.totalTCV = totalTCV;
        this.totalROI = (totalTCV!=0)?parseFloat((totalCommission / totalTCV).toString().match(/^-?\d+(?:\.\d{0,1})?/)[0]):0;
        this.totalCommission = totalCommission;
        this.totalProfit = totalProfit;
        this.totalLeads = totalLeads;
        this.handleHightlightIcon(totalMCVPrev, totalTCVPrev, totalCommissionPrev, totalProfitPrev, totalROIPrev, totalLeadsPrev);
        if (this.displayInModal) {
            this.originalDataForModal = tempData;
        }
        else {
            this.originalData = tempData;
        }
        
        this.dataBeforeSearch = tempData;
        if (this.noOfRowsValue != 'All') {
            this.pagination();
        } else {
            this.handleRowNumChange();
        }
        if (this.searchValueForModal) this.handleSearch();
    }

    handleMedianMarketValueChange(event) {
        let tempData = (this.displayInModal) ? JSON.parse(JSON.stringify(this.originalDataForModal)) : JSON.parse(JSON.stringify(this.originalData));
        let tempdataBeforeSearch = JSON.parse(JSON.stringify(this.dataBeforeSearch));
        let id = event.detail.uniqueId;
        let index = tempData.findIndex(data => {
            return id == data.uniqueId;
        });
        let indexBeforeSearch = tempdataBeforeSearch.findIndex(data => {
            return id == data.uniqueId;
        });
        if (this.displayInModal) {
            tempData[index].medianMarketPriceToUse = event.detail.value;
            this.originalDataForModal = tempData;
        }
        else {
            tempData[index].medianMarketPriceToUse = event.detail;
            this.originalData = tempData;
        }
        tempdataBeforeSearch[indexBeforeSearch].medianMarketPriceToUse = event.detail.value;
        this.dataBeforeSearch = tempdataBeforeSearch;

        if (this.isSelectedModal || this.isSelected) {
            this.handleRatesUpdate();
        }
        if (this.noOfRowsValue != 'All') {
            this.pagination();
        } else {
            this.handleRowNumChange();
        }

    }

    //Handle sort functionality
    handleSort(event) {
        let tempData = (this.displayInModal) ? JSON.parse(JSON.stringify(this.originalDataForModal)) : JSON.parse(JSON.stringify(this.originalData));
        let sortByType = this.sortBy;
        if (event) {
            if (this.displayInModal) {
                this.sortByModal = event.detail.fieldName;
                this.sortDirectionModal = event.detail.sortDirection;
                sortByType = this.sortByModal;
            }
            else {
                this.sortBy = event.detail.fieldName
                this.sortDirection = event.detail.sortDirection;
                sortByType = this.sortBy;
            }
        }

        let column;
        if (sortByType == 'market') {
            column = this.marketColumnData[0];
        }
        else if(sortByType == 'medianMarketPriceToUse'){
            column = this.marketColumnData[1];
        }
        else {
            column = (this.displayInModal) ? this.columnDataModalExtension.find(c => c.fieldName === this.sortByModal) : this.columnData.find(c => c.fieldName === this.sortBy);
        }
        let records = (this.displayInModal) ? JSON.parse(JSON.stringify(this.originalDataForModal)) : JSON.parse(JSON.stringify(this.originalData));
        let parser = (v) => v;

        let sortMult = (this.displayInModal) ? this.sortDirectionModal === 'asc' ? 1 : -1 : this.sortDirection === 'asc' ? 1 : -1;
        tempData = records.sort((a, b) => {
            if (this.priceLabelArray.includes(column.label)) {
                let p1 = (a[sortByType]) == '-' ? '-1' : a[sortByType];
                let p2 = (b[sortByType]) == '-' ? '-1' : b[sortByType];
                let temp = (p1.includes(',')) ? p1.replaceAll(',', '') : p1;
                let temp1 = (p2.includes(',')) ? p2.replaceAll(',', '') : p2;

                temp = (temp.includes('$')) ? parseFloat(temp.substring(1)) : parseFloat(temp);
                temp1 = (temp1.includes('$')) ? parseFloat(temp1.substring(1)) : parseFloat(temp1);
                let a1 = parser(temp), b1 = parser(temp1);
                let r1 = a1 < b1, r2 = a1 === b1;
                return r2 ? 0 : r1 ? -sortMult : sortMult;
            }
            else if (sortByType == 'bestPromoAvailable') {
                let p1 = (a[sortByType]) == '--' ? '-1' : a[sortByType];
                let p2 = (b[sortByType]) == '--' ? '-1' : b[sortByType];
                let temp = (p1.includes('%')) ? p1.replaceAll('%', '') : p1;
                let temp1 = (p2.includes('%')) ? p2.replaceAll('%', '') : p2;

                temp = parseFloat(temp);
                temp1 = parseFloat(temp1);
                let a1 = parser(temp), b1 = parser(temp1);
                let r1 = a1 < b1, r2 = a1 === b1;
                return r2 ? 0 : r1 ? -sortMult : sortMult;
            }
            else {
                let a1 = parser(a[sortByType]), b1 = parser(b[sortByType]);
                let r1 = a1 < b1, r2 = a1 === b1;
                return r2 ? 0 : r1 ? -sortMult : sortMult;
            }

        });
        if (this.displayInModal) {
            this.originalDataForModal = tempData;
        }
        else {
            this.originalData = tempData;
        }
        if (event) {
            if (this.displayInModal) {
                this.sortByModal = event.detail.fieldName;
            }
            else {
                this.sortBy = event.detail.fieldName
            }
        }
        if (this.noOfRowsValue != 'All') {
            this.handleFirst();
        } else {
            this.handleRowNumChange();
        }
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
        let tempData = (this.displayInModal) ? this.originalDataForModal : this.originalData;
        tempData = searchValue ? this.filterTableData(searchValue) : this.dataBeforeSearch;
        if (this.displayInModal) {
            this.originalDataForModal = tempData;
            this.searchValueForModal = searchValue;
        }
        else {
            this.originalData = tempData;
            this.searchValue = searchValue;
        }
        if (searchValue == '') this.handleSort();
        this.totalRecord = tempData.length;
        if (this.noOfRowsValue != 'All') {
            this.handleFirst();
        } else {
            this.handleRowNumChange();
        }
    }

    // Generic function to filter out data based on keyword from search input field	
    filterTableData(searchVal) {
        let dataArray = this.dataBeforeSearch;
        let tableColumn = this.marketColumnData.concat(this.columnDataModal);
        let arrayAfterSearch = dataArray.filter(el => {
            for (let i = 0; i < tableColumn.length; i++) {
                let fieldName = tableColumn[i].fieldName;
                let fieldValue = String(el[fieldName]);
                if (fieldValue.toLowerCase().indexOf(searchVal.toLowerCase()) != -1) {
                    return true;
                    break;
                }
            }
        })
        return arrayAfterSearch;
    }

    //To open the modal popup
    handleShowAll() {

        this.flexProductsMap.forEach((value, key) => {
            this.flexProductsMapModal.set(key, value);
        });
        this.fastProductsMap.forEach((value, key) => {
            this.fastProductsMapModal.set(key, value);
        });
        this.displayInModal = true;
        this.selectedListFastModal = this.selectedListFast.slice();
        this.selectedListFlexModal = this.selectedListFlex.slice();
        this.showCBCLabelForModal = this.buttonLabel;
        this.showCBCVariantForModal = this.showCBCVariant;
        this.originalDataForModal = this.originalData;
        this.searchValueForModal = this.searchValue;
        this.isSelectedModal = this.isSelected;
        this.sortByModal = this.sortBy;
        this.sortDirectionModal = this.sortDirection;
        this.columnDataModal = (this.isSelectedModal) ? this.columnDataModalExtension : this.columnDataPrev;
        this.handleRatesUpdate();
        if (this.searchValueForModal) this.handleSearch();
        let tempDataForROI = JSON.parse(JSON.stringify(this.dataForROI));
        this.totalMCV = parseFloat(tempDataForROI[0].totalMCV.replaceAll(',', '').substring(1));
        this.totalTCV = parseFloat(tempDataForROI[0].totalTCV.replaceAll(',', '').substring(1));
        this.totalROI = (tempDataForROI[0].totalEstROI != '-') ? parseFloat(tempDataForROI[0].totalEstROI.replaceAll('X', '')) : 0;
        this.totalCommission = parseFloat(tempDataForROI[0].totalEstCommission.replaceAll(',', '').substring(1));
        this.totalProfit = parseFloat(tempDataForROI[0].totalEstProfit.replaceAll(',', '').substring(1));
        if (this.noOfRowsValue != 'All') {
            this.pagination();
        }
        else {
            this.handleRowNumChange();
        }
        this.showSpinnerModal = false;
    }

    //To close modal when cancel button or close icon is clicked
    handleModalClose() {
        this.displayInModal = false;
        this.originalDataForModal = this.originalData;
        this.totalRecord = this.originalData.length;
        this.isSelectedModal = this.isSelected;
        this.columnDataModal = (this.isSelected) ? this.columnDataModalExtension : this.columnDataPrev;
        if (this.noOfRowsValue != 'All') {
            this.handleFirst();
        } else {
            this.handleRowNumChange();
        }
        this.searchValueForModal = '';
        this.isFocusedModal = false;
        let tempDataForROI = JSON.parse(JSON.stringify(this.dataForROI));
        this.totalMCV = parseFloat(tempDataForROI[0].totalMCV.replaceAll(',', '').substring(1));
        this.totalTCV = parseFloat(tempDataForROI[0].totalTCV.replaceAll(',', '').substring(1));
        this.totalROI = (tempDataForROI[0].totalEstROI != '-') ? parseFloat(tempDataForROI[0].totalEstROI.replaceAll('X', '')) : 0;
        this.totalCommission = parseFloat(tempDataForROI[0].totalEstCommission.replaceAll(',', '').substring(1));
        this.totalProfit = parseFloat(tempDataForROI[0].totalEstProfit.replaceAll(',', '').substring(1));
    }

    //To close modal on press of Escape key
    handleKeyDown(event) {
        if (event.code == 'Escape') {
            this.handleModalClose();
            document.documentElement.style.setProperty('--display', 'none');
            window.removeEventListener('message', () => {
                console.log('Event listner removed for Oracle.');
            });
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }

    //To save the modal popup state
    handleModalSave() {
        this.flexProductsMapModal.forEach((value, key) => {
            this.flexProductsMap.set(key, value);
        });
        this.fastProductsMapModal.forEach((value, key) => {
            this.fastProductsMap.set(key, value);
        });
        this.selectedListFast = this.selectedListFastModal.slice();
        this.selectedListFlex = this.selectedListFlexModal.slice();
        this.displayInModal = false;
        this.originalData = this.originalDataForModal;
        this.showCBCVariant = this.showCBCVariantForModal;
        this.buttonLabel = this.showCBCLabelForModal;
        this.totalRecord = this.originalData.length;
        this.searchValue = this.searchValueForModal;
        this.isSelected = this.isSelectedModal;
        this.isFocusedModal = false;
        this.columnDataModal = (this.isSelectedModal) ? this.columnDataModalExtension : this.columnDataPrev;
        if (this.noOfRowsValue != 'All') {
            this.handleFirst();
        } else {
            this.handleRowNumChange();
        }
        this.handleQuickQuoteData();
    }

    //Handles change in no of rows per page
    handleRowNumChange(event) {
        this.noOfRowsValue = (event) ? event.target.value : this.noOfRowsValue; //25
        if (this.noOfRowsValue != 'All') {
            this.currentPage = Math.floor(this.firstRecordIndex / parseInt(this.noOfRowsValue)); // 31/25 = 5
            this.handleNext();
        }
        else {
            if (this.displayInModal) {
                this.dataForModal = this.originalDataForModal;
                this.segregateMarketTableData(this.dataForModal);
            }
            else {
                this.data = this.originalData;
            }
            this.lastRecordIndex = this.totalRecord;
            this.isFirstRecord = true;
            this.isLastRecord = true;
        }

    }

    //Set first page of pagination
    handleFirst() {
        this.currentPage = 1;
        this.pagination();
    }

    //Set last page of pagination
    handleLast() {
        this.currentPage = this.totalPage;
        this.pagination();
    }

    //Handle previous page event
    handlePrevious() {
        this.currentPage--;
        this.pagination();
    }

    //Handle next page event
    handleNext() {
        this.currentPage++;
        this.pagination();
    }

    //Handle overall pagination wrt change in data
    pagination() {
        this.totalPage = this.totalRecord < this.noOfRowsValue ? 1 : Math.ceil(this.totalRecord / this.noOfRowsValue);
        let data = (this.displayInModal) ? JSON.parse(JSON.stringify(this.originalDataForModal)) : JSON.parse(JSON.stringify(this.originalData));
        let paginationResult = this.datatablePagination(data, this.noOfRowsValue, this.currentPage, this.totalPage, this.totalRecord);
        if (this.displayInModal) {
            this.dataForModal = paginationResult.data;
            this.segregateMarketTableData(this.dataForModal);
        }
        else {
            this.data = paginationResult.data;
        }
        this.firstRecordIndex = paginationResult.firstIndex;
        this.lastRecordIndex = paginationResult.lastIndex;
        this.isFirstRecord = paginationResult.firstPage;
        this.isLastRecord = paginationResult.lastPage;
    }

    //handle data passed to datatable upon any change in pagination
    datatablePagination(dataArray, noOfRow, pageNo, totalPage, totalRecord) {

        let firstIndex = (pageNo - 1) * noOfRow + 1;
        let lastIndex = totalPage == pageNo ? totalRecord : (pageNo * noOfRow);

        let isFirst = pageNo == 1 ? true : false;
        let isLast = pageNo == totalPage ? true : false;
        let data = dataArray;
        let arrayAfterPagination = data.filter((element, index) => {
            return index >= (firstIndex - 1) && index < lastIndex
        })
        return { data: arrayAfterPagination, firstIndex: firstIndex, lastIndex: lastIndex, firstPage: isFirst, lastPage: isLast };
    }

    //To handle quick quote data creation 
    handleQuickQuoteData() {
        let selectedCodes = '';
        //let attributes = new Object();
        if (this.flexProductsMap.size > 0) {
            for (let [k, v] of this.flexProductsMap) {
                if (v !== '') {
                    let flexQty = k + '-' + v;
                    if (selectedCodes.length == 0)
                        selectedCodes = flexQty;
                    else
                        selectedCodes = selectedCodes + ',' + flexQty;
                }
            }
        }
        if (this.fastProductsMap.size > 0) {
            for (let [k, v] of this.fastProductsMap) {
                if (v !== '') {
                    let fastQty = k + '-' + v;
                    if (selectedCodes.length == 0)
                        selectedCodes = fastQty;
                    else
                        selectedCodes = selectedCodes + ',' + fastQty;
                }
            }
        }

        if (!selectedCodes.length == 0) {
            this.attributesToCPQ['selectedCBCmarkets'] = selectedCodes;
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
        this.publishCONData({ 'selectedCBCmarkets': this.attributesToCPQ['selectedCBCmarkets'] });
    }

    publishCONData(conPayload) {
        console.log('in publish');
        publish(this.messageContext, QUICK_QUOTE_LMC, {
            CONPayload: conPayload,
            QQClickedFrom: 'Connections',
            accountId: this.recordId
        });
    }

    //Open QQ in modal
    openQuickQuote() {
        console.log('In open quick quote');
        document.documentElement.style.setProperty('--display', 'block');
        this.template.querySelector("c-l-m_-quick-quote-component").payloadUpdater(this.attributesToCPQ);
        this.template.querySelector(".modalSectionToFindFocusQQ").focus();
    }

    //Close Quick Quote modal
    handleQQModalClose() {
        document.documentElement.style.setProperty('--display', 'none');
        this.displayQQModal = false;
        window.removeEventListener('message', () => {
            console.log('Event listner removed for Oracle.');
        });
    }

    segregateMarketTableData(modalTabledata) {
        this.marketData = modalTabledata.map(data => { return { 'market': data['market'],'rowColorForMarket':data['rowColorForMarket'],'medianMarketPriceToUse':data['medianMarketPriceToUse'],'medianMarketPrice':data['medianMarketPrice'],'uniqueId':data['uniqueId'] } });
    }

    handleAccountSummaryPublish(flexTotal,fastTotal,cityTotal,zipTotal,mrTotal){
        publish(this.messageContext, accountSummary, {
            Payload: {flexTotal:flexTotal,fastTotal:fastTotal,cityTotal:cityTotal,zipTotal:zipTotal,mrTotal:mrTotal},
            accountId: this.recordId
        });
    }

    //Handle show toast events
    showToast(title, message, variant, mode) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: mode
        });
        this.dispatchEvent(evt);
    }

}