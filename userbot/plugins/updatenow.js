/* Copyright (C) 2022 Ber4tbey.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
DisOwen - Ber4tbey
*/


const Owen = require("../../bot")
const simpleGit = require('simple-git');
const git = simpleGit()
const fs = require("fs")
const Discord = require("discord.js")
const Language = require('../../language');
const Lang = Language.getString('updater');
const Heroku = require('heroku-client');
const Config = require('../../config');
const exec = require('child_process').exec;
const { PassThrough } = require('stream');

//
const heroku = new Heroku({ token: Config.API_KEY })
module.exports.run = async (bot, message, args) => {
    
    
    await git.fetch();
    var commits = await git.log([Config.BRANCH + '..origin/' + Config.BRANCH]);
    if (commits.total === 0) {
        return Owen.editmsg(message,
            
            Lang.UPDATE
        );    
    } else {
        var guncelleme =  Owen.editmsg(message,Lang.UPDATING);
        if (Config.APP_NAME && Config.API_KEY) {
            try {
                var app = await heroku.get('/apps/' + Config.APP_NAME)
            } catch {
                return Owen.editmsg(message,
                    Lang.INVALID_HEROKU);
            }

            git.fetch('upstream', Config.BRANCH);
            git.reset('hard', ['FETCH_HEAD']);

            var git_url = app.git_url.replace(
                "https://", "https://api:" + Config.API_KEY + "@"
            )
            
            try {
                await git.addRemote('heroku', git_url);
            } catch { console.log('heroku remote ekli'); }
            await git.push('heroku', Config.BRANCH);
            
            Owen.editmsg(message,
                Lang.UPDATED);
        } else {
            git.pull((async (err, update) => {
                if(update && update.summary.changes) {
                    Owen.editmsg(message,
                        Lang.UPDATED_LOCAL);
                    exec('npm install').stderr.pipe(process.stderr);
                } else if (err) {
                    Owen.editmsg(message,
                        '*❌ Güncelleme başarısız oldu!*\n*Hata:* ```' + err + '```');
                }
            }))};
            
        }
    

};




module.exports.config = {
    command: "updatenow"
}
