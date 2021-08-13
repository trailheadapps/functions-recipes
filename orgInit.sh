# Get env variables
# source .env
# SFDX Hub Auth
#  sfdx auth:jwt:grant --username=$HUBUSER --jwtkeyfile=certificates/server.key --clientid=$CONSUMER_KEY
# Create scratch org
sfdx force:org:create -s -f config/project-scratch-def.json -a functions_recipes 
# Deploy code
sfdx force:source:push -f -u functions_recipes
# Enable default user app access
sfdx force:user:permset:assign -n FunctionsRecipes -u functions_recipes
# Auth to functions space (needs to be headless)
#  sfdx login:functions:jwt --username testuser@mycompany.org --keyfile file.key --clientid 123456
# sfdx login:functions:jwt --username=$HUBUSER --keyfile=certificates/server.key --clientid=$CONSUMER_KEY
# Create compute environment
sfdx env:create:compute -o functions_recipes -a fn_recipes
# Deploy function(s)
sfdx project:deploy:functions -o functions_recipes
# Open the org
sfdx force:org:open -p "/lightning/n/Functions" -u functions_recipes