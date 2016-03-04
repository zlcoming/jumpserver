/**
 * Created by liuzheng on 3/3/16.
 */
var rowHeight = 1;
var colWidth = 1;
//function WSSHClient() {
//}
//WSSHClient.prototype._generateEndpoint = function (options) {
//    console.log(options);
//    if (window.location.protocol == 'https:') {
//        var protocol = 'wss://';
//    } else {
//        var protocol = 'ws://';
//    }
//
//    var endpoint = protocol + document.URL.match(RegExp('//(.*?)/'))[1] + '/ws/terminal' + document.URL.match(/(\?.*)/);
//    return endpoint;
//};
//WSSHClient.prototype.connect = function (options) {
//    var endpoint = this._generateEndpoint(options);
//
//    if (window.WebSocket) {
//        this._connection = new WebSocket(endpoint);
//    }
//    else if (window.MozWebSocket) {
//        this._connection = MozWebSocket(endpoint);
//    }
//    else {
//        options.onError('WebSocket Not Supported');
//        return;
//    }
//
//    this._connection.onopen = function () {
//        options.onConnect();
//    };
//
//    this._connection.onmessage = function (evt) {
//        var data = JSON.parse(evt.data.toString());
//        if (data.error !== undefined) {
//            options.onError(data.error);
//        }
//        else {
//            options.onData(data.data);
//        }
//    };
//
//    this._connection.onclose = function (evt) {
//        options.onClose();
//    };
//};
//
//WSSHClient.prototype.send = function (data) {
//    this._connection.send(JSON.stringify({'data': data}));
//};


function openTerminal(options) {
    if (window.location.protocol == 'https:') {
        var protocol = 'wss://';
    } else {
        var protocol = 'ws://';
    }

    var endpoint = protocol + document.URL.match(RegExp('//(.*?)/'))[1] + '/ws/terminal' + document.URL.match(/(\?.*)/);
    var sock = new WebSocket(endpoint);
    //var client = new WSSHClient();
    var term = new Terminal({
        rows: rowHeight,
        cols: colWidth,
        useStyle: true,
        screenKeys: true
    });
    term.open();
    term.on('data', function (data) {
        sock.send(JSON.stringify({'data': data}))
    });
    $('.terminal').detach().appendTo('#term');
    term.resize(80, 24);
    term.write('Connecting...');
    sock.onopen = function () {
        // Erase our connecting message
        term.write('\r');
    };
    sock.onclose = function () {
        term.write('Connection Reset By Peer');
    };
    sock.onmessage= function (data) {
         term.write(data);
    };
    sock.onerror= function () {
        term.write('Connection Reset By Peer');
    };
    //client.connect($.extend(options, {
    //    onError: function (error) {
    //        term.write('Error: ' + error + '\r\n');
    //    },
    //    onConnect: function () {
    //        // Erase our connecting message
    //        term.write('\r');
    //    },
    //    onClose: function () {
    //        term.write('Connection Reset By Peer');
    //    },
    //    onData: function (data) {
    //        term.write(data);
    //    }
    //}));
    rowHeight = 0.0 + 1.00 * $('.terminal').height() / 24;
    colWidth = 0.0 + 1.00 * $('.terminal').width() / 80;
    return {'term': term, 'client': sock};
}

function resize() {
    $('.terminal').css('width', window.innerWidth - 25);
    console.log(window.innerWidth);
    console.log(window.innerWidth - 10);
    var rows = Math.floor(window.innerHeight / rowHeight) - 2;
    var cols = Math.floor(window.innerWidth / colWidth) - 1;

    return {rows: rows, cols: cols};
}

$(document).ready(function () {
    var options = {};

    $('#ssh').show();
    var term_client = openTerminal(options);
    console.log(rowHeight);

    window.onresize = function () {
        var geom = resize();
        console.log(geom);
        term_client.term.resize(geom.cols, geom.rows);
        term_client.client.send(JSON.stringify({'data':{'resize': {'rows': geom.rows, 'cols': geom.cols}}}));
        $('#ssh').show();
    }

});