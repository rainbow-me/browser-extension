INPUT=$1
OUTPUT=$2


watchify $INPUT -t [ babelify --presets [ @babel/preset-env @babel/preset-react ] ] -p [ tsify --noImplicitAny ] -o $OUTPUT