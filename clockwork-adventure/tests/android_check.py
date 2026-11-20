import json,time,urllib.request,sys
from pathlib import Path
endpoint='http://localhost:4444'
def call(method,path,body=None):
 req=urllib.request.Request(endpoint+path,data=json.dumps(body).encode() if body is not None else None,method=method,headers={'Content-Type':'application/json'})
 try:
  with urllib.request.urlopen(req,timeout=360) as r: return json.load(r)['value']
 except urllib.error.HTTPError as exc: raise RuntimeError(exc.read().decode()[:1000])
caps={'browserName':'firefox','moz:firefoxOptions':{'androidPackage':'org.mozilla.firefox','androidDeviceSerial':'emulator-5554','prefs':{'browser.shell.checkDefaultBrowser':False}}}
session=call('POST','/session',{'capabilities':{'alwaysMatch':caps}})
print(session['capabilities'].get('browserVersion'),flush=True)
p='/session/'+session['sessionId']
def run(script,*args):return call('POST',p+'/execute/sync',{'script':script,'args':args})
def wait(script):
 for _ in range(60):
  v=run('return '+script)
  if v:return v
  time.sleep(1)
 raise RuntimeError(script)
def tap(el):
 pos=run("var el=document.getElementById(arguments[0]);el.scrollIntoView({block:'nearest'});var r=el.getBoundingClientRect();return [Math.floor(r.x+r.width/2),Math.floor(r.y+r.height/2)]",el)
 touch(*pos)
def touch(x,y,dy=0):
 actions=[{'type':'pointerMove','duration':0,'x':x,'y':y},{'type':'pointerDown','button':0}]
 if dy: actions += [{'type':'pointerMove','duration':200,'x':x,'y':y+dy},{'type':'pause','duration':1600}]
 actions += [{'type':'pointerUp','button':0}]
 call('POST',p+'/actions',{'actions':[{'type':'pointer','id':'finger','parameters':{'pointerType':'touch'},'actions':actions}]})
def travel(url):
 call('POST',p+'/url',{'url':url})
 wait("!!document.getElementById('begin')?.onclick")
def begin():
 tap('begin')
 wait("!!document.getElementById('dialogDone')")
 tap('dialogDone')
def saved():
 return run("return JSON.parse(localStorage.getItem('sph-clockwork-v1'))")
try:
 travel('http://127.0.0.1:8073/')
 begin()
 tap('pauseButton')
 fixture=dict(saved(),zone='forest',x=0,z=22,metLuna=True,bridge=True,power=2,coins=14,gears=['gear-mill','gear-garden','gear-well'])
 run("localStorage.setItem('sph-clockwork-v1',JSON.stringify(arguments[0]))",fixture)
 call('POST',p+'/refresh',{});wait("!!document.getElementById('resume')?.onclick");tap('resume')
 tap('pauseButton')
 # Capture the original game's own export data with the native Blob implementation.
 run("const orig=URL.createObjectURL;URL.createObjectURL=b=>{b.text().then(t=>window.exported=t);return orig.call(URL,b)};HTMLAnchorElement.prototype.click=function(){}")
 tap('export')
 backup=wait("window.exported")
 assert json.loads(backup)['zone']=='forest' and json.loads(backup)['coins']==14
 print('Original-format save exported',flush=True)
 travel('http://127.0.0.1:8072/Try-4/clockwork-adventure/')
 print('Viewport',run('return [innerWidth,innerHeight,navigator.maxTouchPoints,navigator.userAgent]'),flush=True)
 assert run("return innerWidth>innerHeight && navigator.maxTouchPoints>0")
 begin()
 tap('mapButton');wait("document.querySelector('#modalContent').textContent.includes('Clockwork Temple')");tap('closeModal')
 tap('lock');wait("document.getElementById('toast').textContent.includes('No enemy')")
 tap('attack');tap('dodge')
 x,y=run("const r=document.querySelector('#stick').getBoundingClientRect();return [Math.floor(r.x+r.width/2),Math.floor(r.y+r.height/2)]")
 touch(x,y,-35)
 tap('pauseButton')
 moved=saved()
 assert abs(moved['z']-13)+abs(moved['x'])>.05,moved
 assert run("return !!document.getElementById('import').onclick")
 run("const t=new DataTransfer();t.items.add(new File([arguments[0]],'backup.json',{type:'application/json'}));const f=document.getElementById('importFile');f.files=t.files;f.dispatchEvent(new Event('change'))",backup)
 wait("document.getElementById('toast').textContent.includes('Backup restored')")
 restored=saved()
 for k,v in json.loads(backup).items():
  if k!='exportedAt':assert restored[k]==v,(k,v,restored[k])
 call('POST',p+'/refresh',{});wait("document.getElementById('resume') && !document.getElementById('resume').classList.contains('hidden')")
 tap('resume');wait("!document.getElementById('hud').classList.contains('hidden')")
 print('PASS Android touch, map, lock, movement, attack/dodge input, pause, save import, reload and resume',run("return document.getElementById('keyboardHint').textContent"),flush=True)
finally:
 call('DELETE',p)
