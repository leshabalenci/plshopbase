const express = require('express');
const { goals } = require('mineflayer-pathfinder');

module.exports = function(app, botManager, htmlBlocks, io) {
    const html = `
        <hr>
        <h1>Reach</h1>
        <form action="/gomovement/reach" method="GET">
          <input type="text" name="param" placeholder="enter nickname" style="padding:8px; width:200px;" required>
          <button type="submit">reach</button>
        </form>
    `;
    htmlBlocks.push(html);

    app.get('/gomovement/reach', (req, res) => {
        res.redirect(`/movement/reach/${req.query.param}`);
    });

    app.get('/movement/reach/:nickname', (req, res) => {
        const t = req.params.nickname;
        const bot = botManager.getBot(); 

        if (!bot) {
            return res.send('❌ Бот не запущен');
        }

        const target = bot.players[t]?.entity;
        if (!target) {
            return res.send(`❌ игрок ${t} не найден`);
        }

        const goal = new goals.GoalFollow(target, 1);
        bot.pathfinder.setGoal(goal, true);
        res.send(`✅ Бот преследует ${t}`);
    });
}
