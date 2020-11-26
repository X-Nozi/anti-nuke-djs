const mongoose = require('mongoose')

const whitelistSchema = mongoose.Schema({
    guild: String,
    user: String,
    id: String,
});

module.exports = mongoose.model("whitelist", whitelistSchema);
