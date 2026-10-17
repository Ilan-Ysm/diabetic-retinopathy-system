import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_URL } from '@/lib/api';
import { SESSION_COOKIE } from '@/lib/session';
export async function GET(_request: NextRequest, { params }: { params: Promise<{name:string}> }) {
  const {name}=await params;
  if(!/^\d+$/.test(name)) return new NextResponse(null,{status:404});
  const token=(await cookies()).get(SESSION_COOKIE)?.value;
  if(!token) return new NextResponse(null,{status:401});
  const response=await fetch(`${API_URL}/scans/${name}/image`,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});
  if(!response.ok) return new NextResponse(null,{status:response.status});
  return new NextResponse(response.body,{status:200,headers:{'Content-Type':response.headers.get('Content-Type')??'image/jpeg','Cache-Control':'private, no-store'}});
}
