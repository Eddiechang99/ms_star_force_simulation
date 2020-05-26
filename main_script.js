//disabled: might be a future feature? array of image strings from 0 star to 25 star
//var imageNameArray = ["../images/0star.png", "../images/1star.png", "../images/2star.png", "../images/3star.png", "../images/4star.png",
//     "../images/5star.png", "../images/6star.png", "../images/7star.png", "../images/8star.png", "../images/9star.png", "../images/10star.png",
//     "../images/11star.png", "../images/12star.png", "../images/13star.png", "../images/14star.png", "../images/15star.png",
//     "../images/16star.png", "../images/17star.png", "../images/18star.png", "../images/19star.png", "../images/20star.png",
//     "../images/21star.png", "../images/22star.png", "../images/23star.png", "../images/24star.png", "../images/25star.png"];

/*
 * star force enhancing script
 */
//maintain star levels
var zero = [950, 50, 0];
var one = [900, 100, 0];
var two = [850, 150, 0];
var three = [850, 150, 0];
var four = [800, 200, 0];
var five = [750, 250, 0];
var six = [700, 300, 0];
var seven = [650, 350, 0];
var eight = [600, 400, 0];
var nine = [550, 450, 0];
var ten = [500, 500, 0];
//drop star levels
var eleven = [450, 550, 0];
//boom star levels
var twelve = [400, 594, 6];
var thirteen = [350, 637, 13];
var fourteen = [300, 686, 14];
//maintain star levels
var fifteen = [300, 679, 21];
//boom star levels
var sixteen = [300, 679, 21];
var seventeen = [300, 679, 21];
var eighteen = [300, 672, 28];
var nineteen = [300, 672, 28];
//stay star levels
var twenty = [300, 630, 70];
//boom star levels
var twentyone = [300, 630, 70];
var twentytwo = [30, 776, 194];
var twentythree = [20, 686, 294];
var twentyfour = [10, 594, 396];

var allStars = [zero, one, two, three, four, five, six, seven,
    eight, nine, ten, eleven, twelve, thirteen, fourteen, fifteen, sixteen,
    seventeen, eighteen, nineteen, twenty, twentyone, twentytwo, twentythree, twentyfour];

var dropTwice = 0;
var stars = 0;
var highestStar = 0;
var booms = 0;

var succString = "Success.";
var failString = "Fail.";
var destroyedString = "Item has been destroyed.";
var starCountMinus1String = "Star count decreased by 1.";

/*html names*/
var disclaimerDivName = "disclaimer-div"
var statusRatesDivName = "status-div";
var safeguardDivName = "safeguard-div";
var safeguardCheckboxInputName = "safeguardCheckBox";
var highestStarSpanName = "highest-star-record-span";
var boomsRecordSpanName = "booms-record-span";

/*messages and other texts*/
var warningImage = `<img src="../images/warning-symbol.png" id="warning-img" alt="caution-logo" />`;
var mesosAreUsedToEnhanceString = `<span class="golden-yellow-text">MESOS</span> ARE USED TO ENHANCE EQUIPEMENT.`;
var dropFailString = `${warningImage} THE <span class="golden-yellow-text">ENHANCEMENT LEVEL</span> WILL BE <span class="golden-yellow-text">REDUCED</span> UPON FAILURE.`;
var dropDestroyFailString = `${warningImage} EQUIPMENT CAN BE <span class="golden-yellow-text">DESTROYED</span> OR <span class="golden-yellow-text">LOSE LEVELS</span> UPON FAILURE.`;
var destroyString = `${warningImage} THE EQUIPMENT WILL BE <span class="golden-yellow-text">DESTROYED</span> UPON FAILURE.`;
var chanceTimeMessage = `<span id="chance-time-disclaimer">CHANCE TIME !!</span>`;
var safeguardNotAvailMsg = "<div><b><i>Safeguard not available for items with more than 17*</i></b><div>";
var safeguardBoxChecked = `<div>SAFEGUARD</div><input checked type="checkbox" id='${safeguardCheckboxInputName.toString()}' name="safeguard" value="1" onclick="changeDisclaimerSG()"/>`
var safeguardBoxUnchecked = `<div>SAFEGUARD</div><input type="checkbox" id='${safeguardCheckboxInputName.toString()}' name="safeguard" value="0" onclick="changeDisclaimerSG()" />`;

//returns a random int between 1 and 1000, inclusive of 1 and 1000
function getRandomInt() {
    var randomNum = Math.floor((Math.random() * 1000 + 1));
    return randomNum;
}

//returns 1 pass, 2 fail, 3 boom
function getEnhancementResults(chanceArray) {
    var chanceSuccess;
    var chanceFailure;
    var chanceBoom;

    if (dropTwice < 2) {
        chanceSuccess = chanceArray[0];
        chanceFailure = chanceArray[1];
        chanceBoom = chanceArray[2];
    }
    else {
        chanceSuccess = 1000;
        chanceFailure = 0;
        chanceBoom = 0;
        dropTwice = 0;
    }

    var rate = getRandomInt();

    //success, go to next star
    if (rate <= chanceSuccess) {
        window.alert(succString);
        return 1;
    }
    //failed enhancement, but not destroyed
    else if (rate > chanceSuccess && (rate <= (chanceSuccess + chanceFailure))) {
        window.alert(failString);
        return 2;
    }
    //boom: rate > chanceSuccess + chanceFailure
    else {
        window.alert(destroyedString);
        return 3;
    }
}

function printBoomsRecord() {
    document.getElementById(boomsRecordSpanName.toString()).innerHTML = ++booms;
}

//boom and reset item to 12 stars
function boom() {
    postBoomStars = 12;
    printBoomsRecord();
    document.getElementById(statusRatesDivName.toString()).innerHTML = `${postBoomStars} Star > ${postBoomStars + 1} Star<br/>Success Chance: ${twelve[0] / 10}%<br />Failure(Stay): ${twelve[1] / 10}%<br />Boom Chance: ${twelve[2] / 10}%`;
    return postBoomStars;
}

//outputs next star statistics and print in notes in disclaimer-div
function outputNext(currentStar, chanceArray) {
    var nextSuccess = chanceArray[0] / 10;
    var nextFail = chanceArray[1] / 10;
    var nextBoom = chanceArray[2] / 10;
    var isSafeguardChecked = checkSafeguard();

    //less than or equal to 10: no drop and no boom
    if (currentStar <= 10) {
        document.getElementById(disclaimerDivName.toString()).innerHTML = mesosAreUsedToEnhanceString.toString();
        document.getElementById(statusRatesDivName.toString()).innerHTML = `${currentStar} Star > ${currentStar + 1} Star<br/>Success Chance: ${nextSuccess}%<br />Failure (Keep): ${nextFail}%`;
    }

    //equal to 11: drop, but no boom
    if (currentStar == 11) {
        document.getElementById(disclaimerDivName.toString()).innerHTML = dropFailString.toString();
        document.getElementById(statusRatesDivName.toString()).innerHTML =
            `${currentStar} Star > ${currentStar + 1} Star<br/>Success Chance: ${nextSuccess}%<br />Failure (Drop): ${nextFail}%`;
    }

    //greater than 11 and not 15 and not 20 and less than 25: drop and boom
    if (currentStar > 11 && currentStar != 15 && currentStar != 20 && currentStar < 25) {
        if (isSafeguardChecked && currentStar < 17) {
            document.getElementById(disclaimerDivName.toString()).innerHTML = dropFailString.toString();
        }
        else {
            document.getElementById(disclaimerDivName.toString()).innerHTML = dropDestroyFailString.toString();
        }

        document.getElementById(statusRatesDivName.toString()).innerHTML =
            `${currentStar} Star > ${currentStar + 1} Star<br/>Success Chance: ${nextSuccess}%<br />Failure (Drop): ${nextFail}%<br />Boom Chance: ${nextBoom}%`;
    }

    //equal to 15 or 20: boom, but no drop
    if (currentStar == 15 || currentStar == 20) {
        if (isSafeguardChecked) {
            document.getElementById(disclaimerDivName.toString()).innerHTML = mesosAreUsedToEnhanceString.toString();
        }
        else {
            document.getElementById(disclaimerDivName.toString()).innerHTML = destroyString.toString();
        }

        document.getElementById(statusRatesDivName.toString()).innerHTML =
            `${currentStar} Star > ${currentStar + 1} Star<br/>Success Chance: ${nextSuccess}%<br />Failure (Keep): ${nextFail}% <br />Boom Chance: ${nextBoom}%`;
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

    //is safeguard box checked: if so, continue checking
    else if (isSafeguardChecked) {
        document.getElementById(safeguardDivName.toString()).innerHTML = safeguardBoxChecked.toString();
    }

    //new checkbox
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
            document.getElementById(disclaimerDivName.toString()).innerHTML = chanceTimeMessage.toString();
            document.getElementById(statusRatesDivName.toString()).innerHTML = `${star} Star > ${star + 1} Star<br/>Success Chance: 100%`;
        }
        else {
            //print previous star success chances due to a drop in stars
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
    if (starCount != 0) {
        var previousArray = allArray[starCount - 1];
    }
    if (starCount != 24) {
        var nextArray = allArray[starCount + 1];
    }

    var enhanceResult = getEnhancementResults(currentArray);

    //success, increment and display next star
    if (enhanceResult == 1 && starCount != 24) {
        starCount++;
        outputNext(starCount, nextArray);
        dropTwice = 0;
    }

    //failure
    else if (enhanceResult == 2) {
        starCount = printFailure(starCount, allStars);
    }

    //boom else if (enhanceResult == 3)
    else {
        boolSG = checkSafeguard();

        //if safeguard on, fail
        if (boolSG) {
            starCount = printFailure(starCount, allStars);
        }
        else {
            starCount = boom();
            dropTwice = 0;
        }
    }

    //highest star?
    printHighestStarRecord(starCount);

    //check if safeguard can be used for next enhancement
    manageSafeguardDiv(starCount);

    return starCount;
}

//switch from 0 to 24
function starForce() {
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
    return stars;
}

function mainEnhance() {
    starForce();
    //window.alert(stars);
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
    var arcaneHatLink = "../images/arcane_hat.jpg";
    var arcaneShoulderLink = "../images/arcane_shoulder.jpg";
    var arcaneOverallLink = "../images/arcane_overall.jpg";
    var arcaneShoeLink = "../images/arcane_shoe.jpg";
    var arcaneCapeLink = "../images/arcane_cape.jpg";
    var arcaneGloveLink = "../images/arcane_glove.jpg";

    var noItemMessage = "No item found. Contact support.";

    switch (newItemName) {
        case "hat":
            document.getElementsByClassName("item-img")[0].src = arcaneHatLink.toString();
            break;
        case "shoulder":
            document.getElementsByClassName("item-img")[0].src = arcaneShoulderLink.toString();
            break;
        case "overall":
            document.getElementsByClassName("item-img")[0].src = arcaneOverallLink.toString();
            break;
        case "shoe":
            document.getElementsByClassName("item-img")[0].src = arcaneShoeLink.toString();
            break;
        case "cape":
            document.getElementsByClassName("item-img")[0].src = arcaneCapeLink.toString();
            break;
        case "glove":
            document.getElementsByClassName("item-img")[0].src = arcaneGloveLink.toString();
            break;
        default:
            console.log(noItemMessage.toString())
            break;
    }
}

//resetting upon changing item
function resetProgress(itemName) {
    var confirmString = "Changing an item will reset all your progress. Are you sure you want to reload?"
    var confirmReset = window.confirm(confirmString.toString());

    if (confirmReset == true) {
        //change image
        changeImage(itemName);

        //reset disclaimer
        document.getElementById(disclaimerDivName.toString()).innerHTML = mesosAreUsedToEnhanceString.toString();

        //reset status div and chance time
        stars = 0;
        dropTwice = 0;
        outputNext(0, zero);

        //reset system status div
        highestStar = 0;
        document.getElementById(highestStarSpanName.toString()).innerHTML = highestStar;
        booms = 0;
        document.getElementById(boomsRecordSpanName.toString()).innerHTML = booms;
    }
}