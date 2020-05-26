var arcaneHatLink = "../images/arcane_hat.jpg";
var arcaneShoulderLink = "../images/arcane_shoulder.jpg";
var arcaneOverallLink = "../images/arcane_overall.jpg";
var arcaneShoeLink = "../images/arcane_shoe.jpg";
var arcaneCapeLink = "../images/arcane_cape.jpg";
var arcaneGloveLink = "../images/arcane_glove.jpg";

var noItemMessage = "No item found. Contact support.";

function changeImage(newItemName) {
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