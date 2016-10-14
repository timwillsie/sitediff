# sitediff
logs into websites takes screenshots of secured sites and compares them to older states via image diff

## Description
This thing will log into a site, store the session cookie in a cookie file and makes screenshot of restricted urls.

\<not implemented yet:>  
Then these screenshots are compared to earlier screenshots of the same url and when there are any differences these are sent to an configured email address.

## Installation
```git clone https://github.com/timwillsie/sitediff.git```  
```npm install```

## Usage
```./node_modules/.bin/phantomjs --cookie-file=cookies.txt diff_restricted_pages.js <FULL_PATH_TO_CONF_FILE>```

## Configuration
Create a config file in ```conf.d/``` Use ```conf.d/default.json```as skeleton.