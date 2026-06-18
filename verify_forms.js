const fs = require('fs');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

async function verifyForms() {
    const db = await open({ filename: 'database.sqlite', driver: sqlite3.Database });
    const viewsDir = path.join(__dirname, 'public', 'admin', 'views');
    const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.html'));

    console.log("Starting Form Verification...\n");

    for (const file of files) {
        const html = fs.readFileSync(path.join(viewsDir, file), 'utf8');
        const forms = html.match(/<form[^>]+data-table="([^"]+)"[^>]*>([\s\S]*?)<\/form>/gi) || [];
        
        for (const formStr of forms) {
            const tableMatch = formStr.match(/data-table="([^"]+)"/);
            if (!tableMatch) continue;
            const table = tableMatch[1];

            // Get columns for this table
            let columns = [];
            try {
                const tableInfo = await db.all(`PRAGMA table_info(${table})`);
                columns = tableInfo.map(c => c.name);
            } catch (e) {
                console.log(`[!] Error getting schema for ${table} in ${file}: ${e.message}`);
                continue;
            }

            // Get all input names
            const inputs = new Set();
            const inputMatches = formStr.match(/<(?:input|select|textarea)[^>]+name="([^"]+)"/gi) || [];
            for (const inputStr of inputMatches) {
                const nameMatch = inputStr.match(/name="([^"]+)"/);
                if (nameMatch) {
                    let name = nameMatch[1];
                    if (!name.startsWith('form') && name !== 'id') {
                        if (name.endsWith('[]')) name = name.slice(0, -2);
                        inputs.add(name);
                    }
                }
            }

            // Compare
            const invalidInputs = [];
            for (const input of inputs) {
                if (!columns.includes(input) && table !== 'tbl_product') {
                    invalidInputs.push(input);
                }
            }

            if (invalidInputs.length > 0) {
                console.log(`[X] ${file} (${table}) has invalid inputs: ${invalidInputs.join(', ')}`);
            }
        }
    }
}

verifyForms().then(() => console.log("\nDone verification."));
