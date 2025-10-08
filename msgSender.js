const express = require('express');


module.exports = function(app, botManager, htmlBlocks, io) {
    const html = `
        <hr>
        <form action="/gochatmgr/msg" method="GET">
          <input type="text" name="param" placeholder="введи текст/команду" style="padding:8px; width:200px;" required>
          <button type="submit">отправить</button>
        </form>
        <h3>команды писать так: com_gamemode survival</h3>
    `;
    htmlBlocks.push(html);
    
    app.get('/gochatmgr/msg', (req, res) => res.redirect(`/chatmgr/msg/${req.query.param}`));
    app.get('/chatmgr/msg/:text', (req, res) => {
        const t = req.params.text;
        const bot = botManager.getBot(); 
        if (!bot){
            res.send("бот не запущен");
            return;
        };
        bot.chat(t.replace(/com_/g, '/'));
        res.send(`отправлено: ${t.replace(/com_/g, '/')}`);
      });
}
