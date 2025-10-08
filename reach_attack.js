const { goals } = require('mineflayer-pathfinder');

module.exports = function(app, botManager, htmlBlocks, io) {
  const active = {};

  const html = `
    <hr>
    <h1>Reach & Attack</h1>
    <form action="/gomovement/attack" method="GET" style="margin-bottom:8px;">
      <input type="text" name="param" placeholder="ник жертвы" style="padding:8px; width:200px;" required>
      <button type="submit">Атака</button>
    </form>
  `;
  htmlBlocks.push(html);

  app.get('/gomovement/attack', (req, res) => {
    const nick = req.query.param;
    res.redirect(`/movement/attack/${encodeURIComponent(nick)}`);
  });

  app.get('/movement/attack/:nickname', (req, res) => {
    const nickname = req.params.nickname;
    const bot = botManager.getBot && botManager.getBot();
    if (!bot) return res.send('❌ бот не запущен');

    const botId = bot.username || 'main';
    if (active[botId]) {
      try { bot.pathfinder.setGoal(null); } catch (e) {}
      clearInterval(active[botId].intervalId);
      delete active[botId];
    }
 
    const targetEntity = bot.players[nickname]?.entity;
    if (!targetEntity) return res.send(`❌ игрок ${nickname} не найден`);

    const followRange = 1.5;
    const goal = new goals.GoalFollow(targetEntity, followRange);
    bot.pathfinder.setGoal(goal, true);

    const intervalId = setInterval(() => {
      const t = bot.players[nickname]?.entity;
      if (!t) {
        try { bot.pathfinder.setGoal(null); } catch (e) {}
        clearInterval(intervalId);
        delete active[botId];
        if (io) io.emit('bot:attack:stopped', { bot: botId, reason: 'target_lost' });
        return;
      }

      const distance = bot.entity.position.distanceTo(t.position);
      const meleeRange = 3.0;
      if (distance <= meleeRange) {
        try { bot.pathfinder.setGoal(null); } catch (e) {}
        if (bot.pvp && typeof bot.pvp.attack === 'function') {
          try { bot.pvp.attack(t); } catch { try { bot.attack(t); } catch {} }
        } else {
          try { bot.attack(t); } catch {}
        }
        setTimeout(() => {
          try {
            if (bot.players[nickname]?.entity && bot.entity.isValid) {
              const newGoal = new goals.GoalFollow(bot.players[nickname].entity, followRange);
              bot.pathfinder.setGoal(newGoal, true);
            }
          } catch {}
        }, 800);
      } else {
        try {
          const newGoal = new goals.GoalFollow(t, followRange);
          bot.pathfinder.setGoal(newGoal, true);
        } catch {}
      }
    }, 600);

    active[botId] = { intervalId, currentTargetName: nickname };
    res.send(`✅ бот начал атаку ${nickname}`);
  });

  
};
