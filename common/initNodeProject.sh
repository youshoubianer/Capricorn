mkdir projectName

cd projectName

npm init -y 

git init -y

mkdir bin

mkdir src

mkdir src/common

mkdir src/controllers

mkdir src/server

mkdir src/routes

mkdir src/middlewares

mkdir src/test

touch .gitignore

touch index.js

cp index.js ./src/server

cp index.js ./src/routes

cd bin

touch load_global.js load_schemas.js load_controllers.js run_migrations.js

cd ../src/common

touch config.example.js config.js db.js util.js

cd ..


