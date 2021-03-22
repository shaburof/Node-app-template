async function request({ endpoint, data, type }) {
    let csrf = getCsft();
    if (!isValidCsrf(csrf) || !isValidEndpoint(endpoint)) throw new Error('endpoint or csrf is missing');
    try {
        let result = await fetchRequest({ endpoint, data, type, csrf });
        errorHandler(result);

        return result;
    } catch (error) {
        console.log('error: ', error);
        throw new Error(error);
    }
}

function fetchRequest({ endpoint, data, type, csrf }) {
    return new Promise((resolve, reject) => {
        let defaultType = 'POST';
        fetch(endpoint, {
            method: type || defaultType,
            mode: 'cors',
            headers: getHeaders({ csrf }),
            body: data && JSON.stringify(data)
        }).then(async response => {
            let result = await response.json();
            if (result.status === false || response.ok) resolve(result);
            else throw new Error(response.status + ' ' + response.statusText);
        })
            .catch(error => reject(error));
    });
}

function getHeaders({ csrf }) {
    return {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        csrf: csrf,
    }
}

function getCsft() {
    return [...document.getElementsByTagName('meta')].find(element => element.name === 'csrf').content;
}

function isValidCsrf(csrf) {
    return csrf ? true : false;
}

function isValidEndpoint(endpoint) {
    return endpoint ? true : false;
}

function errorHandler(result) {
    if (!result.status && result.redirectTo) {
        window.location.replace(result.redirectTo);
    } else if (!result.status) throw new Error('request fatch result: false');
}