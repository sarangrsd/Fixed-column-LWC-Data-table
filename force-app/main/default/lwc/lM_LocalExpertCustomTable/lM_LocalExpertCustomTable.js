import LightningDatatable from 'lightning/datatable';
import lM_ActionButton from './lM_ActionButton.html';
import lM_InputNumber from './lM_InputNumber.html';
import lM_EntryType from './lM_EntryType.html';
import lM_HighlightIcon from './lM_HighlightIcon.html';
import lM_InputWithDefaultValue from './lM_InputWithDefaultValue.html';

export default class LM_LocalExpertCustomTable extends LightningDatatable {

    static customTypes = {
        lM_ActionButton: {
            template: lM_ActionButton,
            typeAttributes: ['isButtonVisible', 'iconName']
        },

        lM_InputNumber: {
            template: lM_InputNumber,
            typeAttributes: ['quantity', 'minQuantity','selectedQuantity', 'uniqueMarket', 'quantityExceededMsg','invalidQuantityMsg','isInputFieldVisible','isConnections','type','idType','styleClass','hasAEXAsset']
        },

        lM_EntryType: {
            template: lM_EntryType,
            typeAttributes: ['entryType','isProfitLess','helpTextMsg','minimumHeight'],
            standardCellLayout: true
        },

        lM_HighlightIcon: {
            template: lM_HighlightIcon,
            typeAttributes: ['currentValue','isVisible','optionForIcon'],
            standardCellLayout: true
        },

        lM_InputWithDefaultValue: {
            template: lM_InputWithDefaultValue,
            typeAttributes:['defaultValue','changedValue','uniqueId']
        }

    }
}