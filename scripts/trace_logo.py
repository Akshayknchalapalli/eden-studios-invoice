"""Trace the supplied logo's coloured foreground into real SVG paths.

The source is the 960x540 PDF render. Studio photography is excluded by region
and colour; lettering is traced, not replaced with a font or an embedded bitmap.
"""
from pathlib import Path
from collections import defaultdict
import math
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]

def simplify(points,tolerance=.55):
    if len(points)<3:return points
    a,b=points[0],points[-1]
    dx,dy=b[0]-a[0],b[1]-a[1]
    den=math.hypot(dx,dy)
    distances=[abs(dy*(p[0]-a[0])-dx*(p[1]-a[1]))/den if den else math.hypot(p[0]-a[0],p[1]-a[1]) for p in points]
    i=max(range(len(points)),key=lambda n:distances[n])
    if distances[i]<=tolerance:return [a,b]
    return simplify(points[:i+1],tolerance)[:-1]+simplify(points[i:],tolerance)

def trace(mask):
    edges=defaultdict(list)
    h,w=mask.shape
    for y,x in zip(*np.where(mask)):
        x,y=int(x),int(y)
        if y==0 or not mask[y-1,x]:edges[(x,y)].append((x+1,y))
        if x==w-1 or not mask[y,x+1]:edges[(x+1,y)].append((x+1,y+1))
        if y==h-1 or not mask[y+1,x]:edges[(x+1,y+1)].append((x,y+1))
        if x==0 or not mask[y,x-1]:edges[(x,y+1)].append((x,y))
    paths=[]
    dirs={(1,0):0,(0,1):1,(-1,0):2,(0,-1):3}
    while edges:
        start=next(iter(edges));point=start;points=[start];direction=0
        while True:
            choices=edges[point]
            def rank(next_point):
                d=dirs[(next_point[0]-point[0],next_point[1]-point[1])]
                return {1:0,0:1,3:2,2:3}[(d-direction)%4]
            nxt=min(choices,key=rank);choices.remove(nxt)
            if not choices:del edges[point]
            direction=dirs[(nxt[0]-point[0],nxt[1]-point[1])]
            point=nxt;points.append(point)
            if point==start:break
        area=abs(sum(points[i][0]*points[i+1][1]-points[i+1][0]*points[i][1] for i in range(len(points)-1))/2)
        if area<2:continue
        farthest=max(range(1,len(points)-1),key=lambda i:(points[i][0]-start[0])**2+(points[i][1]-start[1])**2)
        pts=simplify(points[:farthest+1])[:-1]+simplify(points[farthest:])[:-1]
        paths.append('M'+' L'.join(str(x-250)+','+str(y-105) for x,y in pts)+' Z')
    return ' '.join(paths)

if __name__=='__main__':
    image=np.array(Image.open(ROOT/'dist/eden-logo-landscape.png').convert('RGB')).astype(int)
    r,g,b=image[:,:,0],image[:,:,1],image[:,:,2];y,x=np.indices(r.shape)
    gold=(r>180)&(g>100)&(b<100)&(x>245)&(x<710)&(y>100)&(y<345)
    note=(b>120)&(b>r*1.4)&(b>g*1.2)&(x>350)&(x<605)&(y>100)&(y<345)
    white=(r>175)&(g>175)&(b>175)&(x>245)&(x<710)&(y>340)&(y<429)
    svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 465 330" role="img" aria-labelledby="title"><title id="title">Eden Studios — A complete music production studio</title>'
    svg+='<rect x="8" y="290" width="445" height="30" rx="2" fill="#3c509e"/>'
    for mask,colour in [(gold,'#ffb414'),(note,'#3b53a2'),(white,'#ffffff')]:
        svg+='<path fill="'+colour+'" fill-rule="evenodd" d="'+trace(mask)+'"/>'
    svg+='</svg>\n'
    (ROOT/'dist/eden-logo.svg').write_text(svg)
