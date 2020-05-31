/*
 * star force enhancing script
 */
var dropTwice = 0;
var stars = 0;
var highestStar = 0;
var booms = 0;
const postBoomStars = 12;

const succString = "Success.";
const failString = "Fail.";
const destroyedString = "Item has been destroyed.";
const starCountMinus1String = "Star count decreased by 1.";

//json file directory
let requestURL = "https://raw.githubusercontent.com/Jato521/ms_star_force_simulation/master/json/star_rates.json";

//html element, class, and id names
const disclaimerDivName = "disclaimer-div"
const statusRatesDivName = "status-div";
const safeguardDivName = "safeguard-div";
const safeguardCheckboxInputName = "safeguardCheckBox";
const highestStarSpanName = "highest-star-record-span";
const boomsRecordSpanName = "booms-record-span";

//messages and other texts
const warningImage = `<img src="../images/warning-symbol.png" id="warning-img" alt="caution-logo" />`;
const mesosAreUsedToEnhanceString = `<span class="golden-yellow-text">MESOS</span> ARE USED TO ENHANCE EQUIPEMENT.`;
const dropFailString = `${warningImage} THE <span class="golden-yellow-text">ENHANCEMENT LEVEL</span> WILL BE <span class="golden-yellow-text">REDUCED</span> UPON FAILURE.`;
const dropDestroyFailString = `${warningImage} EQUIPMENT CAN BE <span class="golden-yellow-text">DESTROYED</span> OR <span class="golden-yellow-text">LOSE LEVELS</span> UPON FAILURE.`;
const destroyString = `${warningImage} THE EQUIPMENT WILL BE <span class="golden-yellow-text">DESTROYED</span> UPON FAILURE.`;
const chanceTimeMessage = `<span id="chance-time-disclaimer">CHANCE TIME !!</span>`;
const safeguardNotAvailMsg = "<div><b><i>Safeguard not available for items with more than 17*</i></b><div>";
const safeguardBoxChecked = `<div>SAFEGUARD</div><input checked type="checkbox" id='${safeguardCheckboxInputName.toString()}' name="safeguard" value="1" onclick="changeDisclaimerSG()"/>`
const safeguardBoxUnchecked = `<div>SAFEGUARD</div><input type="checkbox" id='${safeguardCheckboxInputName.toString()}' name="safeguard" value="0" onclick="changeDisclaimerSG()" />`;

const newLine = '<br />'

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
    if (dropTwice < 2) {
        chanceSuccess = ratesArray[0];
        chanceFailure = ratesArray[1];
        chanceBoom = ratesArray[2];
    }
    //chance time, 100%
    else {
        chanceSuccess = 1000;
        chanceFailure = 0;
        chanceBoom = 0;
        dropTwice = 0;
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

//count the booms inside the boom count div
function printBoomsRecord() {
    document.getElementById(boomsRecordSpanName.toString()).innerHTML = ++booms;
}

//boom and reset item to 12 stars
function boom() {
    printBoomsRecord();
    let request = new XMLHttpRequest();
    request.open("GET", requestURL, true);
    request.send();

    request.onload = function () {
        var allStarResponse = request.response;
        allStarResponse = JSON.parse(allStarResponse);
        allStarResponse = allStarResponse.allStars;
        const twelve = allStarResponse[12].twelveSuccFailBoomRate;
        outputNext(postBoomStars, twelve);
    }
    return postBoomStars;
}

//outputs next star statistics and print in notes in disclaimer-div
function outputNext(currentStar, ratesArray) {
    var nextSuccess = ratesArray[0] / 10;
    var nextFail = ratesArray[1] / 10;
    var nextBoom = ratesArray[2] / 10;
    var isSafeguardChecked = checkSafeguard();

    //status rates div strings
    const currentToNextStar = `${currentStar} Star > ${currentStar + 1} Star`;
    const succChance = `Success Chance: ${nextSuccess}%`;
    const failKeep = `Failure (Keep) Chance: ${nextFail}%`;
    const failDrop = `Failure (Drop) Chance: ${nextFail}%`;
    const boomChance = `Boom Chance: ${nextBoom}%`;
    const currentToNextAndSuccChance = currentToNextStar + newLine + succChance + newLine;

    if (nextSuccess == 100) {
        document.getElementById(statusRatesDivName.toString()).innerHTML = currentToNextAndSuccChance;
    }
    else {
        //less than or equal to 10: no drop and no boom
        if (currentStar <= 10) {
            document.getElementById(disclaimerDivName.toString()).innerHTML = mesosAreUsedToEnhanceString.toString();
            document.getElementById(statusRatesDivName.toString()).innerHTML = currentToNextAndSuccChance + failKeep;
        }
        //equal to 11: drop, but no boom
        else if (currentStar == 11) {
            document.getElementById(disclaimerDivName.toString()).innerHTML = dropFailString.toString();
            document.getElementById(statusRatesDivName.toString()).innerHTML = currentToNextAndSuccChance + failDrop;
        }
        //greater than 11 and not 15 and not 20 and less than 25: drop and boom
        else if (currentStar > 11 && currentStar != 15 && currentStar != 20 && currentStar < 25) {
            if (isSafeguardChecked && currentStar < 17) {
                document.getElementById(disclaimerDivName.toString()).innerHTML = dropFailString.toString();
            }
            else {
                document.getElementById(disclaimerDivName.toString()).innerHTML = dropDestroyFailString.toString();
            }
            document.getElementById(statusRatesDivName.toString()).innerHTML = currentToNextAndSuccChance + failDrop + newLine + boomChance;
        }
        //equal to 15 or 20: boom, but no drop
        else if (currentStar == 15 || currentStar == 20) {
            if (isSafeguardChecked) {
                document.getElementById(disclaimerDivName.toString()).innerHTML = mesosAreUsedToEnhanceString.toString();
            }
            else {
                document.getElementById(disclaimerDivName.toString()).innerHTML = destroyString.toString();
            }
            document.getElementById(statusRatesDivName.toString()).innerHTML = currentToNextAndSuccChance + failKeep + newLine + boomChance;
        }
    }
}
//Is safeguard checked?
function checkSafeguard() {
    var checkbox = document.getElementById(safeguardCheckboxInputName.toString());

    if (checkbox != null && checkbox.checked) {
        return true;
    }
    else {
        return false;
    }
}

//safeguard box availability
function manageSafeguardDiv(star) {
    //check if the checkmark is present in checkbox, for stars less than 17
    if (star < 17) {
        var isSafeguardChecked = checkSafeguard();
    }

    //check for 17 or more stars, no safeguard
    if (star >= 17) {
        document.getElementById(safeguardDivName.toString()).innerHTML = safeguardNotAvailMsg.toString();
    }
    //safeguard box checked: new checked checkbox
    else if (isSafeguardChecked) {
        document.getElementById(safeguardDivName.toString()).innerHTML = safeguardBoxChecked;
    }
    //not checked: new unchecked checkbox
    else {
        document.getElementById(safeguardDivName.toString()).innerHTML = safeguardBoxUnchecked;
    }
}

//failure outputs
function printFailure(star, array) {
    //drop, no boom:  11(drop twice variable increment by 1)
    if (star > 10 && star != 15 && star != 20) {
        dropTwice++;
        star--;
        window.alert(starCountMinus1String);

        //chance time for 2 consecutive drops in star
        if (dropTwice == 2) {
            var chanceTimeRatesArr = [1000, 0, 0];
            document.getElementById(disclaimerDivName.toString()).innerHTML = chanceTimeMessage.toString();
            outputNext(star, chanceTimeRatesArr);
        }
        //print previous star success chances due to a drop in stars
        else {
            outputNext(star, array[star]);
        }
    }

    return star;
}

//sets the highest star record
function printHighestStarRecord(star) {
    if (star > highestStar) {
        highestStar = star;
        document.getElementById(highestStarSpanName.toString()).innerHTML = highestStar;
    }
}

//displays the result
function results(starCount, allArray) {
    //define the current, previous, and next array chances
    var currentArray = allArray[starCount];
    if (starCount != 24) {
        var nextArray = allArray[starCount + 1];
    }

    var enhanceResult = getEnhancementResults(currentArray);

    //success, increment and display next star
    if (enhanceResult == 1 && starCount != 24) {
        window.alert(succString);
        starCount++;
        outputNext(starCount, nextArray);
        dropTwice = 0;
    }

    //failure
    else if (enhanceResult == 2) {
        window.alert(failString);
        starCount = printFailure(starCount, allArray);
    }

    //boom else if (enhanceResult == 3)
    else {
        var boolSG = checkSafeguard();

        //if safeguard on, fail. otherwise, boom.
        if (boolSG) {
            window.alert(failString);
            starCount = printFailure(starCount, allArray);
        }
        else {
            window.alert(destroyedString);
            starCount = boom();
            dropTwice = 0;
        }
    }

    return starCount;
}

//reads JSON rates begins enhancement from 0 to 24
function starForce() {
    let request = new XMLHttpRequest();
    request.open("GET", requestURL, true);
    request.send();

    request.onload = function () {
        var allStarResponse = request.response;
        allStarResponse = JSON.parse(allStarResponse);
        allStarResponse = allStarResponse.allStars;

        //maintain star levels
        const zero = allStarResponse[0].zeroSuccFailBoomRate;
        const one = allStarResponse[1].oneSuccFailBoomRate;
        const two = allStarResponse[2].twoSuccFailBoomRate;
        const three = allStarResponse[3].threeSuccFailBoomRate;
        const four = allStarResponse[4].fourSuccFailBoomRate;
        const five = allStarResponse[5].fiveSuccFailBoomRate;
        const six = allStarResponse[6].sixSuccFailBoomRate;
        const seven = allStarResponse[7].sevenSuccFailBoomRate;
        const eight = allStarResponse[8].eightSuccFailBoomRate;
        const nine = allStarResponse[9].nineSuccFailBoomRate;
        const ten = allStarResponse[10].tenSuccFailBoomRate;
        //drop star levels
        const eleven = allStarResponse[11].elevenSuccFailBoomRate;
        //boom star levels
        const twelve = allStarResponse[12].twelveSuccFailBoomRate;
        const thirteen = allStarResponse[13].thirteenSuccFailBoomRate;
        const fourteen = allStarResponse[14].fourteenSuccFailBoomRate;
        //maintain star levels
        const fifteen = allStarResponse[15].fifteenSuccFailBoomRate;
        //boom star levels
        const sixteen = allStarResponse[16].sixteenSuccFailBoomRate;
        const seventeen = allStarResponse[17].seventeenSuccFailBoomRate;
        const eighteen = allStarResponse[18].eighteenSuccFailBoomRate;
        const nineteen = allStarResponse[19].nineteenSuccFailBoomRate;
        //stay star levels
        const twenty = allStarResponse[20].twentySuccFailBoomRate;
        //boom star levels
        const twentyone = allStarResponse[21].twentyoneSuccFailBoomRate;
        const twentytwo = allStarResponse[22].twentytwoSuccFailBoomRate;
        const twentythree = allStarResponse[23].twentythreeSuccFailBoomRate;
        const twentyfour = allStarResponse[24].twentyfourSuccFailBoomRate;

        const allStars = [zero, one, two, three, four, five, six, seven,
            eight, nine, ten, eleven, twelve, thirteen, fourteen, fifteen, sixteen,
            seventeen, eighteen, nineteen, twenty, twentyone, twentytwo, twentythree, twentyfour];

        switch (stars) {
            case 0:
                stars = results(stars, allStars);
                break;
            case 1:
                stars = results(stars, allStars);
                break;
            case 2:
                stars = results(stars, allStars);
                break;
            case 3:
                stars = results(stars, allStars);
                break;
            case 4:
                stars = results(stars, allStars);
                break;
            case 5:
                stars = results(stars, allStars);
                break;
            case 6:
                stars = results(stars, allStars);
                break;
            case 7:
                stars = results(stars, allStars);
                break;
            case 8:
                stars = results(stars, allStars);
                break;
            case 9:
                stars = results(stars, allStars);
                break;
            case 10:
                stars = results(stars, allStars);
                break;
            case 11:
                stars = results(stars, allStars);
                break;
            case 12:
                stars = results(stars, allStars);
                break;
            case 13:
                stars = results(stars, allStars);
                break;
            case 14:
                stars = results(stars, allStars);
                break;
            case 15:
                stars = results(stars, allStars);
                break;
            case 16:
                stars = results(stars, allStars);
                break;
            case 17:
                stars = results(stars, allStars);
                break;
            case 18:
                stars = results(stars, allStars);
                break;
            case 19:
                stars = results(stars, allStars);
                break;
            case 20:
                stars = results(stars, allStars);
                break;
            case 21:
                stars = results(stars, allStars);
                break;
            case 22:
                stars = results(stars, allStars);
                break;
            case 23:
                stars = results(stars, allStars);
                break;
            case 24:
                stars = results(stars, allStars);
                break;
            default:
                ;
        }
        //check if highest star. replace if so
        printHighestStarRecord(stars);

        //check if safeguard can be used for next enhancement
        manageSafeguardDiv(stars);

        return stars;
    }
}

//entry point for enhance button
function mainEnhance() {
    starForce();
}

//for safeguard checking and unchecking
function changeDisclaimerSG() {
    var sgChecked = document.getElementById(safeguardCheckboxInputName.toString()).checked;

    //checking at 12-14, 16 star, inclusive: no destroy
    if (sgChecked && ((stars >= 12 && stars <= 14) || stars == 16)) {
        document.getElementById(disclaimerDivName.toString()).innerHTML = dropFailString.toString();
    }
    //checking at 15 star: mesos are used...
    else if (sgChecked && (stars == 15)) {
        document.getElementById(disclaimerDivName.toString()).innerHTML = mesosAreUsedToEnhanceString.toString();
    }
    //unchecking at 12-14, 16 star, inclusive: destroy/drop
    else if (!sgChecked && ((stars >= 12 && stars <= 14) || stars == 16)) {
        document.getElementById(disclaimerDivName.toString()).innerHTML = dropDestroyFailString.toString();
    }
    //unchecking at 15 star: destroy
    else if (!sgChecked && (stars == 15)) {
        document.getElementById(disclaimerDivName.toString()).innerHTML = destroyString.toString();
    }
}

/*
 * change item script
 */
function changeImage(newItemName) {
    const itemImageName = "item-img";
    var arcaneHatLink = "../images/lv200/arcane_umbra_knight_hat.jpg";
    var arcaneShoulderLink = "../images/lv200/arcane_umbra_knight_shoulder.jpg";
    var arcaneOverallLink = "../images/lv200/arcane_umbra_knight_overall.jpg";
    var arcaneShoeLink = "../images/lv200/arcane_umbra_knight_shoe.jpg";
    var arcaneCapeLink = "../images/lv200/arcane_umbra_knight_cape.jpg";
    var arcaneGloveLink = "../images/lv200/arcane_umbra_knight_glove.jpg";
    var royalHelmLink = "../images/lv150/royal_warrior_helm.png";
    var eagleTopLink = "../images/lv150/eagle_eye_warrior_armor.png";
    var trixterPantsLink = "../images/lv150/trixter_warrior_pants.png";
    var beltLink = "../images/lv150/superior_engraved_gollux_belt.png";
    var pendantLink = "../images/lv150/superior_engraved_gollux_pendant.png";
    var earLink = "../images/lv150/superior_gollux_earring.png";
    var ringLink = "../images/lv150/superior_gollux_ring.png";

    var noItemMessage = "No item found. Contact support.";

    switch (newItemName) {
        case "royal_warrior_helm":
            document.getElementsByClassName(itemImageName.toString())[0].src = royalHelmLink.toString();
            break;
        case "eagle_eye_warrior_armor":
            document.getElementsByClassName(itemImageName.toString())[0].src = eagleTopLink.toString();
            break;
        case "trixter_warrior_pants":
            document.getElementsByClassName(itemImageName.toString())[0].src = trixterPantsLink.toString();
            break;
        case "superior_engraved_gollux_belt":
            document.getElementsByClassName(itemImageName.toString())[0].src = beltLink.toString();
            break;
        case "superior_engraved_gollux_pendant":
            document.getElementsByClassName(itemImageName.toString())[0].src = pendantLink.toString();
            break;
        case "superior_gollux_earring":
            document.getElementsByClassName(itemImageName.toString())[0].src = earLink.toString();
            break;
        case "superior_gollux_ring":
            document.getElementsByClassName(itemImageName.toString())[0].src = ringLink.toString();
            break;
        case "arcane_umbra_knight_hat":
            document.getElementsByClassName(itemImageName.toString())[0].src = arcaneHatLink.toString();
            break;
        case "arcane_umbra_knight_shoulder":
            document.getElementsByClassName(itemImageName.toString())[0].src = arcaneShoulderLink.toString();
            break;
        case "arcane_umbra_knight_overall":
            document.getElementsByClassName(itemImageName.toString())[0].src = arcaneOverallLink.toString();
            break;
        case "arcane_umbra_knight_shoe":
            document.getElementsByClassName(itemImageName.toString())[0].src = arcaneShoeLink.toString();
            break;
        case "arcane_umbra_knight_cape":
            document.getElementsByClassName(itemImageName.toString())[0].src = arcaneCapeLink.toString();
            break;
        case "arcane_umbra_knight_glove":
            document.getElementsByClassName(itemImageName.toString())[0].src = arcaneGloveLink.toString();
            break;
        default:
            console.log(noItemMessage.toString())
            break;
    }
}

//resetting upon changing item
function resetProgress(itemName) {
    var confirmString = "Changing an item will reset all your progress. Are you sure you want to proceed?"
    var confirmReset = window.confirm(confirmString.toString());

    if (confirmReset == true) {
        //change image
        changeImage(itemName);

        //reset disclaimer
        document.getElementById(disclaimerDivName.toString()).innerHTML = mesosAreUsedToEnhanceString.toString();

        //reset status div and chance time
        stars = 0;
        dropTwice = 0;
        let request = new XMLHttpRequest();
        request.open("GET", requestURL, true);
        request.send();

        request.onload = function () {
            var allStarResponse = request.response;
            allStarResponse = JSON.parse(allStarResponse);
            allStarResponse = allStarResponse.allStars;

            //maintain star levels
            const zero = allStarResponse[0].zeroSuccFailBoomRate;
            outputNext(stars, zero);
        }

        //reset system status div
        highestStar = 0;
        document.getElementById(highestStarSpanName.toString()).innerHTML = highestStar;
        booms = 0;
        document.getElementById(boomsRecordSpanName.toString()).innerHTML = booms;
    }
}