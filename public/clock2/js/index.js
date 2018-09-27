var clock = new Vue({
    el: '#clock',
    data: {
        time: '',
        date: '',
        speed: undefined,
        lastUpdateAt: undefined,
    }
});

var week = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
var timerID = setInterval(updateTime, 1000);
updateTime();

function updateTime() {
    var cd = new Date();
    clock.time = zeroPadding(cd.getHours(), 2) + ':' + zeroPadding(cd.getMinutes(), 2) + ':' + zeroPadding(cd.getSeconds(), 2);
    clock.date = zeroPadding(cd.getFullYear(), 4) + '-' + zeroPadding(cd.getMonth() + 1, 2) + '-' + zeroPadding(cd.getDate(), 2) + ' ' + week[cd.getDay()];
};

function zeroPadding(num, digit) {
    var zero = '';
    for (var i = 0; i < digit; i++) {
        zero += '0';
    }
    return (zero + num).slice(-digit);
}

var req = undefined;
var start = undefined;
var end = undefined;

function testDone() {
    if (req.readyState === 4) {
        if (req.status === 200) {
            console.log(req.responseText);
            end = Date.now();
            var diff = end - start;
            console.log("done", diff);
            var result = (10 * 1000 / diff).toFixed(1) + 'MB/s';
            showResult(result);
        } else {
            console.log("Error");
            showResult('断开连接');
        }
    }

    if (req.readyState !== 4) {
        return;
    }

}

function showResult(result) {
    clock.speed = result;
    clock.lastUpdateAt = '最后更新时间 ' + new Date().toLocaleString();
}

function testspeed() {
    req = new XMLHttpRequest;
    start = Date.now();
    req.onreadystatechange = testDone;
    req.open('GET', '/10mb.bin' + '?' + start, true);
    req.send(null);
}

setInterval(function () {
    testspeed();
}, 20 * 1000);
