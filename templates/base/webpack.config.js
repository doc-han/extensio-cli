const path = require("path");
const copyPlugin = require("copy-webpack-plugin");

module.exports = {
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    entry: { <% if(arrayHas(parts, BACKGROUND)){ %>
        background: './background/background.js', <% } %> <% if(arrayHas(parts, POPUP)){%>
        popup: './popup/popup.js', <%}%> <% if(arrayHas(parts, CONTENTSCRIPT)){%>
        contentscript: './contentscript/contentscript.js' <%}%> <% if(arrayHas(parts, PREFERENCE)) { %>
        preference: './preference/preference.js' <% } %>
    },
    mode: 'production',
    plugins: [
        new copyPlugin({
            patterns: [
                { from: path.resolve(__dirname, 'public'), to: path.resolve(__dirname, 'dist') },
            ]
        })
    ]
}