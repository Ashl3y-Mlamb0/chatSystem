// Helper function to read from the JSON file
function readFromFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading file:', err);
        return [];
    }
}

// Helper function to write to the JSON file
function writeToFile(filePath, doc) {
    try {
        const data = JSON.stringify(doc, null, 2);
        fs.writeFileSync(filePath, data, 'utf8');
    } catch (err) {
        console.error('Error writing file:', err);
    }
}

module.exports = { readFromFile, writeToFile }