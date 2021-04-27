(function () {
    let current = location.pathname.split('/')[1];
    if (current === "") return;
    let menuItems = document.querySelectorAll('.fsdp-side-menu');
    for (let i = 0, len = menuItems.length; i < len; i++) {
        if (menuItems[i].getAttribute("href").indexOf(current) !== -1) {
            menuItems[i].classList.replace("fsdp-side-menu", "usa-current");
        }
    }
})();