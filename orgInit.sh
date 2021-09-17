# Get env variables
# source .env
# Optional headless SFDX Hub Auth
#  sfdx auth:jwt:grant --username=$HUBUSER --jwtkeyfile=certificates/server.key --clientid=$CONSUMER_KEY
# Create scratch org
sfdx force:org:create -s -f config/project-scratch-def.json -a functions_recipes 
# Deploy function before Apex; Apex can run typesafety check that function exists
#
# Auth to functions space (headless)
# sfdx login:functions:jwt --username=$HUBUSER --keyfile=certificates/server.key --clientid=$CONSUMER_KEY
# Create compute environment
sfdx env:create:compute -o functions_recipes -a fn_recipes
# Deploy function(s)
sf deploy functions --connected-org  functions_recipes
# Deploy code
sfdx force:source:push -f 
# Enable default user app access
sfdx force:user:permset:assign -n FunctionsRecipes 
# Open the org
sfdx force:org:open -p "/lightning/n/Functions" 