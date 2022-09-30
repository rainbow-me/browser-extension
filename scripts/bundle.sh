INPUT=$1
OUTPUT=$2

browserify $INPUT -t [ babelify --presets [ @babel/preset-env @babel/preset-react ] ] -p [ tsify --noImplicitAny ] > $OUTPUT