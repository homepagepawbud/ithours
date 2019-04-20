(function () {
    ithours_client = {};
    document.currentScript = document.currentScript || (function () {
        var scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    })();

    base_url = document.currentScript.getAttribute("api-url");
    if (!base_url) alert('please provide url');
    crud_base = "api/crud/";

    client_settings = {
        "async": true,
        "crossDomain": true,
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
            "cache-control": "no-cache",
        },
        "processData": false,
    };

    finalAPICall = function (data, methodurl, callback) {
        var settings = Object.assign({}, client_settings);
        settings.data = JSON.stringify(data)
        settings.url = base_url + methodurl;
        $.ajax(settings).done(function (response) {
            callback(response);
        });
    }

    ithours_client.get = function (modelName, findQuery, populatePath, operatorId) {
        if (!modelName) alert('Please provide modelName')
        var data = {
            modelName: modelName,
        }
        if (findQuery) data.findQuery = findQuery || {};
        if (populatePath) data.path = populatePath || "";
        if (operatorId) data.operatorId = operatorId;

        return new Promise(function (resolve, reject) {
            this.finalAPICall(data, crud_base + "GET", function (apiresponse) {
                if (apiresponse)
                    resolve({ isapisuccess: true, apidata: apiresponse });
                else
                    resolve({ isapisuccess: false, apidata: null });
            });
        });
    }

    ithours_client.delete = function (modelName, findQuery) {
        if (!modelName) alert('Please provide modelName')
        var data = {
            modelName: modelName,
        }
        if (findQuery) data.id = findQuery.id;

        return new Promise(function (resolve, reject) {
            this.finalAPICall(data, crud_base + "DELETE", function (apiresponse) {
                if (apiresponse)
                    resolve({ isapisuccess: true, apidata: apiresponse });
                else
                    resolve({ isapisuccess: false, apidata: null });
            });
        });
    },


    ithours_client.getOne = function (modelName, findQuery, populatePath) {
        if (!modelName) alert('Please provide modelName')
        var data = {
            modelName: modelName,
        }
        if (findQuery) data.findQuery = findQuery;
        if (populatePath) data.path = populatePath;

        return new Promise(function (resolve, reject) {
            this.finalAPICall(data, crud_base + "GETONE", function (apiresponse) {
                if (apiresponse)
                    resolve({ isapisuccess: true, apidata: apiresponse });
                else
                    resolve({ isapisuccess: false, apidata: null });
            });
        });
    }

    ithours_client.add = function (modelName, data,operatorId) {
        if (!modelName) alert('Please provide modelName')
        var data = data
        data.modelName = modelName
        data.operatorId = operatorId;
        return new Promise(function (resolve, reject) {
            this.finalAPICall(data, crud_base + "ADD", function (apiresponse) {
                if (apiresponse)
                    resolve({ isapisuccess: true, apidata: apiresponse });
                else
                    resolve({ isapisuccess: false, apidata: null });
            });
        });
    },
   
    ithours_client.update = function (modelName, findQuery, updateQuery, operatorId) {
        if (!modelName) alert('Please provide modelName')

        var data = {
            modelName: modelName,
        }
        if (findQuery) data.findQuery = findQuery;
        if (updateQuery) data.updateQuery = updateQuery;
        if (operatorId) data.operatorId = operatorId;

        return new Promise(function (resolve, reject) {
            this.finalAPICall(data, crud_base + "UPDATE", function (apiresponse) {
                if (apiresponse)
                    resolve({ isapisuccess: true, apidata: apiresponse });
                else
                    resolve({ isapisuccess: false, apidata: null });
            });
        });
    },
        ithours_client.shared = function (prcId, methodId, data) {
            var toSend = {
                PRCID: prcId,
                Method: methodId,
                Data: data
            };
            return new Promise(function (resolve, reject) {
                this.finalAPICall(toSend, base_url + "api/shared", function (apiresponse) {
                    if (apiresponse)
                        resolve({ isapisuccess: true, apidata: apiresponse });
                    else
                        resolve({ isapisuccess: false, apidata: null });
                });
            });
        },

        ithours_client.execute_by_url = function (url,data) {
            return new Promise(function (resolve, reject) {
                this.finalAPICall(data, url, function (apiresponse) {
                    if (apiresponse)
                        resolve({ isapisuccess: true, apidata: apiresponse });
                    else
                        resolve({ isapisuccess: false, apidata: null });
                })
            })
        }
})();