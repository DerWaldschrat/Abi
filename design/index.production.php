<?php
define("__EXEC", true);
define("IN", "./");
define("PHP_EX", ".php");
require_once IN . "session" . PHP_EX;
$_encoding = $_SERVER['HTTP_ACCEPT_ENCODING'];
$gzip = false;
if (strpos($_encoding, "gzip") !== false) {
    $gzip = true;
}
?>
<!DOCTYPE html>
<html class="overlay">
<head>
<script>
var ROOT = window.ROOT = "%%ROOT%%"
if (location.href.indexOf(ROOT) === -1) {
    location.href = ROOT  
}
</script>
<title>Abizeitung</title>

<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="icon" href="design/favicon.ico" type="image/x-icon" />
<style type="text/css">
    @import url(design/bootstrap/css/bootstrap.css);
    @import url(design/bootstrap/css/bootstrap-responsive.css);
    @import url(design/main.css);
    @import url(print.css) print;
</style>
<script>
<?php
if (isLoggedin()) {
    require IN . "coreconfig" . PHP_EX;
    require IN . "User/fetchData" . PHP_EX;
    $user = new stdClass();
    $user = (object)$_SESSION["user"];
    fetchUserData($user);
    echo "window.__User = " . json_encode($user).";";
    if (!empty($_SERVER["QUERY_STRING"])) {
        echo "window.__startPage = '" .htmlspecialchars($_SERVER["QUERY_STRING"]) . "';";
    }
}
?>
window.WRITEMODE = <?php echo WRITEMODE === true ? "true" : "false"; ?>;
// fix console
if (!window.console) {
    window.console = {
        log: function () {}
    }
}
window.Messages = {
    loginFail: "Der Login ist fehlgeschlagen. Bitte probiere es mit einem anderen Benutzernamen oder einem anderem Passwort!",
    registrationFail: "Bei deiner Registrierung ist leider ein Fehler aufgetreten. Überprüfe bitte deine Daten und versuche es bitte noch einmal!",
    registrationSucceed: "Deine Registrierung war erfolgreich! Bitte bestätige deine Anmeldung mit einem dir per E-Mail zugesandtem Link.",
    registrationValid: "Bitte beachte, dass dein Nickname mindestens 3 Zeichen lang ist, du eine gültige E-Mail-Adresse angibts und Vor-, Nachname sowie Passwort wenigstens 2 Zeichen lang sind!",
    needAllFields: "Bitte fülle alle Felder aus!",
    nicknameNotAvailable: "Bitte wähle einen anderen Nicknamen, deiner ist schon vorhanden!",
    emailNotAvailable: "Bitte nimm eine andere E-Mail-Adresse, diese hier wird schon verwendet!",
    passwordRequestSucceed: "Eine E-Mail wurde erfolgreich an dich verschickt!",
    passwordRequestFail: "Leider konnte dir keine E-Mail zugeschickt werden! Vielleicht hast du dich mit einer anderen E-Mail-Adresse registriert? (Wenn du sie nicht mehr weißt, spreche Hauke an!)"
};
window.$loading = document.createElement("span");
$loading.className = "ajaxLoading";
$loading.textContent = " ";

window.__simpleCache = {};
window.__faster = {
    root: ROOT
};
__faster.byId = function (el) {
    return document.getElementById(el);
}
__faster.byS = function (el) {
    return document.querySelector(el);
}
// Timeout list for message clearing
__faster.mt = {};

__faster.message = function (el, name, green) {
    // Clear Timeout of last message
    __faster.mt[el] !== null && window.clearTimeout(__faster.mt[el]);
    var $message = __simpleCache[el] || (__simpleCache[el] = __faster.byId(el)), message, orig, f;
    f = function () {
        orig = $message.className;
        $message.textContent = Messages[name];
        if (green) {
            if ($message.className.indexOf("success") === -1) {
                $message.className = orig + " success";
            }
        }
        __faster.mt[el] = window.setTimeout(function () {
            __faster.mt[el] = null;
            $message.textContent = "";
            $message.className = orig;
        }, 6000);
    };
    if ($message.textContent != "") {
        window.setTimeout(f, 3000);
    } else {
        f();
    }
}
__faster.closeOverlay = function(silent) {
    var body = __faster.byS("body"),
        overlay = __faster.byS("#initialOverlay");
    __faster.byS("html").className = "";
    __faster.byId("head").className = __faster.byId("head").className.replace(" hidden", "");
    if (silent) {
        body.removeChild(overlay);
        return;
    }
    overlay.className = "closed";
}
__faster.switch_ = function() {
    if (this.className === "active") return;
    __simpleCache.screens || (__simpleCache.screens = {});
    var screen = this.id.split("-")[1],

        $wasActiveList = __simpleCache.$activeList || __faster.byS("#switchBetweenRegisterLogin li.active"),
        $wasActiveScreen = __simpleCache.$activeScreen || __faster.byS("#initialOverlay .initial"),
        $activeScreen = __simpleCache.screens[screen] || (__simpleCache.screens[screen] = __faster.byId(screen));

    __simpleCache.$activeList = this;
    __simpleCache.$activeScreen = $activeScreen;
    this.className = "active";
    $wasActiveList.className = "";
    $wasActiveScreen.className = "";
    $activeScreen.className = "initial";
    $activeScreen.querySelector(".focusfield").focus();
}

// Perform simple ajax request
/**
 * uri: The url the request is sent to
 * body: The body, will be encoded as JSON, parse null for ignoring this
 * */
__faster.request = function(uri, body, success, error, method, complete) {
    var xhr = new XMLHttpRequest() , b = body == null ? null : JSON.stringify(body);;
    xhr.open(method || "post", __faster.root + uri, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                typeof error === "function" && success(xhr);
                typeof complete === "function" && complete(xhr);
            } else {
                typeof error === "function" && error(xhr);
                typeof complete === "function" && complete(xhr);
            }
        }
    };
    // These Headers are required
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    b != null && xhr.setRequestHeader("Content-length", b.length);
    xhr.setRequestHeader("Connection", "close");
    xhr.send(b);
    return xhr;
}

__faster.clearForm = function () {
    for(var arg = arguments, i = 0, len = arg.length; i < len; i++) {
        arg[i].value = "";
    }
}
// The register function
__faster.register = function() {
    var $vorname = __faster.byId("rVorname"),
        $nachname = __faster.byId("rNachname"),
        $email = __faster.byId("rEmail"),
        $passwort = __faster.byId("rPasswort"),
        $nickname = __faster.byId("rNickname"),
        $geschlecht = __faster.byId("rGeschlecht"),
        $submit = __faster.byId("rSubmit"),

        props = {
            vorname: $vorname.value,
            nachname: $nachname.value,
            email: $email.value,
            passwort: $passwort.value,
            nickname: $nickname.value,
            geschlecht: $geschlecht.value
        }, i, $clone;
    for (i in props) {
        if (props[i] === "") {
            __faster.message("rStatus", "needAllFields");
            return;
        }
    }
    $submit.disabled = true;
    $clone = $loading.cloneNode(true);
    $submit.parentNode.appendChild($clone);
    __faster.request("User/register.php", props, function (xhr) {
        __faster.message("rStatus", "registrationSucceed", true);
        __faster.clearForm($vorname, $nachname, $email, $passwort, $nickname);

    }, function (xhr) {
        var message = "registrationFail";
        try {
            message = JSON.parse(xhr.responseText).message;
        } catch(e) {

        }
        __faster.message("rStatus", message);
    }, "post", function () {
        $submit.parentNode.removeChild($clone);
        $submit.disabled = false;
    });
}
// The login function
__faster.login = function() {
    var $nickname = __faster.byId("lNickname"),
        $passwort = __faster.byId("lPasswort"),
        $submit = __faster.byId("lSubmit"),

        props = {
            nickname: $nickname.value,
            passwort: $passwort.value
        },
        error = function (xhr) {
            __faster.byId("lSubmit").disabled = false;
            __faster.message("lStatus", "loginFail");
            $nickname.value = "";
            $passwort.value = "";
        };
    $submit.disabled = true;
    __faster.request("User/login.php", props, function (xhr) {
        try {
            window.__User = JSON.parse(xhr.responseText);
        } catch(e) {
            error(xhr);
        }
        __faster.unlockPageLoad();
    }, error);
}
// The function for the Idiots who have forgotten their password
__faster.forgot = function() {
    var $email = __faster.byId("fEmail")
    , $passwort = __faster.byId("fPasswort")

    , props = {
        email: $email.value,
        passwort: $passwort.value
    }

    __faster.request("User/forgotPassword.php", props, function () {
        __faster.message("fStatus", "passwordRequestSucceed")
    }, function () {
        $email.value = ""
        $passwort.value = ""
        __faster.message("fStatus", "passwordRequestFail")
    })
}
__faster.freeTimer = {};
__faster.lastExistsRequest = "";
__faster.checkForFree = function ($this, $parent, field) {
    if (__faster.freeTimer[field]) {
        window.clearTimeout(__faster.freeTimer[field]);
    }
    if ($this.value.length >= 3) {
        __faster.freeTimer[field] = window.setTimeout(function () {
            var $clone = $loading.cloneNode(true), val = $this.value, $submit = __faster.byId("rSubmit"),
                uri = "User/exists.php?val=" + encodeURIComponent(val) + "&field=" + encodeURIComponent(field);
            if (__faster.lastExistsRequest === uri) {
                $clone = null;
                return;
            }
            __faster.lastExistsRequest = uri;
            $parent.appendChild($clone);
            __faster.request(uri, null, function (xhr) {
                if (val === $this.value) {
                    __faster.message("rStatus", field + "NotAvailable");
                }
            }, function () {
            }, "get", function () {
                $parent.removeChild($clone);
            });
        }, 1000);
    }

}
__faster.loadCounter = 0;
__faster.unlockPageLoad = function () {
    __faster.loadCounter++;
    if (__faster.loadCounter === 2) {
        window.App =  Abi.App.init(); // Init app
    }
}
if(window.__User && window.__User.loggedin && window.__User.loggedin === true) {
    __faster.unlockPageLoad();
}
</script>
</head>

<body id='body'>
<div id="initialOverlay">
    <!-- <div class="o-close" onclick="__faster.closeOverlay();">X</div> -->

    <ul class="nav nav-tabs" id="switchBetweenRegisterLogin">
        <li id="to-loginScreen" class="active">
            <a href="#" onclick="__faster.switch_.call(this.parentNode);return false;">Anmeldung</a>
        </li>
        <li id="to-registerScreen">
            <a href="#"  onclick="__faster.switch_.call(this.parentNode);return false;">Registrierung</a>
        </li>
        <li id="to-passwortIdiotScreen">
            <a href="#"  onclick="__faster.switch_.call(this.parentNode);return false;">Passwort vergessen?</a>
        </li>
    </ul>
    <div id="registerScreen">
        <form action="#" onsubmit="__faster.register();return false;">
            <ul class="formList">
                <li class="statusField">Bitte beachte: Alle diese Eingaben können nach der Registrierung <b>nicht</b> wieder geändert werden!</li>
                <li><label for="rNickname">Nickname (mindestens 3 Zeichen lang)</label><input type="text" name="rNickname" id="rNickname" maxlength="60" class="focusfield" onkeyup="__faster.checkForFree(this, this.parentNode, 'nickname');" onblur="__faster.checkForFree(this, this.parentNode, 'nickname');" /></li>
                <li><label for="rVorname">Vorname</label><input type="text" name="rVorname" id="rVorname" maxlength="60" /></li>
                <li><label for="rNachname">Nachname</label><input type="text" name="rNachname" id="rNachname" maxlength="60" /></li>
                <li><label for="rEmail">E-Mail-Adresse</label><input type="email" name="rEmail" id="rEmail" maxlength="60" onkeyup="__faster.checkForFree(this, this.parentNode, 'email');" onblur="__faster.checkForFree(this, this.parentNode, 'email');" /></li>
                <li><label for="rPasswort">Passwort</label><input type="password" name="rPasswort" id="rPasswort" maxlength="60" /></li>
                <li><label for="rGeschlecht">Geschlecht</label><select id="rGeschlecht">
                    <option value="male" selected="selected">männlich</option>
                    <option value="female">weiblich</option>
                </select></li>
                <li><input type="submit" value="Registrieren" id="rSubmit" class='btn' /></li>
                <li class="statusField" id="rStatus"></li>
            </ul>
        </form>
    </div>
    <div id="loginScreen" class="initial">
        <form action="#" onsubmit="__faster.login();return false;">
            <ul class="formList">
                <li><label for="lNickname">Nickname</label><input type="text" name="lNickname" id="lNickname" autofocus="autofocus" class="focusfield" /></li>
                <li><label for="lPasswort">Passwort</label><input type="password" name="lPasswort" id="lPasswort" /></li>
                <li><input type="submit" value="Einloggen" id="lSubmit" class='btn' /></li>
                <li class="statusField" id="lStatus"></li>
            </ul>
        </form>
        <script>__faster.byId("lSubmit").disabled = false;__faster.byId("rSubmit").disabled = false;</script>
    </div>

    <div id="passwortIdiotScreen">
        <form action="#" onsubmit="__faster.forgot();return false;">
            <ul class="formList">
                <li><label for="fEmail">Trage hier deine E-Mail-Adresse ein, dann erfährst du, was für einen Nickname du besitzt</label><input type="text" name="fEmail" id="fEmail" class="focusfield" /></li>
                <li><label for="fPasswort">Hier musst du ein zusätzlich ein neues (altes) Passwort eintragen, du erhälst dann einen Link zugeschickt, um es zu ändern:</label><input type="password" name="fPasswort" id="fPasswort" /></li>
                <li>Wenn du dein altes oder irgendein Passwort eingibst, kannst du den Link ignorieren, und dein altes Passwort beibehalten. Du musst jedoch in jedem Falle eines angeben!</li>
                <li><input type="submit" value="Anfrage starten" class='btn' /></li>
                <li class="statusField" id="fStatus"></li>
            </ul>
        </form>
    </div>
    <noscript><h1>Bitte aktiviere JavaScript!</h1></noscript>
</div>

<div id="wrapper">

    <div class="navbar navbar-fixed-top hidden" id="head">
        <div class="navbar-inner">
            <div class="container">
                <form action="javascript:void(0)" class="form-search">
                    <a class="brand" href="http://github.com/derwaldschrat">Abi-Zeitung</a>
                    <input type="search" id="searchPupil" class="search-query" placeholder="Suche Schüler..." />
                    <input type="button" value="Suche" class="btn" id="searchPupilStart" />
                    <input type="button" class="btn logout" onclick='App.logout()' value="Logout" />
                </form>
            </div>
        </div>
    </div>
    <div id="main" class="row-fluid">
        <div class='span3'>
            <ul id="navi" class="nav nav-list">
            </ul>
        </div>
        <div id="content" class="span9">

        </div>
    </div>

</div>
<script>
if (WRITEMODE !== true) {
    __faster.byId("body").className = "write-off"
}
</script>
<script src="steal/steal.production.js"></script>
<script>
steal.rootUrl(window.ROOT<?php echo $gzip ? "+ 'gz/'" : ""; ?>);
steal("jstree/app");
</script>
</body>
</html>