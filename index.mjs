import readline from 'readline';
import { exec } from 'child_process';
import figlet from 'figlet';
import chalk from 'chalk';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function getUserInfo(token) {
  const fetch = (await import('node-fetch')).default;
  const url = 'https://discord.com/api/v9/users/@me';
  const friendsUrl = 'https://discord.com/api/v9/users/@me/relationships';
  const channelsUrl = 'https://discord.com/api/v9/users/@me/channels';
  const guildsUrl = 'https://discord.com/api/v9/users/@me/guilds';
  const billingUrl = 'https://discord.com/api/v9/users/@me/billing/payment-sources';

  const userInfo = fetch(url, {
    headers: { 'Authorization': `${token}` }
  }).then(res => res.json());

  const friendsInfo = fetch(friendsUrl, {
    headers: { 'Authorization': `${token}` }
  }).then(res => res.json());

  const channelsInfo = fetch(channelsUrl, {
    headers: { 'Authorization': `${token}` }
  }).then(res => res.json());

  const guildsInfo = fetch(guildsUrl, {
    headers: { 'Authorization': `${token}` }
  }).then(res => res.json());

  const billingInfo = fetch(billingUrl, {
    headers: { 'Authorization': `${token}` }
  }).then(res => res.json());

  const [data, friends, channels, guilds, billing] = await Promise.all([userInfo, friendsInfo, channelsInfo, guildsInfo, billingInfo]);

  if (data.id) {
    clearTerminal();
    console.log(chalk.green(figlet.textSync('Token Tool')));
    console.log(chalk.blue(`Created by edu__579

      [X]Token: ${token}
      [X]User name: ${data.username}
      [X]User ID: ${data.id}
      [X]Email: ${data.email ? data.email : 'Unable to retrieve user email.'}
      [X]Phone: ${data.phone ? data.phone : 'Unable to retrieve user phone number.'}
      [X]Nitro Account: ${data.premium_type ? 'True' : 'False'}
      [X]CC Connected: ${billing.length > 0 ? 'True' : 'False'}
      [X]Friends: ${friends.length}
      [X]DMs: ${channels.length}
      [X]Guilds: ${guilds.length}
      [X]Account Creation Date: ${new Date(data.id / 4194304 + 1420070400000).toLocaleString()}
      [X]Preferred Language: ${data.locale || 'Unable to retrieve preferred language.'}
    `));
    promptNextStep(token);
  } else {
    console.log(chalk.red('Invalid token or error retrieving information.'));
  }
}

function clearTerminal() {
  exec('clear', (err) => {
    if (err) {
      console.error(chalk.red('Error clearing terminal:', err));
    }
  });
}

function promptNextStep(token) {
  rl.question(chalk.yellow('\nPress Enter...'), () => {
    rl.question(chalk.yellow('[1]More [2]Exit: '), (answer) => {
      if (answer === '1') {
        showMoreOptions(token);
      } else if (answer === '2') {
        console.log(chalk.green('Exiting the program...'));
        rl.close();
      } else {
        console.log(chalk.red('Invalid selection. Please choose 1 or 2.'));
        promptNextStep(token);
      }
    });
  });
}

function showMoreOptions(token) {
  rl.question(chalk.yellow('[1]Token Checker [2]Party Mode [3]Status: '), (answer) => {
    if (answer === '1') {
      startTokenChecker();
    } else if (answer === '2') {
      startPartyMode(token);
    } else if (answer === '3') {
      changeUserStatus(token);
    } else {
      console.log(chalk.red('Invalid selection. Please choose 1, 2, or 3.'));
      showMoreOptions(token);
    }
  });
}

async function startTokenChecker() {
  const fetch = (await import('node-fetch')).default;
  const tokens = [];

  function checkTokenValidity(token) {
    return fetch('https://discord.com/api/v9/users/@me', {
      headers: { 'Authorization': token }
    }).then(res => ({ token, valid: res.ok, isUser: res.status === 200 }));
  }

  console.log(chalk.yellow('Enter tokens (one per line). Type "ESC" to finish:'));

  function getTokens() {
    rl.question(chalk.yellow('Token: '), async (token) => {
      if (token.toLowerCase() === 'esc') {
        const results = await Promise.all(tokens.map(checkTokenValidity));
        console.log(chalk.green('\nToken Checker Results:'));
        results.forEach(({ token, valid, isUser }, index) => {
          console.log(`Token ${index + 1}: ${valid ? 'Valid' : 'Invalid'} - ${isUser ? 'User' : 'Bot'}`);
        });
        rl.close();
      } else {
        tokens.push(token);
        getTokens();
      }
    });
  }

  getTokens();
}

async function startPartyMode(token) {
  console.log(chalk.magenta('On!'));
  const fetch = (await import('node-fetch')).default;
  const toggleTheme = () => {
    return fetch('https://discord.com/api/v9/users/@me/settings', {
      method: 'PATCH',
      headers: {
        'Authorization': `${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ theme: 'light' })
    }).then(() => {
      return fetch('https://discord.com/api/v9/users/@me/settings', {
        method: 'PATCH',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ theme: 'dark' })
      });
    });
  };
  let interval = setInterval(toggleTheme, 500); // Toggles every 0.5 seconds
}

async function changeUserStatus(token) {
  rl.question(chalk.yellow('New Status: '), async (status) => {
    const fetch = (await import('node-fetch')).default;
    await fetch('https://discord.com/api/v9/users/@me/settings', {
      method: 'PATCH',
      headers: {
        'Authorization': `${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ custom_status: { text: status } })
    });
    console.log(chalk.green(`New status changed: ${status}`));
    rl.question(chalk.yellow('Change Icon (y/n): '), async (changeIcon) => {
      if (changeIcon.toLowerCase() === 'y') {
        rl.question(chalk.yellow('[1]Online [2]Idle [3]Do Not Disturb [4]Invisible: '), async (iconOption) => {
          let statusIcon;
          switch (iconOption) {
            case '1':
              statusIcon = 'online';
              break;
            case '2':
              statusIcon = 'idle';
              break;
            case '3':
              statusIcon = 'dnd';
              break;
            case '4':
              statusIcon = 'invisible';
              break;
            default:
              console.log(chalk.red('Invalid selection.'));
              return;
          }
          await fetch('https://discord.com/api/v9/users/@me/settings', {
            method: 'PATCH',
            headers: {
              'Authorization': `${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: statusIcon })
          });
          console.log(chalk.green(`Icon changed to: ${statusIcon}`));
          showMoreOptions(token);
        });
      } else {
        showMoreOptions(token);
      }
    });
  });
}

rl.question(chalk.yellow('[1]User Token         [2]Token Checker: '), (option) => {
  if (option === '1') {
    rl.question(chalk.yellow('Please enter the user token: '), (token) => {
      getUserInfo(token);
    });
  } else if (option === '2') {
    startTokenChecker();
  } else {
    console.log(chalk.red('Invalid option.'));
    rl.close();
  }
});
