errFile=.error
rm "$errFile"

( yarn gulp -f packages/babel-plugin-fbt/gulpfile.js build \
    && yarn jest --all \
    && yarn workspace demo-app clean-fbts \
    && yarn workspace demo-app all \
    || touch .error
)&
# ( yarn gulp -f packages/babel-plugin-fbt/gulpfile.js build && yarn jest fbtFunctional-test || touch .error )&
# DEBUG
# node_www --inspect ./node_modules/.bin/jest fbtFunctional-test --runInBand --watch

# yarn flow:check &
( yarn flow || touch .error ) &

time wait

if [ -f "$errFile" ]; then
    echo Failed!
    exit 1
fi

echo Success!
exit 0
