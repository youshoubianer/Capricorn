'use strict';
const fs = require('fs');
const path = require('path');

function read_file(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, data) => {
            if (err) {
                return reject(err)
            }
            return resolve(data.toString('utf8'))
        })
    })
}

function write_file(filename, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, data, (err) => {
            if (err) {
                return reject(err);
            }
            return resolve();
        })
    })
}

async function read_rules(category, rule_set, rule_files) {
    let rules = '';
    rule_files.map(file => {
        if (file.length > 0) {
            let filename = path.join([
                'extensions',
                category.trim().toLowerCase(),
                rule_set.trim().toLowerCase(),
                `${file.toLowerCase().trim()}.conf`,
            ])
            try {
                let fileContent = await read_file(filename);
                let firstUpperCase = str => str.replace(/\b(\w)(\w*)/g, ($0, $1, $2) => $1.toUpperCase() + $2.toLowerCase())
                rules += `\n// ${firstUpperCase(file)}\n${fileContent}\n`;
            } catch (error) {
                console.log(`Error occurs while reading ${filename}`);
            }
        }
    })
}

async function main() {
    let cfg_file_path = 'Customize.example.json';
    if (fs.existsSync('Customize.json')) {
        cfg_file_path = 'Customize.json'
    }
    let cfg = require(cfg_file_path);
    let data;

    // 节点信息
    if (cgf.config.node.length >= 2) {
        data = data.replace(/\[Proxy\][\s\S]+?\[Rule\]/, `${cfg.config.node.join('\n')}\n[Rule]`)
    }

    //  规则信息
    cfg['config']['category'].map(category => {
        Object.keys(cfg[category]).map(rule_set => {
            let rules_content = await read_rules(category, rule_set, cfg[category][rule_set])
            data = data.replace(`${category.toUpperCase()}_${rule_set.toUpperCase()}_RULES_HERE`, rules_content);
        })
    })

    await write_file('Surge_Customize.conf', data);
}

(async function () {
    try {
        console.log('Building Customize Rules...');
        await main();
        console.log('Success');
    } catch (error) {
        console.log(error);
    }
})()