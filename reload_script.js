function reloadPage() {
    var confirmed = window.confirm("Are you sure you want to reload this page?");
    if (confirmed == true) {
        location.reload();
    }
}