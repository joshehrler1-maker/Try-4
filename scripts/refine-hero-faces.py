"""Refine poster-guided faces in the shared GLB assets; no external resources.
Run once on the preceding model revision. Version metadata prevents repeat edits.
"""
import json, math, struct
from pathlib import Path
import numpy as np
ROOT=Path(__file__).resolve().parents[1]

def unit(x):
 x=np.array(x,dtype=float);return x/max(1e-12,np.linalg.norm(x))
def curve(points,steps=20):
 p=np.array(points,dtype=float);out=[]
 for t in np.linspace(0,1,steps):
  q=p.copy()
  while len(q)>1:q=q[:-1]*(1-t)+q[1:]*t
  out.append(q[0])
 return out
class Shape:
 def __init__(self):self.v=[];self.n=[];self.i=[]
 def surface(self,vs,faces):
  v=np.array(vs);norm=np.zeros_like(v)
  for a,b,c in faces:
   n=np.cross(v[b]-v[a],v[c]-v[a]);norm[a]+=n;norm[b]+=n;norm[c]+=n
  norm=np.array([unit(n) for n in norm]);offset=len(self.v);self.v.extend(v.tolist());self.n.extend(norm.tolist());self.i.extend((np.array(faces)+offset).reshape(-1).tolist())
 def tube(self,path,radius=.01,sides=7,taper=False):
  vs=[];faces=[]
  for j,p in enumerate(path):
   tangent=unit(np.array(path[min(j+1,len(path)-1)])-path[max(0,j-1)]);a=unit(np.cross(tangent,[0,0,1]));bb=unit(np.cross(tangent,a));r=radius*(.25+.75*math.sin(math.pi*j/(len(path)-1))**.4) if taper else radius
   for k in range(sides):vs.append(np.array(p)+r*(a*math.cos(k*math.tau/sides)+bb*math.sin(k*math.tau/sides)))
  for j in range(len(path)-1):
   for k in range(sides):
    a=j*sides+k;b=j*sides+(k+1)%sides;c=a+sides;dd=b+sides;faces.extend([[a,b,c],[b,dd,c]])
  self.surface(vs,faces)
 def ball(self,center,scale,rows=16,cols=28):
  vs=[];faces=[]
  for i in range(rows+1):
   a=i*math.pi/rows
   for j in range(cols+1):
    b=j*math.tau/cols;vs.append(np.array(center)+np.array(scale)*[math.sin(a)*math.cos(b),math.cos(a),math.sin(a)*math.sin(b)])
  for i in range(rows):
   for j in range(cols):
    a=i*(cols+1)+j;b=a+cols+1;faces.extend([[a,a+1,b],[a+1,b+1,b]])
  self.surface(vs,faces)

def refine(name):
 path=ROOT/'assets'/f'{name.lower()}-master.glb';raw=path.read_bytes();ln=struct.unpack_from('<I',raw,12)[0];doc=json.loads(raw[20:20+ln]);blob=bytearray(raw[28+ln:]);luna=name=='Luna'
 if doc['asset'].get('extras',{}).get('face_revision')=='poster-detail-3':return
 cy=3.11 if luna else 3.025;cz=-.01 if luna else -.1297
 old=doc['nodes'];keep=[]
 remove=['eye socket','eye white','colored iris','pupil','eye glint','secondary eye','expressive sculpted brow','muzzle','raised smiling cheek','smile','whisker','fine whisker','chin','pink cat nose','lash','forehead stripe','forehead tabby chevron','tabby cheek stripe']
 for node in old:
  label=node['name']
  if any(label.startswith(x) for x in remove) or label in ['cat head','cheek volume','soft cheek fluff']:continue
  if label=='forearm gauntlet':node['extras']['region']='arm'
  if label=='cheek fur sculpt':node['extras']['region']='head'
  if label=='cheek volume':node['scale']=[.23,.205,.18];node['translation'][2]=cz-.19
  if label=='cat head':node['scale']=[.60 if luna else .63,.51 if luna else .53,.43]
  keep.append(node)
 doc['nodes']=keep
 def material(label,color):
  doc['materials'].append({'name':label,'pbrMetallicRoughness':{'baseColorFactor':list(color)+[1],'metallicFactor':0,'roughnessFactor':.65},'doubleSided':True});return len(doc['materials'])-1
 white=8;dark=10;iris=9;fur=0;cream=1
 liner=material('Soft violet eyelid' if luna else 'Warm brown eyelid',[.20,.14,.27] if luna else [.24,.10,.035])
 irisEdge=material('Deep iris limbal ring',[.12,.055,.22] if luna else [.075,.19,.025])
 irisLight=material('Radial iris fibers',[.40,.22,.65] if luna else [.20,.43,.065])
 pink=material('Rose nose leather',[.70,.24,.36]);noseLight=material('Nose highlight',[.93,.48,.57]);strand=material('Fine face fur',[.80,.80,.87] if luna else [.98,.64,.24]);whiskerMat=material('Ivory whiskers',[.97,.93,.83]);browMat=material('Sculpted brow fur',[.25,.18,.31] if luna else [.26,.105,.025])
 def accessor(arr,typ,component):
  nonlocal blob
  blob.extend(b'\0'*((-len(blob))%4));offset=len(blob);a=np.array(arr,dtype='<f4' if component==5126 else '<u2');blob.extend(a.tobytes());doc['bufferViews'].append({'buffer':0,'byteOffset':offset,'byteLength':a.nbytes});v=len(doc['bufferViews'])-1
  item={'bufferView':v,'componentType':component,'count':len(arr) if typ=='VEC3' else len(a),'type':typ}
  if typ=='VEC3':item.update(min=a.min(axis=0).tolist(),max=a.max(axis=0).tolist())
  doc['accessors'].append(item);return len(doc['accessors'])-1
 def add(label,shape,mat,side=1,translation=None,lod=0):
  if not shape.v:return
  assert len(shape.v)<65536
  p=accessor(shape.v,'VEC3',5126);n=accessor(shape.n,'VEC3',5126);i=accessor(shape.i,'SCALAR',5123)
  doc['meshes'].append({'name':label,'primitives':[{'attributes':{'POSITION':p,'NORMAL':n},'indices':i,'material':mat}]});doc['nodes'].append({'name':label,'mesh':len(doc['meshes'])-1,'translation':translation or [0,0,0],'scale':[1,1,1],'extras':{'region':'head','side':side,'lod':lod}})
 # Sculpt a continuous cheek/jaw silhouette rather than layering spherical cheek pads.
 head=Shape();vs=[];faces=[];rows=32;cols=48
 for i in range(rows+1):
  a=math.pi*i/rows;y=math.cos(a);cheek=1+.07*math.exp(-((y+.25)/.32)**2);jaw=1-.17*max(0,-y-.35)
  for j in range(cols+1):
   b=math.tau*j/cols;r=math.sin(a);vs.append([r*math.cos(b)*(.60 if luna else .63)*cheek*jaw,y*(.51 if luna else .53),r*math.sin(b)*.43])
 for i in range(rows):
  for j in range(cols):
   a=i*(cols+1)+j;b=a+cols+1;faces.extend([[a,a+1,b],[a+1,b+1,b]])
 head.surface(vs,faces);add('cat head',head,fur,translation=[0,cy,cz])
 def furStripe(shape,path,width):
  vs=[];faces=[]
  for j,point in enumerate(path):
   t=j/(len(path)-1);r=width*math.sin(math.pi*t)**.6+.0005
   for side in [-1,1]:
    x=point[0]+side*r;y=point[1];yn=(y-cy)/(.51 if luna else .53);width=(.60 if luna else .63)*(1+.07*math.exp(-((yn+.25)/.32)**2))*(1-.17*max(0,-yn-.35));z=cz-.43*math.sqrt(max(.02,1-(x/width)**2-yn**2))-.008;vs.append([x,y,z])
  for j in range(len(path)-1):
   a=j*2;faces.extend([[a,a+2,a+1],[a+1,a+2,a+3]])
  shape.surface(vs,faces)
 eyeY=cy+.055;eyeZ=cz-.425
 for side in [-1,1]:
  ex=side*.235;ey=eyeY;ez=eyeZ
  # Convex almond sclera, with outer corners lifted into the feline silhouette.
  def eyePoint(a,r=1):
   x=.194*math.cos(a)*r;y=(.12 if math.sin(a)>=0 else .105)*math.sin(a)*r+side*x*.18;z=-.033*(1-r*r);return [x,y,z]
  shape=Shape();vs=[[0,0,-.033]];faces=[];rings=8;cols=40
  for j in range(1,rings+1):
   for k in range(cols):vs.append(eyePoint(k*math.tau/cols,j/rings))
  for k in range(cols):faces.append([0,1+(k+1)%cols,1+k])
  for j in range(rings-1):
   for k in range(cols):
    a=1+j*cols+k;b=1+j*cols+(k+1)%cols;c=a+cols;dd=b+cols;faces.extend([[a,b,c],[b,dd,c]])
  shape.surface(vs,faces);add('eye white',shape,white,side,[ex,ey,ez])
  lid=Shape();upper=[np.array(eyePoint(t))+[ex,ey,ez-.008] for t in np.linspace(0,math.pi,28)];lower=[np.array(eyePoint(t))+[ex,ey,ez-.006] for t in np.linspace(math.pi,math.tau,28)]
  lid.tube(upper,.017 if luna else .022);lid.tube(lower,.009);add('feline eyelid rim',lid,liner,side)
  # Colored iris, dark outer ring, separate pupil and two catchlights.
  for label,mat,r,zz in [('colored iris limbal border',irisEdge,.104,-.040),('colored iris',iris,.094,-.048),('pupil',dark,.052,-.066)]:
   sh=Shape();sh.ball([0,0,0],[r,r*1.03,.014],12,32);add(label,sh,mat,side,[ex-side*.008,ey-.003,ez+zz])
  fibers=Shape()
  for j in range(48):
   a=j*math.tau/48;path2=[]
   for r in [.061,.074,.089]:path2.append([math.cos(a)*r,math.sin(a)*r*1.03,-.061+(.001 if j%2 else 0)])
   fibers.tube(path2,.0007,4)
  add('colored iris radial fibers',fibers,irisLight,side,[ex-side*.008,ey-.003,ez])
  for dx,dy,r in [(-.024,.040,.019),(.024,-.032,.008)]:
   sh=Shape();sh.ball([0,0,0],[r,r*1.18,.006],8,12);add('eye glint',sh,white,side,[ex+dx,ey+dy,ez-.083])
  # Brows taper toward the nose rather than forming detached round bars.
  brow=Shape();pts=[[side*.075,ey+.145,ez+.015],[side*.19,ey+.165,ez+.005],[side*.34,ey+.265,ez+.045],[side*.43,ey+.165,ez+.11]]
  if luna:pts=[[side*.08,ey+.17,ez+.025],[side*.23,ey+.29,ez+.04],[side*.36,ey+.27,ez+.09],[side*.43,ey+.20,ez+.16]]
  brow.tube(curve(pts,24),.023 if luna else .041,9,True);add('expressive sculpted brow',brow,browMat,side)
  if luna:
   lash=Shape()
   for j in range(4):
    x=side*(.34+j*.022);y=ey+.085-j*.007;lash.tube(curve([[x,y,ez-.013],[x+side*.055,y+.025,ez-.025],[x+side*(.075-j*.008),y+.08,ez-.018]],9),.0065,5,True)
   add('eyelash fan',lash,dark,side)
  muzzle=Shape();muzzle.ball([side*.125,cy-.145,cz-.405],[.19,.105,.12],20,32);add('muzzle',muzzle,cream,side)
  # Mouth follows the muzzle surface, without an isolated floating chin.
  mouth=Shape();mouth.tube(curve([[0,cy-.19,cz-.553],[side*.12,cy-.245,cz-.541],[side*.235,cy-.21,cz-.507],[side*.265,cy-.16,cz-.48]],24),.006,6,True);add('smile contour',mouth,dark,side)
  freckles=Shape()
  for j in range(5):
   freckles.ball([side*(.13+(j%3)*.032),cy-.13-(j//3)*.033,cz-.544+(j%3)*.009],[.004,.004,.003],5,6)
  add('whisker root follicles',freckles,liner,side,lod=1)
  whiskers=Shape()
  for j in range(3):
   whiskers.tube(curve([[side*.19,cy-.12-j*.043,cz-.545],[side*.40,cy-.11-j*.043,cz-.545],[side*.62,cy-.06-j*.09,cz-.49],[side*.77,cy-.03-j*.12,cz-.41]],22),.0026,5,True)
  add('fine whisker strand',whiskers,whiskerMat,side)
  # Fine directional cheek fur follows the head surface; no detached cheek discs.
  wisps=Shape()
  for j in range(15):
   y=cy-.08-(j%5)*.055;x=side*(.35+(j//5)*.05);z=cz-.43*math.sqrt(max(.05,1-(x/.63)**2-((y-cy)/.53)**2))-.008
   wisps.tube(curve([[x,y,z],[x+side*.055,y-.012,z+.025],[x+side*.12,y-.035,z+.065]],8),.0032,4,True)
  add('fine cheek fur strands',wisps,strand,side,lod=1)
  # Broad, tapered tabby markings contour the cheeks.
  markings=Shape()
  for j in range(3):
   y=cy+.02-j*.095;furStripe(markings,curve([[side*.35,y,0],[side*.47,y+.025,0],[side*.56,y+.045,0]],18),.014 if luna else .022)
  add('tabby cheek marking',markings,3,side)
 # Small triangular nose with a rounded bridge and a fine philtrum.
 nose=Shape();nose.surface([[-.068,cy-.105,cz-.565],[.068,cy-.105,cz-.565],[0,cy-.176,cz-.592],[0,cy-.10,cz-.599],[0,cy-.13,cz-.544]],[[0,3,2],[3,1,2],[0,4,3],[3,4,1],[0,2,4],[1,4,2]]);add('pink cat nose',nose,pink)
 shine=Shape();shine.tube(curve([[-.04,cy-.112,cz-.585],[0,cy-.108,cz-.605],[.038,cy-.112,cz-.585]],12),.005,6,True);add('nose highlight',shine,noseLight,lod=1)
 lip=Shape();lip.tube([[0,cy-.173,cz-.589],[0,cy-.197,cz-.561]],.005,6);add('philtrum',lip,dark)
 chin=Shape();chin.ball([0,cy-.25,cz-.18],[.35,.23,.29],18,28);add('chin',chin,cream)
 # Poster forehead stripes hug the curved forehead instead of standing upright.
 markings=Shape()
 for side in [-1,1]:
  for j in range(2):
   x=side*(.07+j*.095);furStripe(markings,curve([[x,cy+.46,0],[x*.85,cy+.39,0],[x*.60,cy+.27,0]],18),.015 if luna else .026)
 add('forehead tabby chevron',markings,3)
 # Soften and sweep Whisker's existing sculpted tuft instead of a vertical crest.
 if not luna:
  for n in doc['nodes']:
   if n['name']!='tapered orange crest':continue
   for semantic in ['POSITION','NORMAL']:
    ai=doc['meshes'][n['mesh']]['primitives'][0]['attributes'][semantic];a=doc['accessors'][ai];v=doc['bufferViews'][a['bufferView']];offset=v.get('byteOffset',0)+a.get('byteOffset',0);arr=np.frombuffer(blob,dtype='<f4',count=a['count']*3,offset=offset).copy().reshape(-1,3)
    if semantic=='POSITION':
     t=np.maximum(0,arr[:,1]-(cy+.36));arr[:,0]+=.42*t;arr[:,1]-=.25*t;arr[:,2]+=.14*t;a['min']=arr.min(0).tolist();a['max']=arr.max(0).tolist()
    else:arr[:,0]-=.42*arr[:,1];arr/=np.maximum(1e-9,np.linalg.norm(arr,axis=1))[:,None]
    blob[offset:offset+arr.nbytes]=arr.astype('<f4').tobytes()
 doc['scenes'][0]['nodes']=list(range(len(doc['nodes'])));doc['buffers'][0]['byteLength']=len(blob);doc['asset'].setdefault('extras',{})['face_revision']='poster-detail-3';blob.extend(b'\0'*((-len(blob))%4));j=json.dumps(doc,separators=(',',':')).encode();j+=b' '*((-len(j))%4);total=28+len(j)+len(blob);path.write_bytes(struct.pack('<III',0x46546c67,2,total)+struct.pack('<II',len(j),0x4e4f534a)+j+struct.pack('<II',len(blob),0x004e4942)+blob)
 print(name,len(doc['nodes']),'nodes',len(blob),'geometry bytes')
for name in ['Whisker','Luna']:refine(name)
