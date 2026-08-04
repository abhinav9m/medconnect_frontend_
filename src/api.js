
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function apiGet(path){
  try{
    const res = await fetch(`${API_BASE}${path}`);
    if(!res.ok) throw new Error('api fail');
    return await res.json();
  }catch(e){
    return null; // fallback to localStorage
  }
}
export async function apiPost(path, body){
  try{
    const res = await fetch(`${API_BASE}${path}`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    if(!res.ok) throw new Error('api fail');
    return await res.json();
  }catch(e){
    return null;
  }
}
export async function apiDelete(path){
  try{
    const res = await fetch(`${API_BASE}${path}`, {method:'DELETE'});
    if(!res.ok) throw new Error('api fail');
    return await res.json();
  }catch(e){ return null; }
}
export async function apiPatch(path, body){
  try{
    const res = await fetch(`${API_BASE}${path}`, {
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    if(!res.ok) throw new Error('api fail');
    return await res.json();
  }catch(e){ return null; }
}
