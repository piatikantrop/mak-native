var webview = document.getElementById('webview');

var findBox = document.getElementById('find-box');
var findInput = document.getElementById('find-text');

var dialogBox = document.getElementById("dialog-box");
var dialogOk = document.getElementById("dialog-box-ok");
var dialogText = document.getElementById("dialog-box-text");
var dialogInput = document.getElementById("dialog-box-input");
var dialogCancel = document.getElementById("dialog-box-cancel");

var zoomFactor = 1.0;

window.onkeydown = function(e) {
    var modifierActive = (navigator.platform.startsWith('Mac')) ? e.metaKey : e.ctrlKey;
    var altModifierActive = (navigator.platform.startsWith('Mac')) ? e.ctrlKey : e.altKey;

    if (modifierActive && altModifierActive && e.keyCode == 'F'.charCodeAt(0)) {

        var window = chrome.app.window.current();

        if (!window.isFullscreen()) {
            window.fullscreen();
        } else {
            window.restore();
        }

        return;
    }

    if (modifierActive && e.keyCode == 'F'.charCodeAt(0)) {
        findBox.style.display = 'block';
        findInput.focus();
        findInput.select();
    }

    if (modifierActive && e.keyCode == 'L'.charCodeAt(0)) {
        copyToClipboard(webview.src, 'text/plain');
    }

    if (modifierActive && e.keyCode == 'P'.charCodeAt(0)) {
        webview.print();
    }

    if (modifierActive && e.keyCode == 187) {
        zoomFactor += 0.1;
        webview.setZoom(zoomFactor);
    }

    if (modifierActive && e.keyCode == 189) {
        zoomFactor -= 0.1;

        if (zoomFactor <= 0.2) {
            zoomFactor = 0.2;
        }

        webview.setZoom(zoomFactor);
    }

    if (modifierActive && e.keyCode == '0'.charCodeAt(0)) {
        zoomFactor = 1.0;
        webview.setZoom(zoomFactor);
    }
};

webview.addEventListener('contentload', function() {
    webview.executeScript({
        code: `window.addEventListener('keydown', function (e) {
            chrome.runtime.sendMessage({ event: 'keydown', params: { ctrlKey: e.ctrlKey, metaKey: e.metaKey, altKey: e.altKey, keyCode: e.keyCode } });
        });`
    });
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

        if (request.event === 'keydown') {
            window.onkeydown(request.params);
        }
    }
);

findInput.addEventListener('keyup', function(e) {
    webview.find(findInput.value, {
        matchCase: false
    });

    if (e.keyCode === 27) {
        webview.stopFinding();
        findBox.style.display = 'none';
    }
});

function copyToClipboard(str, mimetype) {
    document.oncopy = function(event) {
        event.clipboardData.setData(mimetype, str);
        event.preventDefault();
    };

    document.execCommand("Copy", false, null);
}

var dialogController;

dialogCancel.addEventListener('click', function() {
    dialogController.cancel();
    dialogBox.style.display = 'none';
});

dialogOk.addEventListener('click', function() {
    dialogController.ok(dialogInput.value);
    dialogBox.style.display = 'none';
});

webview.addEventListener('dialog', function(e) {
    e.preventDefault();

    var text = e.messageText;
    var dialogType = e.messageType;

    dialogController = e.dialog;
    dialogText.innerHTML = text;
    dialogInput.value = '';
    dialogInput.style.display = 'none';

    if (dialogType == 'alert') {
        dialogCancel.style.display = 'none';
    } else {
        dialogCancel.style.display = 'block';

        if (dialogType == 'prompt') {
            dialogInput.style.display = 'block';
        }
    }

    dialogBox.style.display = 'block';
});