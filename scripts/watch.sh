INPUT=$1
OUTPUT=$2
LIVE_RELOAD=$3

if [[ $LIVE_RELOAD == true ]]; then
    echo "Watching $INPUT with live reload enabled on PORT $PORT"
    watchify $INPUT -t [ babelify --presets [ @babel/preset-env @babel/preset-react  ] ] -p [tsify --noImplicitAny] -p  [ browserify-hmr --disableHostCheck ]  -o $OUTPUT
else
    echo "Watching $INPUT"
    watchify $INPUT -t [ babelify --presets [ @babel/preset-env @babel/preset-react ] ] -p [ tsify --noImplicitAny ] -o $OUTPUT
fi
