export function saveToDisk(content, fileName, contentType) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.setAttribute('href', URL.createObjectURL(file));
    a.setAttribute('download', fileName);
    a.click();
}

export function readFromDisk(fileName) {
    const data = fetch(fileName)
                   .then(response => response.json())
                   .then(json => json)
                   .catch(error => console.error(error));
    if (data) {
        return data;
    } else {
        return undefined;
    }
}

const io = {
    readFromDisk,
    saveToDisk,
}

export default io;