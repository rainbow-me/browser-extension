

BUILD=$1

### BOTH COMMANDS ARE IDENTICAL, EXCEPT THE SECOND ONLY UPDATES DE POLICY AND GENERATE A NEW BUILD
if [[ $BUILD == true ]]; then
    echo "Bundling with LavaMoat..."
    browserify src/scripts/background.ts -t [ babelify --presets [ @babel/preset-env @babel/preset-react ] ] -p [ tsify --noImplicitAny ] -p [ lavamoat-browserify  --autopolicy --policy './lavamoat/browserify/policy-background.json' ] > build/background.js
    browserify src/scripts/contentscript.ts -t [ babelify --presets [ @babel/preset-env @babel/preset-react ] ] -p [ tsify --noImplicitAny ] -p [ lavamoat-browserify  --autopolicy --policy './lavamoat/browserify/policy-contentscript.json' ] > build/contentscript.js
    browserify src/scripts/popup.ts -t [ babelify --presets [ @babel/preset-env @babel/preset-react ] ] -p [ tsify --noImplicitAny ] -p [ lavamoat-browserify  --autopolicy --policy './lavamoat/browserify/policy-popup.json' ] > build/popup.js
    browserify src/scripts/provider.ts -t [ babelify --presets [ @babel/preset-env @babel/preset-react ] ] -p [ tsify --noImplicitAny ] -p [ lavamoat-browserify  --autopolicy --policy './lavamoat/browserify/policy-provider.json' ] > build/provider.js
else
    echo "Updating LavaMoat policies..."
    browserify src/scripts/background.ts -t [ babelify --presets [ @babel/preset-env @babel/preset-react ] ] -p [ tsify --noImplicitAny ] -p [ lavamoat-browserify  --autopolicy --policy './lavamoat/browserify/policy-background.json' ] > /dev/null
    browserify src/scripts/contentscript.ts -t [ babelify --presets [ @babel/preset-env @babel/preset-react ] ] -p [ tsify --noImplicitAny ] -p [ lavamoat-browserify  --autopolicy --policy './lavamoat/browserify/policy-contentscript.json' ] > /dev/null
    browserify src/scripts/popup.ts -t [ babelify --presets [ @babel/preset-env @babel/preset-react ] ] -p [ tsify --noImplicitAny ] -p [ lavamoat-browserify  --autopolicy --policy './lavamoat/browserify/policy-popup.json' ] > /dev/null
    browserify src/scripts/provider.ts -t [ babelify --presets [ @babel/preset-env @babel/preset-react ] ] -p [ tsify --noImplicitAny ] -p [ lavamoat-browserify  --autopolicy --policy './lavamoat/browserify/policy-provider.json' ] > /dev/null
fi


