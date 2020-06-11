/*
 * star force enhancing script
 */
var globalDropTwice = 0;
var globalStars = 0;
var globalHighestStar = 0;
var globalBooms = 0;
var globalTotalCost = 0;
const GLOBAL_POST_BOOM_STARS = 12;

//warning window.alert strings
const GLOBAL_ALERT_SUCCESS_STR = "Success.";
const GLOBAL_ALERT_FAIL_STR = "Fail.";
const GLOBAL_ALERT_DESTROY_STR = "Item has been destroyed.";
const GLOBAL_ALERT_DROP_STR = "Star count decreased by 1.";

//html element, class, and id names
const DISCLAIMER_DIV_NAME = "disclaimer-div"
const STATUS_RATES_DIV_NAME = "status-div";
const SAFEGUARD_DIV_NAME = "safeguard-div";
const MESOS_AMT_DIV_NAME = "mesos-amt-div";
const SAFEGUARD_INPUT_NAME = "safeguardCheckBox";
const HIGHEST_STAR_TD_NAME = "highest-star-record-td";
const BOOMS_RECORD_TD_NAME = "booms-record-td";
const ITEM_LEVEL_TD_NAME = "item-level-td";
const TOTAL_COST_TD_NAME = "total-cost-td";
const ITEM_IMG_NAME = "item-img";

//messages and other texts
const WARNING_IMG = `<img src="../images/warning-symbol.png" id="warning-img" alt="caution-logo" />`;
const MESOS_ARE_USED_DISCLAIMER_STR = `<span class="golden-yellow-text">MESOS</span> ARE USED TO ENHANCE EQUIPEMENT.`;
const DROP_FAIL_DISCLAIMER_STR = `${WARNING_IMG} THE <span class="golden-yellow-text">ENHANCEMENT LEVEL</span> WILL BE <span class="golden-yellow-text">REDUCED</span> UPON FAILURE.`;
const DROP_DESTROY_DISCLAIMER_STR = `${WARNING_IMG} EQUIPMENT CAN BE <span class="golden-yellow-text">DESTROYED</span> OR <span class="golden-yellow-text">LOSE LEVELS</span> UPON FAILURE.`;
const DESTROY_DISCLAIMER_STR = `${WARNING_IMG} THE EQUIPMENT WILL BE <span class="golden-yellow-text">DESTROYED</span> UPON FAILURE.`;
const CHANCE_TIME_DISCLAIMER_STR = `<span id="chance-time-disclaimer">CHANCE TIME !!</span>`;
const NEWLINE_HTML = '<br />'

//json file directory
const REQ_URL_STAR_RATES = "https://raw.githubusercontent.com/Jato521/ms_star_force_simulation/master/json/star_rates.json";
const REQ_URL_ITEMS = "https://raw.githubusercontent.com/Jato521/ms_star_force_simulation/master/json/items_characteristics.json";

//takes in an integer as argument and return that after rounding to nearest hundreds
function roundToNearestHundreds(integer) {
    integer = Math.round(parseInt(integer) / 100) * 100;
    return integer;
}

//takes item level and star as parameters; returns the cost of the item
function getEnhancementCost(level, star) {
    var cost = 0;

    if (star < 10) {
        cost += 1000 + Math.pow(level, 3) * (star + 1) / 25;
    }
    else if (star < 15) {
        cost += 1000 + Math.pow(level, 3) * Math.pow((star + 1), 2.7) / 400;
    }
    else if (star < 18) {
        cost += 1000 + Math.pow(level, 3) * Math.pow((star + 1), 2.7) / 120;
    }
    else if (star < 20) {
        cost += 1000 + Math.pow(level, 3) * Math.pow((star + 1), 2.7) / 110;
    }
    else {
        cost += 1000 + Math.pow(level, 3) * Math.pow((star + 1), 2.7) / 100;
    }

    //For 12 > 13 to 16 > 17, you can pay double the cost to remove the chance of destruction.
    var isSgChecked = checkSafeguard();
    if (isSgChecked && (star >= 12 && star <= 16) && globalDropTwice < 2) {
        cost *= 2;
        cost = roundToNearestHundreds(cost);
    }
    else {
        cost = roundToNearestHundreds(cost);
    }

    return cost;
}

//this function is ran on page load
function startUp() {
    let request = new XMLHttpRequest();
    request.open("GET", REQ_URL_ITEMS, true);
    request.send();
    request.onload = function () {
        var allItems = request.response;
        allItems = JSON.parse(allItems);

        var startItem = allItems.breath_of_divinity;
        document.getElementsByClassName(ITEM_IMG_NAME)[0].src = startItem.imgLocation;

        var enhanceCost = getEnhancementCost(startItem.level, globalStars);
        document.getElementById(MESOS_AMT_DIV_NAME).innerHTML = enhanceCost.toLocaleString();

        document.getElementById(ITEM_LEVEL_TD_NAME).innerHTML = startItem.level;
    }

    let request2 = new XMLHttpRequest();
    request2.open("GET", REQ_URL_STAR_RATES, true);
    request2.send();
    request2.onload = function () {
        var allStarResponse = request2.response;
        allStarResponse = JSON.parse(allStarResponse);
        allStarResponse = allStarResponse.allStars;

        const zero = allStarResponse[0].zeroSuccFailBoomRate;
        printNextStatRateAndDisclaimer(globalStars, zero);
    }

    document.getElementById(DISCLAIMER_DIV_NAME).innerHTML = MESOS_ARE_USED_DISCLAIMER_STR;
}

//returns a random int between 1 and 1000, inclusive of 1 and 1000
function getRandomInt() {
    var randomNum = Math.floor((Math.random() * 1000 + 1));
    return randomNum;
}

//returns 1 pass, 2 fail, 3 boom
function getEnhancementResults(ratesArray) {
    var chanceSuccess;
    var chanceFailure;
    var chanceBoom;

    //not chance time, not 100%
    if (globalDropTwice < 2) {
        chanceSuccess = ratesArray[0];
        chanceFailure = ratesArray[1];
        chanceBoom = ratesArray[2];
    }
    //chance time, 100%
    else {
        chanceSuccess = 1000;
        chanceFailure = 0;
        chanceBoom = 0;
        globalDropTwice = 0;
    }

    var rate = getRandomInt();

    //success, go to next star
    if (rate <= chanceSuccess) {
        return 1;
    }
    //failed enhancement, but not destroyed
    else if (rate > chanceSuccess && (rate <= (chanceSuccess + chanceFailure))) {
        return 2;
    }
    //boom: rate > chanceSuccess + chanceFailure
    else {
        return 3;
    }
}

//increments the boom counts inside the boom count div
function printBoomsRecord() {
    document.getElementById(BOOMS_RECORD_TD_NAME).innerHTML = ++globalBooms;
}

//boom and reset item to 12 stars; returns the post booms stars and prints the enhance chance after the boom
function getPostBoomStar() {
    printBoomsRecord();
    let request = new XMLHttpRequest();
    request.open("GET", REQ_URL_STAR_RATES, true);
    request.send();

    request.onload = function () {
        var allStarResponse = request.response;
        allStarResponse = JSON.parse(allStarResponse);
        allStarResponse = allStarResponse.allStars;
        var twelve = allStarResponse[12].twelveSuccFailBoomRate;
        printNextStatRateAndDisclaimer(GLOBAL_POST_BOOM_STARS, twelve);
    }
    return GLOBAL_POST_BOOM_STARS;
}

//takes in the current star count and the rates for current star; outputs next star statistics and print in notes in disclaimer-div
function printNextStatRateAndDisclaimer(currentStar, ratesArray) {
    var nextSuccess = ratesArray[0] / 10;
    var nextFail = ratesArray[1] / 10;
    var nextBoom = ratesArray[2] / 10;
    var isSafeguardChecked = checkSafeguard();

    //status rates div strings
    const CURRENT_NEXT_STAR = `${currentStar} Star > ${currentStar + 1} Star`;
    const SUCCESS_CHANCE = `Success Chance: ${nextSuccess}%`;
    const KEEP_CHANCE = `Failure (Keep) Chance: ${nextFail}%`;
    const DROP_CHANCE = `Failure (Drop) Chance: ${nextFail}%`;
    const BOOM_CHANCE = `Boom Chance: ${nextBoom}%`;

    const CURR_NEXT_SUCCESS_CHANCE = CURRENT_NEXT_STAR + NEWLINE_HTML + SUCCESS_CHANCE + NEWLINE_HTML;

    if (nextSuccess == 100) {
        document.getElementById(STATUS_RATES_DIV_NAME).innerHTML = CURR_NEXT_SUCCESS_CHANCE;
    }
    else {
        //less than or equal to 10: no drop and no boom
        if (currentStar <= 10) {
            document.getElementById(DISCLAIMER_DIV_NAME).innerHTML = MESOS_ARE_USED_DISCLAIMER_STR.toString();
            document.getElementById(STATUS_RATES_DIV_NAME).innerHTML = CURR_NEXT_SUCCESS_CHANCE + KEEP_CHANCE;
        }
        //equal to 11: drop, but no boom
        else if (currentStar == 11) {
            document.getElementById(DISCLAIMER_DIV_NAME).innerHTML = DROP_FAIL_DISCLAIMER_STR.toString();
            document.getElementById(STATUS_RATES_DIV_NAME).innerHTML = CURR_NEXT_SUCCESS_CHANCE + DROP_CHANCE;
        }
        //greater than 11 and not 15 and not 20 and less than 25: drop and boom
        else if (currentStar > 11 && currentStar != 15 && currentStar != 20 && currentStar < 25) {
            if (isSafeguardChecked && currentStar < 17) {
                document.getElementById(DISCLAIMER_DIV_NAME).innerHTML = DROP_FAIL_DISCLAIMER_STR.toString();
            }
            else {
                document.getElementById(DISCLAIMER_DIV_NAME).innerHTML = DROP_DESTROY_DISCLAIMER_STR.toString();
            }
            document.getElementById(STATUS_RATES_DIV_NAME).innerHTML = CURR_NEXT_SUCCESS_CHANCE + DROP_CHANCE + NEWLINE_HTML + BOOM_CHANCE;
        }
        //equal to 15 or 20: boom, but no drop
        else if (currentStar == 15 || currentStar == 20) {
            if (isSafeguardChecked) {
                document.getElementById(DISCLAIMER_DIV_NAME).innerHTML = MESOS_ARE_USED_DISCLAIMER_STR.toString();
            }
            else {
                document.getElementById(DISCLAIMER_DIV_NAME).innerHTML = DESTROY_DISCLAIMER_STR.toString();
            }
            document.getElementById(STATUS_RATES_DIV_NAME).innerHTML = CURR_NEXT_SUCCESS_CHANCE + KEEP_CHANCE + NEWLINE_HTML + BOOM_CHANCE;
        }
    }
}

//returns true if safeguard is checked; false otherwise
function checkSafeguard() {
    var checkbox = document.getElementById(SAFEGUARD_INPUT_NAME.toString());

    if (checkbox != null && checkbox.checked) {
        return true;
    }
    else {
        return false;
    }
}

//takes in the current star count as argument and manages html safeguard box availability
function manageSafeguardDiv(star) {
    //safeguard disabled for less than 12 stars and greater than 16 stars, also disabled for chance time
    if ((star < 12 || star > 16) || globalDropTwice == 2) {
        document.getElementById(SAFEGUARD_INPUT_NAME).disabled = true;
        document.getElementById(SAFEGUARD_INPUT_NAME).checked = false;
    }
    //safeguard available for other stars
    else {
        document.getElementById(SAFEGUARD_INPUT_NAME).disabled = false;
    }
}

//takes in the star amount and an array of stars as argument; prints failure ; returns star count after failure
function printFailure(star, array) {
    //drop, no boom
    if (star > 10 && star != 15 && star != 20) {
        globalDropTwice++;
        star--;
        window.alert(GLOBAL_ALERT_DROP_STR);

        //chance time for 2 consecutive drops in star
        if (globalDropTwice == 2) {
            var chanceTimeRatesArr = [1000, 0, 0];
            document.getElementById(DISCLAIMER_DIV_NAME).innerHTML = CHANCE_TIME_DISCLAIMER_STR.toString();
            printNextStatRateAndDisclaimer(star, chanceTimeRatesArr);
        }
        //print previous star success chances due to a drop in stars
        else {
            printNextStatRateAndDisclaimer(star, array[star]);
        }
    }
    return star;
}

//takes in star count as argument; sets the highest star record
function printHighestStarRecord(star) {
    if (star > globalHighestStar) {
        globalHighestStar = star;
        document.getElementById(HIGHEST_STAR_TD_NAME).innerHTML = globalHighestStar;
    }
}

//takes in item level and star count; sets mesos amount in div for enhance
function printMesosCost(level, star) {
    var cost = getEnhancementCost(level, star);
    document.getElementById(MESOS_AMT_DIV_NAME).innerHTML = cost.toLocaleString();
}

//takes in a cost as argument; display the total cost as each enhancement happens
function printTotalCost(cost) {
    globalTotalCost += cost;
    document.getElementById(TOTAL_COST_TD_NAME).innerHTML = globalTotalCost.toLocaleString();
}

//takes in star count and array of all stars as argument; displays the result and return star count
function displayResults(star, allArray) {
    var currentArray = allArray[star];
    if (star != 24) {
        var nextArray = allArray[star + 1];
    }

    var itemLevel = parseInt(document.getElementById(ITEM_LEVEL_TD_NAME).textContent);
    var currentCost = getEnhancementCost(itemLevel, star)

    var enhanceResult = getEnhancementResults(currentArray);

    //success, increment and display next star
    if (enhanceResult == 1 && star != 24) {
        window.alert(GLOBAL_ALERT_SUCCESS_STR);
        star++;
        printNextStatRateAndDisclaimer(star, nextArray);
        globalDropTwice = 0;
    }

    //failure
    else if (enhanceResult == 2) {
        window.alert(GLOBAL_ALERT_FAIL_STR);
        star = printFailure(star, allArray);
    }

    //boom else if (enhanceResult == 3)
    else {
        var isSgChecked = checkSafeguard();

        //if safeguard on, fail. otherwise, boom.
        if (isSgChecked) {
            window.alert(GLOBAL_ALERT_FAIL_STR);
            star = printFailure(star, allArray);
        }
        else {
            window.alert(GLOBAL_ALERT_DESTROY_STR);
            star = getPostBoomStar();
            globalDropTwice = 0;
        }
    }

    //print total cost after current enhancement
    printTotalCost(currentCost);

    //print the new mesos cost required for next enhancement
    printMesosCost(itemLevel, star);

    return star;
}

//reads JSON rates begins enhancement from 0 to 24
function beginStarForce() {
    let request = new XMLHttpRequest();
    request.open("GET", REQ_URL_STAR_RATES, true);
    request.send();

    request.onload = function () {
        var allStarResponse = request.response;
        allStarResponse = JSON.parse(allStarResponse);
        allStarResponse = allStarResponse.allStars;

        //maintain star levels
        const ZERO = allStarResponse[0].zeroSuccFailBoomRate;
        const ONE = allStarResponse[1].oneSuccFailBoomRate;
        const TWO = allStarResponse[2].twoSuccFailBoomRate;
        const THREE = allStarResponse[3].threeSuccFailBoomRate;
        const FOUR = allStarResponse[4].fourSuccFailBoomRate;
        const FIVE = allStarResponse[5].fiveSuccFailBoomRate;
        const SIX = allStarResponse[6].sixSuccFailBoomRate;
        const SEVEN = allStarResponse[7].sevenSuccFailBoomRate;
        const EIGHT = allStarResponse[8].eightSuccFailBoomRate;
        const NINE = allStarResponse[9].nineSuccFailBoomRate;
        const TEN = allStarResponse[10].tenSuccFailBoomRate;
        //drop star levels
        const ELEVEN = allStarResponse[11].elevenSuccFailBoomRate;
        //boom star levels
        const TWELVE = allStarResponse[12].twelveSuccFailBoomRate;
        const THIRTEEN = allStarResponse[13].thirteenSuccFailBoomRate;
        const FOURTEEN = allStarResponse[14].fourteenSuccFailBoomRate;
        //maintain star levels
        const FIFTEEN = allStarResponse[15].fifteenSuccFailBoomRate;
        //boom star levels
        const SIXTEEN = allStarResponse[16].sixteenSuccFailBoomRate;
        const SEVENTEEN = allStarResponse[17].seventeenSuccFailBoomRate;
        const EIGHTEEN = allStarResponse[18].eighteenSuccFailBoomRate;
        const NINETEEN = allStarResponse[19].nineteenSuccFailBoomRate;
        //stay star levels
        const TWENTY = allStarResponse[20].twentySuccFailBoomRate;
        //boom star levels
        const TWENTYONE = allStarResponse[21].twentyoneSuccFailBoomRate;
        const TWENTYTWO = allStarResponse[22].twentytwoSuccFailBoomRate;
        const TWNETYTHREE = allStarResponse[23].twentythreeSuccFailBoomRate;
        const TWENTYFOUR = allStarResponse[24].twentyfourSuccFailBoomRate;

        const ALL_STARS = [ZERO, ONE, TWO, THREE, FOUR, FIVE, SIX, SEVEN,
            EIGHT, NINE, TEN, ELEVEN, TWELVE, THIRTEEN, FOURTEEN, FIFTEEN, SIXTEEN,
            SEVENTEEN, EIGHTEEN, NINETEEN, TWENTY, TWENTYONE, TWENTYTWO, TWNETYTHREE, TWENTYFOUR];

        switch (globalStars) {
            case 0:
                globalStars = displayResults(globalStars, ALL_STARS);
                break;
            case 1:
                globalStars = displayResults(globalStars, ALL_STARS);
                break;
            case 2:
                globalStars = displayResults(globalStars, ALL_STARS);
                break;
            case 3:
                globalStars = displayResults(globalStars, ALL_STARS);
                break;
            case 4:
                globalStars = displayResults(globalStars, ALL_STARS);
                break;
            case 5:
                globalStars = displayResults(globalStars, ALL_STARS);
                break;
            case 6:
                globalStars = displayResults(globalStars, ALL_STARS);
                break;
            case 7:
                globalStars = displayResults(globalStars, ALL_STARS);
                break;
            case 8:
                globalStars = displayResults(globalStars, ALL_STARS);
                break;
            case 9:
                globalStars = displayResults(globalStars, ALL_STARS);
                break;
            case 10:
                globalStars = displayResults(globalStars, ALL_STARS);
                break;
            case 11:
                globalStars = displayResults(globalStars, ALL_STARS);
                break;
            case 12:
                globalStars = displayResults(globalStars, ALL_STARS);
                break;
            case 13:
                globalStars = displayResults(globalStars, ALL_STARS);
                break;
            case 14:
                globalStars = displayResults(globalStars, ALL_STARS);
                break;
            case 15:
                globalStars = displayResults(globalStars, ALL_STARS);
                break;
            case 16:
                globalStars = displayResults(globalStars, ALL_STARS);
                break;
            case 17:
                globalStars = displayResults(globalStars, ALL_STARS);
                break;
            case 18:
                globalStars = displayResults(globalStars, ALL_STARS);
                break;
            case 19:
                globalStars = displayResults(globalStars, ALL_STARS);
                break;
            case 20:
                globalStars = displayResults(globalStars, ALL_STARS);
                break;
            case 21:
                globalStars = displayResults(globalStars, ALL_STARS);
                break;
            case 22:
                globalStars = displayResults(globalStars, ALL_STARS);
                break;
            case 23:
                globalStars = displayResults(globalStars, ALL_STARS);
                break;
            case 24:
                globalStars = displayResults(globalStars, ALL_STARS);
                break;
            default:
                ;
        }
        //check if highest star. replace if so
        printHighestStarRecord(globalStars);

        //check if safeguard can be used for next enhancement
        manageSafeguardDiv(globalStars);

        return globalStars;
    }
}

//entry point for enhance button
function mainEnhance() {
    beginStarForce();
}

//change disclaimer based on safeguard input checking and unchecking
function changeDisclaimerSG() {
    var isSgChecked = document.getElementById(SAFEGUARD_INPUT_NAME).checked;

    //checking at 12-14, 16 star, inclusive: no destroy
    if (isSgChecked && ((globalStars >= 12 && globalStars <= 14) || globalStars == 16)) {
        document.getElementById(DISCLAIMER_DIV_NAME).innerHTML = DROP_FAIL_DISCLAIMER_STR.toString();
    }
    //checking at 15 star: mesos are used...
    else if (isSgChecked && (globalStars == 15)) {
        document.getElementById(DISCLAIMER_DIV_NAME).innerHTML = MESOS_ARE_USED_DISCLAIMER_STR.toString();
    }
    //unchecking at 12-14, 16 star, inclusive: destroy/drop
    else if (!isSgChecked && ((globalStars >= 12 && globalStars <= 14) || globalStars == 16)) {
        document.getElementById(DISCLAIMER_DIV_NAME).innerHTML = DROP_DESTROY_DISCLAIMER_STR.toString();
    }
    //unchecking at 15 star: destroy
    else if (!isSgChecked && (globalStars == 15)) {
        document.getElementById(DISCLAIMER_DIV_NAME).innerHTML = DESTROY_DISCLAIMER_STR.toString();
    }
}

//changing mesos cost based on safeguard input checking and unchecking
function changeMesosCostSG() {
    var level = parseInt(document.getElementById(ITEM_LEVEL_TD_NAME).innerText);
    var cost = getEnhancementCost(level, globalStars);
    document.getElementById(MESOS_AMT_DIV_NAME).innerText = cost.toLocaleString();
}

/*
 * change item script
 */
//takes in an item name as argument; resets progress upon changing item
function resetProgress(itemName) {
    var confirmStr = "Changing an item will reset all your progress. Are you sure you want to proceed?"
    var isConfirmReset = window.confirm(confirmStr);

    if (isConfirmReset == true) {
        //reset disclaimer
        document.getElementById(DISCLAIMER_DIV_NAME).innerHTML = MESOS_ARE_USED_DISCLAIMER_STR.toString();

        //reset status div and chance time
        globalStars = 0;
        globalDropTwice = 0;
        let request = new XMLHttpRequest();
        request.open("GET", REQ_URL_STAR_RATES, true);
        request.send();

        request.onload = function () {
            var allStarResponse = request.response;
            allStarResponse = JSON.parse(allStarResponse);
            allStarResponse = allStarResponse.allStars;

            //maintain star levels
            const ZERO = allStarResponse[0].zeroSuccFailBoomRate;
            printNextStatRateAndDisclaimer(globalStars, ZERO);
        }

        //reset system status div
        globalHighestStar = 0;
        document.getElementById(HIGHEST_STAR_TD_NAME).innerHTML = globalHighestStar;
        globalBooms = 0;
        document.getElementById(BOOMS_RECORD_TD_NAME).innerHTML = globalBooms;
        globalTotalCost = 0;
        document.getElementById(TOTAL_COST_TD_NAME).innerHTML = globalTotalCost;

        //reset safeguard checkbox
        manageSafeguardDiv(globalStars);

        //change image
        changeItem(itemName);
    }
}

//takes in an item name; change an item to another one
function changeItem(newItemName) {
    const NO_ITEM_MSG = "No item found. Contact support.";

    let request = new XMLHttpRequest();
    request.open("GET", REQ_URL_ITEMS, true);
    request.send();

    request.onload = function () {
        var allItems = request.response;
        allItems = JSON.parse(allItems);

        switch (newItemName) {
            //lv150 items
            case "breath_of_divinity":
                document.getElementsByClassName(ITEM_IMG_NAME)[0].src = allItems.breath_of_divinity.imgLocation;
                document.getElementById(ITEM_LEVEL_TD_NAME).innerHTML = allItems.breath_of_divinity.level;
                document.getElementById(MESOS_AMT_DIV_NAME).innerHTML = getEnhancementCost(allItems.breath_of_divinity.level, globalStars).toLocaleString();
            case "royal_warrior_helm":
                document.getElementsByClassName(ITEM_IMG_NAME)[0].src = allItems.royal_warrior_helm.imgLocation;
                document.getElementById(ITEM_LEVEL_TD_NAME).innerHTML = allItems.royal_warrior_helm.level;
                document.getElementById(MESOS_AMT_DIV_NAME).innerHTML = getEnhancementCost(allItems.royal_warrior_helm.level, globalStars).toLocaleString();
                break;
            case "eagle_eye_warrior_armor":
                document.getElementsByClassName(ITEM_IMG_NAME)[0].src = allItems.eagle_eye_warrior_armor.imgLocation;
                document.getElementById(ITEM_LEVEL_TD_NAME).innerHTML = allItems.eagle_eye_warrior_armor.level;
                document.getElementById(MESOS_AMT_DIV_NAME).innerHTML = getEnhancementCost(allItems.eagle_eye_warrior_armor.level, globalStars).toLocaleString();
                break;
            case "trixter_warrior_pants":
                document.getElementsByClassName(ITEM_IMG_NAME)[0].src = allItems.trixter_warrior_pants.imgLocation;
                document.getElementById(ITEM_LEVEL_TD_NAME).innerHTML = allItems.trixter_warrior_pants.level;
                document.getElementById(MESOS_AMT_DIV_NAME).innerHTML = getEnhancementCost(allItems.trixter_warrior_pants.level, globalStars).toLocaleString();
                break;
            case "superior_engraved_gollux_belt":
                document.getElementsByClassName(ITEM_IMG_NAME)[0].src = allItems.superior_engraved_gollux_belt.imgLocation;
                document.getElementById(ITEM_LEVEL_TD_NAME).innerHTML = allItems.superior_engraved_gollux_belt.level;
                document.getElementById(MESOS_AMT_DIV_NAME).innerHTML = getEnhancementCost(allItems.superior_engraved_gollux_belt.level, globalStars).toLocaleString();
                break;
            case "superior_engraved_gollux_pendant":
                document.getElementsByClassName(ITEM_IMG_NAME)[0].src = allItems.superior_engraved_gollux_pendant.imgLocation;
                document.getElementById(ITEM_LEVEL_TD_NAME).innerHTML = allItems.superior_engraved_gollux_pendant.level;
                document.getElementById(MESOS_AMT_DIV_NAME).innerHTML = getEnhancementCost(allItems.superior_engraved_gollux_pendant.level, globalStars).toLocaleString();
                break;
            case "superior_gollux_earring":
                document.getElementsByClassName(ITEM_IMG_NAME)[0].src = allItems.superior_gollux_earring.imgLocation;
                document.getElementById(ITEM_LEVEL_TD_NAME).innerHTML = allItems.superior_gollux_earring.level;
                document.getElementById(MESOS_AMT_DIV_NAME).innerHTML = getEnhancementCost(allItems.superior_gollux_earring.level, globalStars).toLocaleString();
                break;
            case "superior_gollux_ring":
                document.getElementsByClassName(ITEM_IMG_NAME)[0].src = allItems.superior_gollux_ring.imgLocation;
                document.getElementById(ITEM_LEVEL_TD_NAME).innerHTML = allItems.superior_gollux_ring.level;
                document.getElementById(MESOS_AMT_DIV_NAME).innerHTML = getEnhancementCost(allItems.superior_gollux_ring.level, globalStars).toLocaleString();
                break;
            //lv200 items
            case "arcane_umbra_knight_hat":
                document.getElementsByClassName(ITEM_IMG_NAME)[0].src = allItems.arcane_umbra_knight_hat.imgLocation;
                document.getElementById(ITEM_LEVEL_TD_NAME).innerHTML = allItems.arcane_umbra_knight_hat.level;
                document.getElementById(MESOS_AMT_DIV_NAME).innerHTML = getEnhancementCost(allItems.arcane_umbra_knight_hat.level, globalStars).toLocaleString();
                break;
            case "arcane_umbra_knight_shoulder":
                document.getElementsByClassName(ITEM_IMG_NAME)[0].src = allItems.arcane_umbra_knight_shoulder.imgLocation;
                document.getElementById(ITEM_LEVEL_TD_NAME).innerHTML = allItems.arcane_umbra_knight_shoulder.level;
                document.getElementById(MESOS_AMT_DIV_NAME).innerHTML = getEnhancementCost(allItems.arcane_umbra_knight_shoulder.level, globalStars).toLocaleString();
                break;
            case "arcane_umbra_knight_overall":
                document.getElementsByClassName(ITEM_IMG_NAME)[0].src = allItems.arcane_umbra_knight_overall.imgLocation;
                document.getElementById(ITEM_LEVEL_TD_NAME).innerHTML = allItems.arcane_umbra_knight_overall.level;
                document.getElementById(MESOS_AMT_DIV_NAME).innerHTML = getEnhancementCost(allItems.arcane_umbra_knight_overall.level, globalStars).toLocaleString();
                break;
            case "arcane_umbra_knight_shoe":
                document.getElementsByClassName(ITEM_IMG_NAME)[0].src = allItems.arcane_umbra_knight_shoe.imgLocation;
                document.getElementById(ITEM_LEVEL_TD_NAME).innerHTML = allItems.arcane_umbra_knight_shoe.level;
                document.getElementById(MESOS_AMT_DIV_NAME).innerHTML = getEnhancementCost(allItems.arcane_umbra_knight_shoe.level, globalStars).toLocaleString();
                break;
            case "arcane_umbra_knight_cape":
                document.getElementsByClassName(ITEM_IMG_NAME)[0].src = allItems.arcane_umbra_knight_cape.imgLocation;
                document.getElementById(ITEM_LEVEL_TD_NAME).innerHTML = allItems.arcane_umbra_knight_cape.level;
                document.getElementById(MESOS_AMT_DIV_NAME).innerHTML = getEnhancementCost(allItems.arcane_umbra_knight_cape.level, globalStars).toLocaleString();
                break;
            case "arcane_umbra_knight_glove":
                document.getElementsByClassName(ITEM_IMG_NAME)[0].src = allItems.arcane_umbra_knight_glove.imgLocation;
                document.getElementById(ITEM_LEVEL_TD_NAME).innerHTML = allItems.arcane_umbra_knight_glove.level;
                document.getElementById(MESOS_AMT_DIV_NAME).innerHTML = getEnhancementCost(allItems.arcane_umbra_knight_glove.level, globalStars).toLocaleString();
                break;
            default:
                console.log(NO_ITEM_MSG)
                break;
        }
    }
}