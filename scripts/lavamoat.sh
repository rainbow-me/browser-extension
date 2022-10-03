

BUILD=$1

### We can't enable lavamoat in the contentscript and provider bc of unsafe-eval
### declare -a FILES=("background" "contentscript" "popup" "provider")
declare -a FILES=("background" "popup")

## now loop through the above array
for FILE in "${FILES[@]}"
do
    if [[ $BUILD == true ]]; then
        echo "Bundling with LavaMoat..."
        browserify src/scripts/$FILE.ts -t [ babelify --presets [ @babel/preset-env @babel/preset-react ] ] -p [ tsify --noImplicitAny ] -p [ lavamoat-browserify  --autopolicy --policy "./lavamoat/browserify/policy-$FILE.json" --override "./lavamoat/browserify/policy-$FILE-override.json" ] > build/$FILE.js
        sed -i '' 's/\$h‍_/\$h_/g' build/$FILE.js
    else
        echo "Updating LavaMoat policies..."
        browserify src/scripts/$FILE.ts -t [ babelify --presets [ @babel/preset-env @babel/preset-react ] ] -p [ tsify --noImplicitAny ] -p [ lavamoat-browserify  --autopolicy --policy "./lavamoat/browserify/policy-$FILE.json" --override "./lavamoat/browserify/policy-$FILE-override.json" ] > /dev/null
    fi
done


