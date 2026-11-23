
(() => {
  const api = window.PawtopiaOnline;
  const $ = id => document.getElementById(id);
  const status = (message,target='town-status') => { $(target).textContent = message; };
  if (!api) return;
  $('online-disabled').hidden = true;
  $('online-enabled').hidden = false;
  $('cloud-settings').hidden = window.PawtopiaOnlineConfig.cloudSaves !== true;
  $('cloud-opt-in').addEventListener('change',event => api.setSyncEnabled(event.currentTarget.checked));
  function output(parent, value) {
    const item = document.createElement('li');
    item.textContent = value;
    parent.append(item);
    return item;
  }
  function button(parent,text,action) {
    const control = document.createElement('button');
    control.type = 'button';
    control.textContent = text;
    control.addEventListener('click',async () => {
      control.disabled = true;
      try { await action(); }
      catch (error) { status(error.message); }
      finally { control.disabled = false; }
    });
    parent.append(' ',control);
    return control;
  }
  async function action(path,data) {
    const result = await api.call(path,'POST',data);
    await render();
    status(result.message || 'Saved.');
  }
  const petSource = $('share-pet-source');
  const nick = $('share-pet-nickname');
  let localPets = [];
  petSource.addEventListener('change', () => {
    nick.value = localPets[Number(petSource.value)]?.name || '';
  });
  function renderAdoptions(records) {
    const save = window.PawtopiaSave.read();
    localPets = [save.companion,...(Array.isArray(save.otherCompanions)?save.otherCompanions:[])].filter(Boolean).slice(0,6);
    const prior = petSource.value;
    petSource.replaceChildren(new Option('Choose a pet',''),...localPets.map((pet,index) =>
      new Option(pet.name+' · '+pet.breed,String(index))));
    petSource.value = prior!=='' && localPets[Number(prior)] ? prior : '';
    $('share-pet-submit').disabled = !localPets.length;
    const list = $('shared-pets');
    list.replaceChildren();
    if (!records.length) output(list,'No nicknames shared.');
    for (const pet of records) {
      const row = output(list,pet.nickname+' · '+pet.breed);
      button(row,'Remove shared nickname',() => action('/adoptions',{remove:pet.id}));
    }
  }
  async function render() {
    const account = api.key();
    const signedIn = Boolean(account);
    $('account-signin').hidden = signedIn;
    $('account-session').hidden = !signedIn;
    $('cloud-opt-in').checked = api.syncEnabled();
    $('online-features').hidden = !signedIn;
    if (!signedIn) {
      $('account-key').value = '';
      $('cloud-status').textContent = '';
      nick.value = '';
      petSource.replaceChildren();
      $('shared-pets').replaceChildren();
      $('gift-inbox').replaceChildren();
      return;
    }
    const data = await api.call('/town','GET',undefined,account);
    if (api.key()!==account) return;
    const {player,mine,market,board,clubs,puzzle,adoptions=[],gifts=[]} = data;
    renderAdoptions(adoptions);
    const inbox = $('gift-inbox');
    inbox.replaceChildren();
    if (!gifts.length) output(inbox,'No gifts yet.');
    for (const gift of gifts) output(inbox,(gift.pin||gift.tickets+' market tickets')+' · '+gift.sent_at.slice(0,10));
    $('player-profile').textContent = player.alias + ' · ' + player.tickets + ' market tickets';
    $('public-profile').checked = Boolean(player.public);
    $('player-club').value = player.club || '';
    $('daily-question').textContent = puzzle.earned ? 'Today’s prize: ' + puzzle.earned :
      'What is ' + puzzle.first + ' + ' + puzzle.second + '?';
    $('puzzle').hidden = Boolean(puzzle.earned);
    const inventory = $('online-inventory');
    inventory.replaceChildren();
    if (!mine.length) output(inventory,'Solve the daily puzzle to earn a pin for your collection.');
    for (const item of mine) {
      const row = output(inventory,item.kind + (item.listing ? ' · Listed' : ''));
      if (item.listing) {
        button(row,'Remove listing',() => action('/listing',{item:item.id,remove:true}));
        continue;
      }
      button(row,'List this pin',async () => {
        const trade = $('listing-kind').value;
        await action('/listing',{item:item.id,price:trade ? null : $('listing-price').valueAsNumber,wanted:trade || null});
      });
    }
    const listings = $('player-listings');
    listings.replaceChildren();
    if (!market.length) output(listings,'No pins listed yet.');
    for (const entry of market) {
      const terms = entry.price === null ? 'Swap for ' + entry.wanted : entry.price + ' tickets';
      const row = output(listings,entry.kind + ' · ' + entry.alias + ' · ' + terms);
      if (entry.mine) continue;
      const offer = entry.wanted ? mine.find(item => item.kind === entry.wanted && !item.listing) : null;
      const exchange = button(row,entry.wanted ? 'Swap' : 'Buy',() =>
        action('/exchange',{listing:entry.id,offered:offer?.id || null}));
      exchange.disabled = entry.wanted ? !offer : player.tickets < entry.price;
    }
    $('online-board').replaceChildren();
    if (!board.length) output($('online-board'),'No public scores this month.');
    for (const row of board) output($('online-board'),row.alias + (row.club ? ' · ' + row.club : '') + ' · ' + row.score + ' puzzles');
    $('club-members').replaceChildren();
    for (const club of ['Scouts','Builders','Guardians']) {
      output($('club-members'), club + ' · ' + (clubs.find(row => row.club === club)?.count || 0) + ' public members');
    }
  }
  function submit(id,handler) {
    $(id).addEventListener('submit',async event => {
      event.preventDefault();
      const control = event.submitter;
      if (control) control.disabled = true;
      try { await handler(); }
      catch (error) { status(error.message, id === 'account-signin' ? 'account-status' : 'town-status'); }
      finally { if (control) control.disabled = false; }
    });
  }
  submit('account-signin',async () => {
    await api.connect($('account-key').value.trim());
    $('account-key').value = '';
    await render();
  });
  button($('account-buttons'),'Show account key',async () => {
    $('key-display').hidden = !$('key-display').hidden;
    $('key-display').value = $('key-display').hidden ? '' : api.key();
  });
  button($('account-buttons'),'Sign out',async () => {
    api.disconnect();
    $('key-display').value = '';
    $('key-display').hidden = true;
    await render();
  });
  button($('cloud-conflict'),'Use this device’s save',() => api.sync('local'));
  button($('cloud-conflict'),'Use the online save',() => api.sync('cloud'));
  button($('online-features'),'Refresh town',render);
  submit('share-pet',async () => {
    const pet = petSource.value==='' ? null : localPets[Number(petSource.value)];
    if (!pet) throw Error('Choose a pet first.');
    await action('/adoptions',{nickname:nick.value,breed:pet.breed});
    nick.value = '';
    petSource.value = '';
  });
  submit('profile',() => action('/profile',{public:$('public-profile').checked,club:$('player-club').value || null}));
  submit('puzzle',() => action('/puzzle',{answer:$('puzzle-answer').valueAsNumber}));
  const sitekey = window.PawtopiaOnlineConfig.turnstileSiteKey;
  if (sitekey) {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => {
      let challenge = '';
      const widget = window.turnstile.render('#signup-challenge',{sitekey,callback:value => {challenge = value;},
        'expired-callback':() => {challenge = '';}});
      button($('signup-controls'),'Create a free account',async () => {
        if (!challenge) {
          status('Complete the signup check first.','account-status');
          return;
        }
        status('','account-status');
        try {
          const account = await api.call('/accounts','POST',{challenge},'');
          await api.connect(account.key);
          $('key-display').value = account.key;
          $('key-display').hidden = false;
          await render();
        } catch (error) {
          status(error.message,'account-status');
        } finally {
          challenge = '';
          window.turnstile.reset(widget);
        }
      });
    };
    document.head.append(script);
  }
  render().catch(error => status(error.message,'account-status'));
})();
