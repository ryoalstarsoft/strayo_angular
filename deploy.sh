npm install -g @angular/cli
yarn install
git submodule add -f https://$site_user:$site_pass@strayossite.scm.azurewebsites.net/strayossite.git build
rm -rf build/*
ng build --env=prod
cp -r dist/* build/
cd build/
git config --global user.email "sahil@strayos.com"
git config --global user.name "Sahil Kataria"
git add -A .
git commit -a -m "Deployment"
git push -f origin master