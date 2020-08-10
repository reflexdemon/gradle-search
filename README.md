# `gradle-search` - command-line tool for searching maven central

This is a utility for developers who prefer searching maven dependencies in the command line instead of the web UI of
search.maven.org




## Installation 

Prerequisite: node `10.9.0` or newer should be installed.

```bash
npm install -g @reflexdemon/gradle-search
```

## Usage: `gradle-search <query-string>`

This will list the found artifacts with their latest version numbers. After selecting the coordinates the tool displays
the maven `<dependency>` tag to be pasted into the `pom.xml`.


### Examples:

 * `gradle-search hibernate-validator`
 * `gradle-search g:org.slf4j`
 


![Searching Maven repository](https://github.com/reflexdemon/gradle-search/raw/master/output.gif "Searching maven and viewgin by gradle dependency")