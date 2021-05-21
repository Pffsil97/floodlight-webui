var ipaddress = $.cookie("cip");
if (ipaddress == null || ipaddress == "") window.location.href = "login.html";
var restport = $.cookie("cport");
if (restport == null || restport == "") window.location.href = "login.html";
let vipsTable;
let poolsTable;

$(document).ready(function() {
    console.log("ready");
    $("#login-modal-include").load("loginmodal.html");
    $("#vip-modal-include").load("vipmodal.html");
    $("#pool-modal-include").load("poolmodal.html");
    $("#monitor-modal-include").load("monitormodal.html");
    loadVIPS();
    loadPools();
    loadMonitors();
    startRefresh();
});

function startRefresh() {
    setTimeout(startRefresh, 15000);
    vipsTable.ajax.reload();
    poolsTable.ajax.reload();
    monitorsTable.ajax.reload();
}

$("#deleteAllVIPS").on("click", () => {
    vipsTable.rows().every(function(rowIdx, tableLoop, rowLoop) {
        var data = this.data();
        deleteVIP(data.id);
    });
});

$("#deleteAllPools").on("click", () => {
    poolsTable.rows().every(function(rowIdx, tableLoop, rowLoop) {
        var data = this.data();
        deletePool(data.id);
    });
});

$("#deleteAllMonitors").on("click", () => {
    monitorsTable.rows().every(function(rowIdx, tableLoop, rowLoop) {
        var data = this.data();
        deleteMonitor(data.id);
    });
});

function loadVIPS() {
    vipsTable = $("#tableVIPS").DataTable({
        responsive: true,
        searching: false,
        lengthChange: false,
        destroy: true,
        scrollX: true,
        paging: false,
        order: [
            [0, "asc"]
        ],
        ajax: {
            url: "http://" + ipaddress + ":" + restport + "/quantum/v1.0/vips/",
            type: "GET",
            dataSrc: "",
            async: true,
        },
        columnDefs: [{
            render: function(data, type, row) {
                return (
                    "<a class='btn btn-md btn-danger' onclick='deleteVIP(" +
                    row.id +
                    ")'>Delete</<a>"
                );
            },
            targets: 5,
        }, ],
        columns: [
            { data: "id" },
            { data: "name" },
            { data: "protocol" },
            { data: "address" },
            { data: "port" },
        ],
    });
}

function loadPools() {
    console.log("loading pooltable");
    poolsTable = $("#tablePools").DataTable({
        responsive: true,
        searching: false,
        lengthChange: false,
        destroy: true,
        scrollX: true,
        paging: false,
        order: [
            [0, "asc"]
        ],
        ajax: {
            url: "http://localhost:8080/quantum/v1.0/pools/",
            type: "GET",
            dataSrc: "",
            async: true,
        },
        columnDefs: [{
                render: function(data, type, row) {
                    return (
                        "<a class='btn btn-md btn-primary' href='members.html?id=" +
                        row.id +
                        "'>Members</<a>"
                    );
                },
                targets: 5,
            },
            {
                render: function(data, type, row) {
                    console.log(row.id);
                    return (
                        "<a class='btn btn-md btn-danger' onclick='deletePool(" +
                        row.id +
                        ")'>Delete</<a>"
                    );
                },
                targets: 6,
            },
        ],
        columns: [
            { data: "id" },
            { data: "name" },
            { data: "vipId" },
            { data: "lbMethod" },
            { data: "Timeout" },
        ],
    });
}

function loadMonitors() {
    monitorsTable = $("#tableMonitors").DataTable({
        responsive: true,
        searching: false,
        lengthChange: false,
        destroy: true,
        scrollX: true,
        paging: false,
        order: [
            [0, "asc"]
        ],
        ajax: {
            url: "http://localhost:8080/quantum/v1.0/health_monitors/",
            type: "GET",
            dataSrc: "",
            async: true,
        },
        columnDefs: [{
                render: function(data, type, row) {
                    if (
                        row.type === "TCP" &&
                        (row.status === "0" || row.status === "-1")
                    ) {
                        return (
                            "<a id='monitorstate' class='btn btn-md btn-primary' onclick='toggleMonitorState(" +
                            row.id +
                            0 +
                            row.poolId +
                            ")'>Disabled</<a>"
                        );
                    } else if (row.type === "TCP" && row.status === "1") {
                        return (
                            "<a id='monitorstate' class='btn btn-md btn-primary' onclick='toggleMonitorState(" +
                            row.id +
                            0 +
                            row.poolId +
                            ")'>Enabled</<a>"
                        );
                    } else if (
                        row.type === "ICMP" &&
                        (row.status === "0" || row.status === "-1")
                    ) {
                        return "<p>Disabled</<p>";
                    } else {
                        return "<p>Enabled</<p>";
                    }
                },
                targets: 5,
            },
            {
                render: function(data, type, row) {
                    return (
                        "<a class='btn btn-md btn-danger' onclick='deleteMonitor(" +
                        row.id +
                        ")'>Delete</<a>"
                    );
                },
                targets: 6,
            },
        ],
        columns: [
            { data: "id" },
            { data: "name" },
            { data: "address" },
            { data: "poolId" },
            { data: "type" },
        ],
    });
}

function deleteVIP(vipid) {
    $.ajax({
        type: "DELETE",
        dataType: "json",
        url: "http://" +
            ipaddress +
            ":" +
            restport +
            "/quantum/v1.0/vips/" +
            vipid +
            "/",
        success: function(data) {
            loadVIPS();

            new PNotify({
                title: "VIP " + vipid + " deleted!",
                type: "success",
                hide: true,
            });
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert(
                "Error: " +
                " " +
                jqXHR.responseText +
                " \n Status: " +
                textStatus +
                " \n Error Thrown: " +
                errorThrown
            );
        },
    });
}

function deletePool(poolid) {
    $.ajax({
        type: "DELETE",
        dataType: "json",
        url: "http://" +
            ipaddress +
            ":" +
            restport +
            "/quantum/v1.0/pools/" +
            poolid +
            "/",
        success: function(data) {
            loadPools();
            new PNotify({
                title: "Pool " + poolid + " deleted!",
                type: "success",
                hide: true,
            });
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert(
                "Error: " +
                " " +
                jqXHR.responseText +
                " \n Status: " +
                textStatus +
                " \n Error Thrown: " +
                errorThrown
            );
        },
    });
}

function deleteMonitor(monitorid) {
    $.ajax({
        type: "DELETE",
        dataType: "json",
        url: "http://" +
            ipaddress +
            ":" +
            restport +
            "/quantum/v1.0/health_monitors/" +
            monitorid +
            "/",
        success: function(data) {
            loadMonitors();

            new PNotify({
                title: "Health monitor " + monitorid + " deleted!",
                type: "success",
                hide: true,
            });
        },
        error: function(error) {
            loadMonitors();

            new PNotify({
                title: "Health monitor " + monitorid + " deleted!",
                type: "success",
                hide: true,
            });
        },
    });
}

function toggleMonitorState(id) {
    let { monitorid, poolid } = parseId(id);

    let state = $("#monitorstate").html();

    if (state.indexOf("Disabled") !== -1) {
        $.ajax({
            type: "GET",
            dataType: "json",
            url: "http://" +
                ipaddress +
                ":" +
                restport +
                "/quantum/v1.0/pools/" +
                poolid +
                "/health_monitors/" +
                monitorid +
                "/enable/",
            success: function(data) {
                loadMonitors();

                new PNotify({
                    title: "Health monitor " + monitorid + " enabled!",
                    type: "success",
                    hide: true,
                });
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert(
                    "Error: " +
                    " " +
                    jqXHR.responseText +
                    " \n Status: " +
                    textStatus +
                    " \n Error Thrown: " +
                    errorThrown
                );
            },
        });
    } else {
        $.ajax({
            type: "GET",
            dataType: "json",
            url: "http://" +
                ipaddress +
                ":" +
                restport +
                "/quantum/v1.0/pools/" +
                poolid +
                "/health_monitors/" +
                monitorid +
                "/disable/",
            success: function(data) {
                loadMonitors();

                new PNotify({
                    title: "Health monitor " + monitorid + " disabled!",
                    type: "success",
                    hide: true,
                });
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert(
                    "Error: " +
                    " " +
                    jqXHR.responseText +
                    " \n Status: " +
                    textStatus +
                    " \n Error Thrown: " +
                    errorThrown
                );
            },
        });
    }
}

function parseId(id) {
    //101
    let stringid = id.toString();

    var index = stringid.indexOf("0"); // Gets the first index where a space occours
    var monitorid = stringid.substr(0, index); // Gets the first part
    var poolid = stringid.substr(index + 1);
    console.log("monitor", monitorid);
    console.log("pool", poolid);
    return { monitorid, poolid };
}

$("#toggleAllMonitors").on("click", () => {
    let state = $("#toggleAllMonitors").html();
    if (state.indexOf("Enable ICMP Monitors") !== -1) {
        monitorsTable.rows().every(function(rowIdx, tableLoop, rowLoop) {
            var data = this.data();
            console.log(data);
            if (data.type === "ICMP") {
                $.ajax({
                    type: "GET",
                    dataType: "json",
                    url: "http://" +
                        ipaddress +
                        ":" +
                        restport +
                        "/quantum/v1.0/pools/" +
                        data.poolId +
                        "/health_monitors/" +
                        data.id +
                        "/enable/",
                    success: function(response) {
                        loadMonitors();
                        $("#toggleAllMonitors").html("Disable ICMP Monitors");
                        new PNotify({
                            title: "Health monitor " + data.id + " enabled!",
                            type: "success",
                            hide: true,
                        });
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        alert(
                            "Error: " +
                            " " +
                            jqXHR.responseText +
                            " \n Status: " +
                            textStatus +
                            " \n Error Thrown: " +
                            errorThrown
                        );
                    },
                });
            }
        });
    } else {
        monitorsTable.rows().every(function(rowIdx, tableLoop, rowLoop) {
            var data = this.data();
            if (data.type === "ICMP") {
                $.ajax({
                    type: "GET",
                    dataType: "json",
                    url: "http://" +
                        ipaddress +
                        ":" +
                        restport +
                        "/quantum/v1.0/pools/" +
                        data.poolId +
                        "/health_monitors/" +
                        data.id +
                        "/disable/",
                    success: function(response) {
                        loadMonitors();
                        $("#toggleAllMonitors").html("Enable All");
                        new PNotify({
                            title: "Health monitor " + data.id + " disabled!",
                            type: "success",
                            hide: true,
                        });
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        alert(
                            "Error: " +
                            " " +
                            jqXHR.responseText +
                            " \n Status: " +
                            textStatus +
                            " \n Error Thrown: " +
                            errorThrown
                        );
                    },
                });
            }
        });
    }
});

function toggleAllMonitors() {
    console.log("CLIIIIICK");
    monitorsTable.rows().every(function(rowIdx, tableLoop, rowLoop) {
        var data = this.data();
        if (data.type === "ICMP") {
            $.ajax({
                type: "GET",
                dataType: "json",
                url: "http://" +
                    ipaddress +
                    ":" +
                    restport +
                    "/quantum/v1.0/pools/" +
                    poolid +
                    "/health_monitors/" +
                    monitorid +
                    "/enable/",
                success: function(data) {
                    loadMonitors();

                    new PNotify({
                        title: "Health monitor " + monitorid + " disabled!",
                        type: "success",
                        hide: true,
                    });
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    alert(
                        "Error: " +
                        " " +
                        jqXHR.responseText +
                        " \n Status: " +
                        textStatus +
                        " \n Error Thrown: " +
                        errorThrown
                    );
                },
            });
        }
    });
}