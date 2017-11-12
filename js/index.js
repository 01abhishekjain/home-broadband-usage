/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        setTimeout(function () {
            refresh();
        }, 0);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function () {
        document.addEventListener("backbutton", backButton, false);

        function backButton(e) {

            var menu1 = document.querySelector('.mdl-menu__outline.mdl-menu--bottom-right');
            var menuParent1 = menu1 && menu1.parentElement;
            var classList1 = menuParent1 && menuParent1.classList;

            var menu2 = document.querySelector('.mdl-menu.mdl-menu--top-right.mdl-js-menu.allowance-detail');
            var menuParent2 = menu2.parentElement;
            var classList2 = menuParent2.classList;

            if (classList1.contains('is-visible') || classList2.contains('is-visible')) {
                if (classList1.contains('is-visible')) classList1.remove('is-visible');
                if (classList2.contains('is-visible')) classList2.remove('is-visible');
            } else {
                navigator.app.exitApp();
            }

        }
    }
};

app.initialize();

//initialize the goodies
function initAd() {
    if (typeof AdMob != 'undefined') {
        AdMob.createBanner({
            adId: 'ca-app-pub-2599058978293139/4448015603',
            position: AdMob.AD_POSITION.BOTTOM_CENTER,
            autoShow: true
        });
        AdMob.prepareInterstitial({ adId: 'ca-app-pub-2599058978293139/4448015603', autoShow: false });
    }
}

function showInterstitialAd() {
    if (typeof AdMob != 'undefined') {
        AdMob.showInterstitial();
        AdMob.prepareInterstitial({ adId: 'ca-app-pub-2599058978293139/4448015603', autoShow: false });
    }
}


// function checkBeforeSendSource(source, status) {
//     var LS = localStorage;
//     var EXPIRY = 4 * 24 * 60 * 60 * 1000;
//     var time = new Date().getTime();


//     if (status === "failure") {
//         if (LS.failure && (time - LS.failure) < EXPIRY) return;
//         else {
//             var sendObj = '{ "source": "' + escape(source) + '", "status": "' + status + '" }';
//             sendSourceToFirebase(sendObj, status);
//         }
//     } else if (status === "success") {
//         if (LS.success && (time - LS.success) < EXPIRY) return;
//         else {
//             takeScreenshot(source, status);
//         }
//     }
// }


// function takeScreenshot(source, status) {
//     navigator.screenshot && navigator.screenshot.URI(function(error, res) {
//         if (error) {
//             var sendObj = '{ "source": "' + escape(source) + '", "status": "' + status + '" }';
//             sendSourceToFirebase(sendObj, status);
//         } else {
//             var sendObj = '{ "source": "' + escape(source) + '", "status": "' + status + '", "screen": "' + res.URI + '" }';
//             sendSourceToFirebase(sendObj, status);
//         }
//     }, 5);
// }

// function sendSourceToFirebase(obj, status) {
//     var FIREBASE_URL = "https://hot-code-push-1.firebaseio.com/airtel_logs.json";

//     var oReq = new XMLHttpRequest();
//     oReq.open("POST", FIREBASE_URL, true);
//     oReq.addEventListener("load", onload);
//     oReq.send(obj);

//     function onload() {
//         // store that we have sent error source once, so that we dont do it over and over again for the same user
//         localStorage[status] = new Date().getTime()
//     };
// }

function setCard(cardToShow) {
    var cardToHide = cardToShow === 'main-card' ? 'speed-card' : 'main-card';
    document.getElementById(cardToShow).style.display = "block";
    document.getElementById(cardToHide).style.display = "none";


    document.getElementById('refresh-btn').style.display = cardToShow === 'main-card' ? 'block' : 'none';
    document.getElementById('back-btn').style.display = cardToShow === 'main-card' ? 'none' : 'block';
}

function refresh() {
    show.setContents("loading");

    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.addEventListener("error", reqError);
    oReq.addEventListener("abort", reqError);
    oReq.open("GET", "http://122.160.230.125:8080/gbod/", true);
    // oReq.open("GET", "http://192.168.1.5:8080/testing.txt", true);
    oReq.send();
}

function reqError(evt) {
    show.setContents("error");
}

function reqListener() {
    initAd();
    show.setContents("success");

    var raw = this.responseText;


    // set parser depending on which version of smartbytes page is loaded
    var parser = raw.indexOf('No more running') > -1 ? parser_2 : parser_1;


    if (raw.indexOf("Transaction error") > -1) {
        show.setContents("error");
        return;
    }

    // convert page source to parsed DOM nodes
    var source = parser.getSource(raw);

    try {
        var data = {};

        data.quota_plan = parser.getQuotaPlan(source);
        data.quota_topUp = parser.getQuotaTopUp(source);
        data.quota_myHome = parser.getQuotaMyHome(source);
        data.quota_smartBytes = parser.getQuotaSmartbytes(source);
        data.quota_dataPack = parser.getQuotaDataPack(source);

        data.landline = parser.getLandline(source);
        // data.totalMonthly = parser.getTotalMonthly(source);
        data.totalMonthly = utility.getTotalMonthlyByAdding(data);
        data.dataRemaining = parser.getRemaining(source);
        data.daysLeft = parser.getDaysLeft(source);

        data.billCycleDate = utility.getBillCycleDate(data.daysLeft);
        data.daysElapsed = utility.getDaysElapsed(data.billCycleDate);
        data.usedPercent = utility.getUsedPercent(data.dataRemaining, data.daysElapsed, data.totalMonthly);
        data.average = utility.getAverage(data.dataRemaining, data.daysElapsed, data.totalMonthly);
        data.predictDays = utility.getPredictDays(data.dataRemaining, data.average);
        data.shouldAverage = utility.getShouldAverage(data.dataRemaining, data.daysLeft);

        anal.syncEvent("success");

    } catch (e) {
        show.setContents("error", "Oh no! <br> Looks like I did something wrong.<br>You can try again later or mail me from that button up top to get help.");

        anal.syncEvent("failure");
        // checkBeforeSendSource(raw, "failure");

        return;
    }

    show.setMode(data);
    show.setPercent(data);
    show.setBannerColor(data);
    show.setTagLine(data);
    show.setExplain(data);
    show.setExtraInfo(data);
    show.setProgressBar(data);
    show.setQuotaInfo(data);

    // setTimeout(function() {
    //     checkBeforeSendSource(raw, "success");
    // }, 500);

}

//for the new updated smartbytes page
var parser_1 = {
    getSource: function (html) {
        var el = document.createElement('html');
        el.innerHTML = html;
        return el;
    },
    getLandline: function (source) {
        var elem = source.querySelector('.Dslaccount span');
        if (!elem) return 0;
        var landline = elem.innerHTML;
        landline = landline.replace(/[^0-9]/gi, '');
        return landline;

    },
    getTotalMonthly: function (source) {
        var elem = source.querySelector('.DatablockSectionSecond h3 span');
        if (!elem) return 0;
        var number = elem.innerHTML;
        // number = number.replace(/[^0-9]/gi, '');
        number = number.toLowerCase().replace("gb", "");
        number = parseFloat(number);
        return number;
    },
    getRemaining: function (source) {
        var elem = source.querySelector('.DatablockSectionSecond h3');
        if (!elem) return 0;
        var consumed = elem.innerHTML;
        // consumed = consumed.substr(0, consumed.indexOf("GB"));
        consumed = consumed.toLowerCase().replace("gb", "");
        consumed = parseFloat(consumed);
        return consumed;
    },
    getDaysLeft: function (source) {
        var elem = source.querySelector('.DatablockSectionThird p');
        if (!elem) return 0;
        var daysLeft = elem.innerHTML;
        daysLeft = parseFloat(daysLeft);
        daysLeft++; // add today also
        return daysLeft;
    },
    getQuotaPlan: function (source) {
        var elem = source.querySelector('.planDataBox ul li:nth-child(1) span');
        if (!elem) return 0;
        var quotaPlan = elem.innerHTML;
        // quotaPlan = quotaPlan.replace(/[^0-9]/gi, '');
        quotaPlan = quotaPlan.toLowerCase().replace("gb", "");
        quotaPlan = parseFloat(quotaPlan);
        return quotaPlan;
    },
    getQuotaTopUp: function (source) {
        var elem = source.querySelector('.data-blockSectionSecond ul li:nth-child(2) span');
        if (!elem) return 0;
        var quotaTopUp = elem.innerHTML;
        // quotaTopUp = quotaTopUp.replace(/[^0-9]/gi, '');
        quotaTopUp = quotaTopUp.toLowerCase().replace("gb", "");
        quotaTopUp = parseFloat(quotaTopUp);
        return quotaTopUp;
    },
    getQuotaMyHome: function (source) {
        var elem = source.querySelector('.planDataBox ul li:nth-child(2) span');
        if (!elem) return 0;
        var quotaMyHome = elem.innerHTML;
        // quotaMyHome = quotaMyHome.replace(/[^0-9]/gi, '');
        quotaMyHome = quotaMyHome.toLowerCase().replace("gb", "");
        quotaMyHome = parseFloat(quotaMyHome);
        return quotaMyHome;
    },
    getQuotaSmartbytes: function (source) {
        var elem = source.querySelector('.planDataBox ul li:nth-child(4) span');
        if (!elem) return 0;
        var quotaSmartbytes = elem.innerHTML;
        // quotaSmartbytes = quotaSmartbytes.replace(/[^0-9]/gi, '');
        quotaSmartbytes = quotaSmartbytes.toLowerCase().replace("gb", "");
        quotaSmartbytes = parseFloat(quotaSmartbytes);
        return quotaSmartbytes;
    },
    getQuotaDataPack: function (source) {
        var elem = source.querySelector('.planDataBox ul li:nth-child(5) span');
        if (!elem) return 0;
        var quotaDataPack = elem.innerHTML;
        // quotaDataPack = quotaDataPack.replace(/[^0-9]/gi, '');
        quotaDataPack = quotaDataPack.toLowerCase().replace("gb", "");
        quotaDataPack = parseFloat(quotaDataPack);
        return quotaDataPack;
    }

};

//for the old original smartbytes page
var parser_2 = {
    getSource: function (html) {
        var el = document.createElement('html');
        el.innerHTML = html;
        return el;
    },
    getLandline: function (source) {
        var landline = source.querySelector('.clearfix .last span').innerHTML;
        landline = landline.replace(/[^0-9]/gi, '');
        return landline;

    },
    getRemaining: function (source) {
        var consumed = source.querySelector('.dashboard.clearfix.box2 span').innerHTML;
        // consumed = consumed.substr(0, consumed.indexOf("GB"));
        consumed = consumed.toLowerCase().replace("gb", "");
        consumed = parseFloat(consumed);
        return consumed;
    },
    getDaysLeft: function (source) {
        var daysLeft = source.querySelector('.dashboard.clearfix.box2 span:nth-child(3)').innerHTML;
        daysLeft = daysLeft.replace(/[^0-9]/gi, '');
        daysLeft = parseFloat(daysLeft);
        daysLeft++; // add today also
        return daysLeft;
    },
    getQuotaPlan: function (source) {
        var quotaPlan = source.querySelector('.list1 .clearfix p font span').innerHTML;
        // quotaPlan = quotaPlan.substr(0, quotaPlan.indexOf("GB"));
        quotaPlan = quotaPlan.toLowerCase().replace("gb", "");
        quotaPlan = parseFloat(quotaPlan);
        return quotaPlan;
    },
    getQuotaTopUp: function (source) {
        var quotaTopUp = source.querySelector('.list1 .clearfix p font:nth-child(3) span').innerHTML;
        // quotaTopUp = quotaTopUp.substr(0, quotaTopUp.indexOf("GB"));
        quotaTopUp = quotaTopUp.toLowerCase().replace("gb", "");
        quotaTopUp = parseFloat(quotaTopUp);
        return quotaTopUp;
    },
    getQuotaMyHome: function (source) {
        var quotaMyHome = source.querySelector('.list1 .clearfix p font:nth-child(4) span').innerHTML;
        // quotaMyHome = quotaMyHome.substr(0, quotaMyHome.indexOf("GB"));
        quotaMyHome = quotaMyHome.toLowerCase().replace("gb", "");
        quotaMyHome = parseFloat(quotaMyHome);
        return quotaMyHome;
    },
    getQuotaSmartbytes: function (source) {
        return 0;
    },
    getQuotaDataPack: function (source) {
        return 0;
    }

};

var utility = {
    getTotalMonthlyByAdding: function (data) {
        var totalMonthly = data.quota_plan + data.quota_topUp + data.quota_myHome + data.quota_smartBytes + data.quota_dataPack;
        return totalMonthly;
    },
    getBillCycleDate: function (daysLeft) {
        // var date = new Date().getDate();
        // var daysInCalendarMonth = this.daysInCalendarMonth();
        // var daysLeftInCalendarMonth = daysInCalendarMonth - date;
        // var billCycleDate = daysLeft - daysLeftInCalendarMonth;
        // return billCycleDate;

        var date = new Date().getDate();
        var daysInCalendarMonth = this.daysInCalendarMonth();
        var billCycleDate;
        if (daysLeft + date > daysInCalendarMonth) {
            var daysLeftInCalendarMonth = daysInCalendarMonth - date;
            billCycleDate = daysLeft - daysLeftInCalendarMonth;
        } else {
            billCycleDate = date + daysLeft;
        }
        return billCycleDate;

    },
    getDaysElapsed: function (billCycleDate) {
        var date = new Date().getDate();
        var daysElapsed = (date > billCycleDate) ? daysElapsed = date - billCycleDate : this.daysInPrevCalendarMonth() - billCycleDate;
        return daysElapsed;
    },
    daysInCalendarMonth: function () {
        var today = new Date();
        var year = today.getFullYear();
        var month = today.getMonth() + 1; //month is zero based

        var days = new Date(year, month, 0).getDate();
        return days;
    },
    daysInPrevCalendarMonth: function () {
        var today = new Date();
        var year = today.getFullYear();
        var month = today.getMonth(); //month is zero based

        if (today.getMonth() === 0) year--; // if in jan, then reduce the year by 1
        var days = new Date(year, month, 0).getDate();

        return days;
    },
    getAverage: function (dataRemaining, daysElapsed, totalMonthly) {
        var consumed = totalMonthly - dataRemaining;
        var average = consumed / daysElapsed;
        average = Math.round(average * 100) / 100;
        return average;
    },
    getPredictDays: function (dataRemaining, average) {
        var days = dataRemaining / average;
        days = Math.round(days);
        return days;
    },
    getShouldAverage: function (dataRemaining, daysLeft) {
        var average = dataRemaining / daysLeft;
        average = Math.round(average * 100) / 100;
        return average;
    },
    getUsedPercent: function (dataRemaining, daysElapsed, totalMonthly) {
        var consumed = totalMonthly - dataRemaining;
        var percent = consumed / totalMonthly * 100;
        percent = Math.round(percent);
        return percent;
    }
};

var show = {
    setMode: function (data) {
        this.mode = data.predictDays > data.daysLeft ? 1 : data.predictDays < data.daysLeft ? -1 : 0;
    },
    setPercent: function (data) {
        document.getElementById('i_usedPercent').innerHTML = data.usedPercent + '% used';
    },
    setBannerColor: function (data) {
        var el = document.querySelector('.demo-card-square > .mdl-card__title');
        switch (this.mode) {
            case 1:
                el.style.background = '#4CAF50';
                break;
            case -1:
                el.style.background = "#f44336";
                break;
            case 0:
                el.style.background = '#f44336';
                break;
        }
    },
    setTagLine: function (data) {
        var el = document.getElementById('i_tagLine');
        el.classList = [];
        switch (this.mode) {
            case 1:
                el.innerHTML = "It\'s all good :)";
                el.classList.add('text-green');
                break;
            case -1:
                el.innerHTML = "You\'re going too fast!"
                el.classList.add('text-red');
                break;
            case 0:
                el.innerHTML = "Walking on razor\'s edge"
                el.classList.add('text-orange');
                break;
        }
    },
    setExplain: function (data) {
        var el = document.getElementById('i_explain');
        switch (this.mode) {
            case 1:
                el.innerHTML = "If you keep consuming <span style='font-weight:bold;'>" + data.average + "GB</span> per day, the high speed data will run for the entire bill cycle.<br><br>What\'s more? You can go as high as <span style='font-weight:bold;'>" + data.shouldAverage + "GB</span> per day and you still won't run out of high speed data before your data refreshes."
                break;
            case -1:
                el.innerHTML = "If you keep consuming <span style='font-weight:bold;'>" + data.average + "GB per day</span>, you\'ll run out of high speed data in the next <span style='font-weight:bold;'>" + data.predictDays + "</span> days, <span style='font-weight:bold;'>" + (data.daysLeft - data.predictDays) + "</span> days before your data refreshes!<br><br>Bring your average down to <span style='font-weight:bold;'>" + data.shouldAverage + "GB per day</span>, if you wish to keep the high speed data running for the entire bill cycle.";
                break;
            case 0:
                el.innerHTML = "At the current rate of <span style='font-weight:bold;'>" + data.average + "GB</span> per day, your high speed data will barely last till the end of this bill cycle.<br><br>Don\'t increase your daily average, or you\'ll run out of high speed data earlier."
                break;
        }
    },
    setExtraInfo: function (data) {
        document.getElementById('i_landline').innerHTML = data.landline;
        document.getElementById('i_totalMonthly').innerHTML = data.totalMonthly;
        document.getElementById('i_dataRemaining').innerHTML = data.dataRemaining;
        document.getElementById('i_average').innerHTML = data.average;
        document.getElementById('i_daysLeft').innerHTML = data.daysLeft;

        document.getElementById('i_billCycleDate').innerHTML = data.billCycleDate;

    },
    setProgressBar: function (data) {
        setTimeout(function () {
            document.querySelector('#p1').MaterialProgress.setProgress(data.usedPercent);
        }, 500);
    },
    setQuotaInfo: function (data) {
        document.getElementById('i_quota_plan').innerHTML = data.quota_plan;
        document.getElementById('i_quota_topUp').innerHTML = data.quota_topUp;
        document.getElementById('i_quota_myHome').innerHTML = data.quota_myHome;
        document.getElementById('i_quota_smartBytes').innerHTML = data.quota_smartBytes;
        document.getElementById('i_quota_dataPack').innerHTML = data.quota_dataPack;
    },
    setContents: function (state, errMsg) {
        if (!errMsg) errMsg = "Couldn\'t fetch data. Please check that you are connected to a working Airtel Broadband connection.";
        var spinner = document.getElementById('main-spinner');
        var mainCard = document.getElementById('main-card');
        var mainError = document.getElementById('main-error');
        switch (state) {
            case 'loading':
                mainCard.style.display = 'none';
                spinner.style.display = 'block';
                mainError.style.display = 'none';
                break;
            case 'success':
                mainCard.style.display = 'block';
                spinner.style.display = 'none';
                mainError.style.display = 'none';
                break;
            case 'error':
                mainCard.style.display = 'none';
                spinner.style.display = 'none';
                mainError.style.display = 'flex';
                mainError.innerHTML = errMsg;
                break;
        }
    }
};


var anal = {
    btnEvent: function (btn) {
        // window.FirebasePlugin && window.FirebasePlugin.logEvent("select_content", {content_type: "button", item_id: btn});
        window.FirebasePlugin && window.FirebasePlugin.logEvent("btn_" + btn, { content_type: "btn_" + btn, item_id: "btn_" + btn });
    },
    syncEvent: function (status) {
        // window.FirebasePlugin && window.FirebasePlugin.logEvent("sync_status", {content_type: "status", item_id: status});
        window.FirebasePlugin && window.FirebasePlugin.logEvent("sync_" + status, { content_type: "sync_" + status, item_id: "sync_" + status });
    }
};






