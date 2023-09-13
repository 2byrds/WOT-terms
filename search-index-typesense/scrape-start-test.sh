export INDEX_OVERVIEW_FILE="docs/02_overview/indexed-in-KERISSE.md"

source ./search-index-typesense/logger.sh

#########################
# PREPARING
#########################

# Get the directory where the main.sh script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Prepare file system.
source "$SCRIPT_DIR/prepare_file_system.sh"
# echo "Preparing file system finished" | tee -a search-index-typesense/logs/success.log
setLogFile "success.log"
log "Preparing file system finished"


# Copy handmade stuff.
source "$SCRIPT_DIR/copy_manual_files.sh"
# echo "Copying manual files finished" | tee -a search-index-typesense/logs/success.log
setLogFile "success.log"
log "Copying manual files finished"


# Create sitemaps.
source "$SCRIPT_DIR/create_sitemaps-test.sh"
# echo "Creating sitemaps finished" | tee -a search-index-typesense/logs/success.log
setLogFile "success.log"
log "Creating sitemaps finished"

# Remove unwanted urls from the sitemaps (new sitemaps generated or not)
node "$SCRIPT_DIR/removeURLsFromSitemap.mjs"
# echo "Extracting data finished" | tee -a search-index-typesense/logs/success.log
setLogFile "success.log"
log "Extracting data finished"


# Filenames to lowercase.
node "$SCRIPT_DIR/renameFilesToLowerCase.mjs" search-index-typesense/sitemaps
# echo "Renaming files to lowercase finished" | tee -a search-index-typesense/logs/success.log
setLogFile "success.log"
log "Renaming files to lowercase finished"



#########################
# START SCRAPING
#########################

# Scrape the websites.
node "$SCRIPT_DIR/extractData-test.mjs"
# echo "Extracting data finished" | tee -a search-index-typesense/logs/success.log
setLogFile "success.log"
log "Extracting data finished"

# Split the content.jsonl file into multiple files so the size is optimal for Typesense.
node "$SCRIPT_DIR/splitContentJSONL.mjs"
# echo "Splitting content finished" | tee -a search-index-typesense/logs/success.log
setLogFile "success.log"
log "Splitting content finished"

# Sort and style the index file.
node "$SCRIPT_DIR/sortAndStyleScrapedIndex.mjs" "$INDEX_OVERVIEW_FILE"
# echo "Sorting and styling index file finished" | tee -a search-index-typesense/logs/success.log
setLogFile "success.log"
log "Sorting and styling index file finished"

# Export the data from Typesense to the downloads dir.
source "$SCRIPT_DIR/export.sh"
# echo "Exporting data finished" | tee -a search-index-typesense/logs/success.log
setLogFile "success.log"
log "Exporting data finished"

# Backup output (scrape results, handmade stuff, sitemaps etc).
source "$SCRIPT_DIR/backup.sh"
# echo "Backup finished" | tee -a search-index-typesense/logs/success.log
setLogFile "success.log"
log "Backup finished"


#########################
# CONNECTING TO TYPESENSE CLOUD Open Source Search
#########################

# # Make collection in Typesense empty.
# source "$SCRIPT_DIR/make_collection_empty.sh"
## echo "Making collection empty finished" | tee -a search-index-typesense/logs/success.log
# setLogFile "success.log"
# log "Making collection empty finished"

# # Import the data into Typesense.
# source "$SCRIPT_DIR/import.sh"
## echo "Importing data finished" | tee -a search-index-typesense/logs/success.log
# setLogFile "success.log"
# log "Importing data finished"

# # Import overrides into Typesense.
# source "$SCRIPT_DIR/overrides.sh"
## echo "Importing overrides finished" | tee -a search-index-typesense/logs/success.log
# setLogFile "success.log"
# log "Importing overrides finished"