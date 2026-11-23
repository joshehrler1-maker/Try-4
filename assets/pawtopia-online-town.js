
(() => {
  const api = window.PawtopiaOnline;
  const $ = id => document.getElementById(id);
  const status = (message,target='town-status') => { $(target).textContent = message; };
  const params = new URLSearchParams(location.search);
  const fromHome = params.get('entry') === 'home';
  const enterWorld = $('enter-world');
  if (fromHome) {
    document.body.classList.add('site-entry');
    $('online-title').textContent = 'Welcome to Pawtopia';
    $('online-intro').textContent = 'Sign in to your Pawtopia account.';
    $('online-arena-link').hidden = true;
    $('account-session').after($('entry-actions'));
    if (!api) {
      $('online-disabled').after($('entry-actions'));
      $('entry-actions').hidden = false;
    }
  }
  if (!api) return;
  const duelCode = params.get('duel');
  if (/^[0-9a-f]{12}$/.test(duelCode || '') && $('online-arena-link')) {
    $('online-arena-link').href = 'pawtopia-battle-arena.html#duel-'+duelCode;
  }
  let passwordFormsAvailable = false;
  let accountAction = false;
  let challenge = '', widget;
  const upgradeButton = $('show-upgrade');
  const upgradeForm = $('password-upgrade');
  let upgradeAccount = '';
  function closeUpgrade() {
    upgradeForm.hidden = true;
    upgradeForm.reset();
    upgradeButton.setAttribute('aria-expanded','false');
  }
  upgradeButton.addEventListener('click', () => {
    if (!upgradeForm.hidden) {
      closeUpgrade();
      return;
    }
    upgradeForm.hidden = false;
    upgradeButton.setAttribute('aria-expanded','true');
    $('upgrade-username').focus();
  });
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
  async function render(enterIfSignedIn = false) {
    const account = api.key();
    const signedIn = Boolean(account);
    if (account !== upgradeAccount) {
      upgradeAccount = '';
      upgradeButton.hidden = true;
      closeUpgrade();
    }
    $('account-signin').hidden = signedIn;
    $('account-session').hidden = !signedIn;
    $('cloud-opt-in').checked = api.syncEnabled();
    $('online-features').hidden = !signedIn || fromHome;
    if (fromHome) {
      enterWorld.textContent = signedIn ? 'Continue to Pawtopia' : 'Continue as a guest';
      $('entry-actions').hidden = false;
    }
    if (!signedIn) {
      $('account-key').value = '';
      $('cloud-status').textContent = '';
      nick.value = '';
      petSource.replaceChildren();
      $('shared-pets').replaceChildren();
      $('gift-inbox').replaceChildren();
      return;
    }
    let session;
    try { session = await api.call('/session','GET',undefined,account); }
    catch (error) {
      if (error.status !== 401 || api.key() !== account) throw error;
      api.disconnect();
      status('Sign-in expired. Please sign in again.','account-status');
      return render();
    }
    if (api.key() !== account) return;
    $('account-identity').textContent = session.username ? 'Signed in as '+session.username : 'Signed in with an existing account key.';
    const canUpgrade = passwordFormsAvailable && session.legacy === true;
    upgradeButton.hidden = !canUpgrade;
    if (canUpgrade) upgradeAccount = account;
    else closeUpgrade();
    if (fromHome) {
      if (enterIfSignedIn && !session.legacy) location.replace(enterWorld.href);
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
      const isAccount = id.startsWith('password-') || id === 'legacy-signin';
      if (isAccount && accountAction) return;
      if (isAccount) accountAction = true;
      if (control) control.disabled = true;
      try { await handler(); }
      catch (error) { status(error.message,isAccount ? 'account-status' : 'town-status'); }
      finally {
        if (isAccount) accountAction = false;
        if (control) control.disabled = false;
      }
    });
  }
  async function passwordProof(username,password) {
    const encoder = new TextEncoder();
    const salt = encoder.encode('Pawtopia Players password v1:'+username);
    const key = await crypto.subtle.importKey('raw',encoder.encode(password.normalize('NFC')),'PBKDF2',false,['deriveBits']);
    const proof = await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:600000},key,256);
    return Array.from(new Uint8Array(proof),byte=>byte.toString(16).padStart(2,'0')).join('');
  }
  function showRecovery(code = '') {
    $('key-display').value = code;
    $('account-recovery').hidden = !code;
  }
  $('hide-recovery').addEventListener('click',() => {
    showRecovery();
    if (fromHome) location.replace(enterWorld.href);
  });
  async function passwordAction(mode,prefix) {
    if (!passwordFormsAvailable) throw Error('Password sign-in is temporarily unavailable.');
    const username = $(prefix+'-username').value.trim().toLowerCase();
    const passwordInput = $(prefix+'-password');
    const password = passwordInput.value.normalize('NFC');
    if (!/^[a-z][a-z0-9_]{2,23}$/.test(username)) throw Error('Use 3–24 letters, numbers, or underscores, starting with a letter.');
    if (mode !== 'login' && Array.from(password).length < 15) throw Error('Choose a password with at least 15 characters.');
    if (mode === 'signup' && !challenge) throw Error('Complete the signup check first.');
    const prior = mode === 'upgrade' ? api.key() : '';
    status('Working…','account-status');
    const payload = {username,proof:await passwordProof(username,password)};
    if (mode === 'signup') payload.challenge = challenge;
    if (mode === 'recover') payload.recovery = $('recover-code').value.trim().toLowerCase();
    try {
      const result = await api.call('/auth/'+mode,'POST',payload,prior);
      passwordInput.value = '';
      if (mode === 'recover') $('recover-code').value = '';
      showRecovery(result.recovery);
      await api.connect(result.key,prior);
      status(mode === 'upgrade' ? 'Account upgraded. Use your username and password next time.' : 'Signed in.','account-status');
      await render(mode === 'login');
    } finally {
      if (mode === 'signup' && widget !== undefined) {
        challenge = '';
        window.turnstile.reset(widget);
      }
    }
  }
  submit('password-signin',()=>passwordAction('login','signin'));
  submit('password-signup',()=>passwordAction('signup','signup'));
  submit('password-recover',()=>passwordAction('recover','recover'));
  submit('password-upgrade',()=>passwordAction('upgrade','upgrade'));
  submit('legacy-signin',async () => {
    await api.connect($('account-key').value.trim().toLowerCase());
    $('account-key').value = '';
    status('','account-status');
    await render();
  });
  button($('account-buttons'),'Sign out',async () => {
    const account = api.key();
    try { if (passwordFormsAvailable) await api.call('/auth/logout','POST',undefined,account); }
    catch {}
    if (api.key() !== account) return;
    api.disconnect();
    showRecovery();
    status('Signed out.','account-status');
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
  async function init() {
    try { passwordFormsAvailable = Boolean((await api.call('/auth/status','GET',undefined,'')).passwords); }
    catch {}
    for (const id of ['password-signin','new-account-details','recover-details']) $(id).hidden = !passwordFormsAvailable;
    if (!passwordFormsAvailable && !api.key()) $('legacy-details').open = true;
    const sitekey = window.PawtopiaOnlineConfig.turnstileSiteKey;
    if (sitekey && passwordFormsAvailable) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.onload = () => {
        widget = window.turnstile.render('#signup-challenge',{sitekey,
          callback:value=>{challenge=value;},'expired-callback':()=>{challenge='';}});
      };
      document.head.append(script);
    }
    await render(true);
  }
  init().catch(error=>status(error.message,'account-status'));
})();
