const fetch = require("node-fetch");
const inquirer = require("inquirer");
const clipboardy = require("clipboardy");
const chalk = require('chalk');

let lastSearchResults;

function formatGradleDependency(depencency) {
    return `
    implementation ${chalk.green('group')}: \'${depencency.groupId}\', ${chalk.green('name')}: \'${depencency.artifactId}\', ${chalk.green('version')}: \'${depencency.versions[0]}\'
`;
}
function formatGradleDependencyClipboard(depencency) {
    return `implementation group: \'${depencency.groupId}\', name: \'${depencency.artifactId}\', version: \'${depencency.versions[0]}\'`;
}

function versionSearchResponseArrived(resp) {
    const hits = JSON.parse(resp).response.docs;
    if (hits.length == 0) {
        console.log("no result");
        return;
    }
    let needle = hits[0];
    const filtered = lastSearchResults.filter(e => e.groupId === needle.g && e.artifactId === needle.a);
    if (filtered.length === 0) {
        console.warn(`could not find ${needle.groupId}:${needle.artifactId}`);
        return;
    }
    const target = filtered[0];
    hits.forEach(e => target.versions.push(e.v));
    console.log(target.versions)
}

function mvnSearchResponseArrived(resp) {
    const hits = JSON.parse(resp).response.docs;

    if (hits.length === 0) {
        console.error(`no results`)
        newSearch();
        return;
    }
    
    lastSearchResults = hits.map(val => {
        return {
            groupId: val.g,
            artifactId: val.a,
            packaging: val.p,
            versions: [val.latestVersion]
        };
    });
    
    const choices = lastSearchResults.map(result => {
        return {
            name: result.groupId + ":" + result.artifactId + ":" + result.versions[0],
            value: result
        };
        
    });
    inquirer.prompt({
        type: "list",
        name: "coordinates",
        "pageSize": 30,
        choices
    }).then(answers => {
        const ans = answers.coordinates;
        console.log(chalk.cyanBright.bold(formatGradleDependency(ans)));
        inquirer.prompt([
            {
                "type": "list",
                "name": "action",
                "choices": [
                    {
                        "name": "Copy to clipboard",
                        "value": "copyToClipboard"
                    },
                    {
                        "name": "Search older versions",
                        "value": "searchOlderVersions"
                    },
                    {
                        "name": "Start a new search",
                        "value": "newSearch"
                    },
                    {
                        "name": "quit",
                        "value": "quit"
                    }
                ]
            }
        ]).then(answers => {
            const action = answers.action;
            switch (action) {
                case "quit":
                    break;
                case "newSearch":
                    newSearch();
                    break;
                case "copyToClipboard": 
                    clipboardy.writeSync(formatGradleDependencyClipboard(ans))
                    break;
                case "searchOlderVersions":
                    fetch("https://search.maven.org/solrsearch/select?rows=100&q=g:" + ans.groupId + "+AND+a:" + ans.artifactId + "&core=gav")
                        .then(resp => resp.text())
                        .then(versionSearchResponseArrived);
                    break;
            }
        });
    });    
}

function newSearch() {
    inquirer.prompt([
        {
            "type": "input",
            "name": "search term"
        }
    ]).then(answer => startSearch(answer["search term"]));
}

function startSearch(searchTerm) {
    fetch("https://search.maven.org/solrsearch/select?rows=100&q=" + searchTerm).then(resp => resp.text())
    .then(mvnSearchResponseArrived);
}

export function search(argv) {
    if (argv.length < 3 || argv[2].trim() === "") {
    newSearch();
    } else {
        startSearch(argv[2]);
    }
}
