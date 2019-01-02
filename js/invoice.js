let table = $("#tableBody");        
let invoiceDate;                    
let grandTotal = $('#grandTotal');  
let numberOfRows = 0;              
let selectedRow = $('#row1');      
const cityTaxValue = 0.0175;        
const stateTaxValue = 0.055;        
let invoiceItems = [];              
let invoiceTotal = 0;               
let startingCellValue;              
let newCellValue;                   

const usd = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
});

function setAccountNumber(account) {
    $("#accountNumber").text(account);
}

function setInvoiceNumber(invoiceNumber) {
    $("#invoiceNumber").text(invoiceNumber);
}

function setRecipient(recipient) {
    $("#recipient").text(recipient);
}

function displayTodaysDate() {
    let dateOfInvoice = new Date();
    let dd = dateOfInvoice.getDate();
    let mm = dateOfInvoice.getMonth() + 1;
    let yyyy = dateOfInvoice.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }

    dateOfInvoice = yyyy + '-' + mm + '-' + dd;
    invoiceDate = dd + "/" + mm + "/" + yyyy;
    $("#invoiceDate").val(dateOfInvoice);
    console.log("Date input changed to " + invoiceDate + ".");
}

function Item(row) {
    this.rowNumber = row;
    this.description;
    this.quantity = 0;
    this.unitPrice = 0;
    this.cityTax = false;
    this.stateTax = false;
    this.subtotal = 0;
};

function updateInvoiceTotal() {
    invoiceTotal = 0;
    for (i = 0; i < invoiceItems.length; i++) {
        invoiceTotal += invoiceItems[i].subtotal;
        table.children().eq(i).find(".total").text(usd.format(invoiceTotal));
    }
    console.log("updating invoice total");
    grandTotal.text("Grand Total: " + usd.format(invoiceTotal));
}

function updateItemsRowNumber() {
    for (i = 0; i < numberOfRows; i++) {
        invoiceItems[i].rowNumber = (i + 1);
    }
}

function updateItemDescription(itemNumber, newDescription) {
    invoiceItems[itemNumber - 1].description = newDescription;
    console.log("Updated item #" + itemNumber + "'s description to " + invoiceItems[itemNumber - 1].description + ".");
}

function updateItemQuantity(itemNumber, newQuantity) {
    invoiceItems[itemNumber - 1].quantity = newQuantity;
    console.log("Updated item #" + itemNumber + "'s quantity to " + invoiceItems[itemNumber - 1].quantity + ".");
}

function updateItemUnitPrice(itemNumber, newUnitPrice) {
    invoiceItems[itemNumber - 1].unitPrice = newUnitPrice;
    console.log("Updated item #" + itemNumber + "'s unit price to " + invoiceItems[itemNumber - 1].unitPrice + ".");
}

function updateCityTax(itemNumber, cityTaxValue) {
    invoiceItems[itemNumber - 1].cityTax = cityTaxValue;
    console.log("Updated item #" + itemNumber + "'s city tax to " + invoiceItems[itemNumber - 1].cityTax + ".");
}

function updateStateTax(itemNumber, stateTaxValue) {
    invoiceItems[itemNumber - 1].stateTax = stateTaxValue;
    console.log("Updated item #" + itemNumber + "'s state tax to " + invoiceItems[itemNumber - 1].stateTax + ".");
}

function updateItemSubtotal(itemNumber) {
    let itemQuantity = invoiceItems[itemNumber - 1].quantity;
    let itemUnitPrice = invoiceItems[itemNumber - 1].unitPrice;
    let itemSubtotal = Number((itemQuantity * itemUnitPrice).toFixed(2));
    let calculatedCityTax;
    let calculatedStateTax;

    // Function to round a number.
    // Source : https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-only-if-necessary
    // Used this over .toFixed(2) when it came to rounding the tax values,
    // using toFixed(2) often caused rounding errors.
    function roundNumber(num, scale) {
        if(!("" + num).includes("e")) {
          return +(Math.round(num + "e+" + scale)  + "e-" + scale);
        } else {
          var arr = ("" + num).split("e");
          var sig = ""
          if(+arr[1] + scale > 0) {
            sig = "+";
          }
          return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
        }
      }

    console.log("Item value before tax is " + itemSubtotal);

    let subtotalWithTaxes = itemSubtotal;

    if (invoiceItems[itemNumber - 1].cityTax) {
        calculatedCityTax = Number(itemSubtotal * cityTaxValue);
        console.log("Item city tax is " + calculatedCityTax);
        subtotalWithTaxes += Number(calculatedCityTax);
    }
    if (invoiceItems[itemNumber - 1].stateTax) {
        calculatedStateTax = Number(itemSubtotal * stateTaxValue);
        console.log("Item state tax is " + calculatedStateTax)
        subtotalWithTaxes += Number(calculatedStateTax);
    }

    console.log("Item total with taxes before rounding is " + subtotalWithTaxes);
    let updatedSubtotal = roundNumber(subtotalWithTaxes, 2);
    console.log("Item total with taxes after rounding is " + updatedSubtotal);
    invoiceItems[itemNumber - 1].subtotal = Number(updatedSubtotal);
    selectedRow.find(".subtotal").text(usd.format(updatedSubtotal));
    updateInvoiceTotal();

    console.log("Updated item #" + itemNumber + "'s subtotal to " + invoiceItems[itemNumber - 1].subtotal + ".");
}

function removeItemFromArray(itemIndex) {
    invoiceItems.splice(itemIndex, 1);
}


function addNewRow() {
    numberOfRows++;

    let newRow = $("#defaultRow").html();
    $("#tableBody").append(newRow);
    table.children().last().attr('id', function () {
        return "row" + numberOfRows;
    });

    let invoiceItem = new Item(numberOfRows);
    invoiceItems.push(invoiceItem);
    table.children().eq(numberOfRows - 1).find(".subtotal").text(usd.format(0));
    table.children().eq(numberOfRows - 1).find(".total").text(usd.format(invoiceTotal));
    table.children().last().find('.desc').focus();
}

function updateRowIDs() {
    let objectLength = 0;

    for (i = 0; i < numberOfRows; i++) {
        table.children().eq(objectLength).attr('id', function () {
            return "row" + (objectLength + 1);
        });
        objectLength++;
    }
}

$(document).ready(function () {
    displayTodaysDate();
    addNewRow();

    $(document).keydown(function (e) {
        if (e.keyCode == 13) {
            addNewRow();
            return false;
        }
    });

    $(document).on('click', '.deleteButton', function () {
        let rowID = $(this).parent().parent().attr("id");
        let itemNumber = parseInt(rowID.slice(3));
        removeItemFromArray(itemNumber - 1);
        numberOfRows--;
        $(this).parent().parent().remove();
        updateItemsRowNumber();
        updateRowIDs();
        updateInvoiceTotal();
    });

    $(document).on('focus', '.desc', function () {
        startingCellValue = $(this).val();
    });

    $(document).on('focus', '.qty, .unitPrice', function () {
        startingCellValue = parseFloat($(this).val());
    });

    $(document).on('blur', '.desc', function () {
        newCellValue = $(this).val();
        if (startingCellValue !== newCellValue) {
            selectedRow = $(this).parent().parent();
            let rowID = selectedRow.attr("id");
            let itemNumber = parseInt(rowID.slice(3));
            updateItemDescription(itemNumber, newCellValue);
        }
    });

    $(document).on('keyup', '.qty, .unitPrice', function () {
        newCellValue = parseFloat($(this).val());
        let checkFixedValue = Number(newCellValue.toFixed(2));

        // If the fixed decimal value differs from what the user entered,
        // IE a number such as 3.493, it will change it to the decimal value.
        if (newCellValue !== checkFixedValue) {
            console.log("Value was not formatted correctly changing to fixed decimal.");
            newCellValue = checkFixedValue;
            $(this).val(checkFixedValue);
        }

        if (Number.isNaN(newCellValue)) {
            newCellValue = 0;
        }


        if (startingCellValue !== newCellValue) {
            selectedRow = $(this).parent().parent();
            let rowID = selectedRow.attr("id");
            let itemNumber = parseInt(rowID.slice(3));
            let selectedClass = $(this).attr('class');
            if (selectedClass == 'qty') {
                updateItemQuantity(itemNumber, newCellValue);
            } else if (selectedClass == 'unitPrice') {
                updateItemUnitPrice(itemNumber, newCellValue);
            }
            updateItemSubtotal(itemNumber);
        }
        startingCellValue = newCellValue;
    });

    $(document).on('blur', '.qty, .unitPrice', function () {
        newCellValue = parseFloat($(this).val());
        if (Number.isNaN(newCellValue)) {
            newCellValue = 0;
            $(this).val(0);
        }
    });

    // If the item's city or state tax boolean value has changed,
    // update the item's city or state tax property,
    // then calculate and update the item's subtotal.
    $(document).on('change', '.cityTax, .stateTax', function () {
        let checkboxClass = $(this).attr('class');
        let checkboxValue = $(this).prop("checked");
        selectedRow = $(this).parent().parent();
        let rowID = selectedRow.attr("id");
        let itemNumber = parseInt(rowID.slice(3));
        if (checkboxClass == "cityTax" && checkboxValue != invoiceItems[itemNumber - 1].cityTax) {
            updateCityTax(itemNumber, checkboxValue);
        } else if (checkboxClass == "stateTax" && checkboxValue != invoiceItems[itemNumber - 1].stateTax) {
            updateStateTax(itemNumber, checkboxValue);
        }
        updateItemSubtotal(itemNumber);
    });

    /* Get the date value when blurred.
        I've commented out this function,
        If the intent is to let a user change the date of invoice just uncomment it
        and remove the readonly attribute from the html input.
        otherwise delete this.

    $(document).on('blur', '#invoiceDate', function () {
        let date = new Date($('#invoiceDate').val());
        month = date.getMonth() + 1;
        day = date.getDate() + 1;
        year = date.getFullYear();
        invoiceDate = [month, day, year].join('/');
        console.log("Invoice date changed to " + invoiceDate);
    });
    */
});