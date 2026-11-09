import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import * as finance from '../src/utils/finance.js';

// Drive the real hook with controlled effects, timers and network responses.
function harness() {
  const slots = [], effects = [], timers = new Map(); let cursor = 0, id = 0, output, rpc;
  const react = {
    useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial; return [slots[i], next => { slots[i] = typeof next === 'function' ? next(slots[i]) : next; }]; },
    useRef(initial) { const i = cursor++; return slots[i] ||= {current: initial}; },
    useCallback(fn, deps) { const i=cursor++; const old=slots[i]; if (!old || deps.some((d,j)=>!Object.is(d,old.deps[j]))) slots[i]={fn,deps}; return slots[i].fn; },
    useEffect(fn, deps) { const i = cursor++; const old = slots[i]; if (!old || deps.some((d,j) => !Object.is(d, old.deps[j]))) { slots[i] = {deps, cleanup: old?.cleanup}; effects.push(() => { slots[i].cleanup?.(); slots[i].cleanup = fn(); }); } },
  };
  const query = {select(){return this;},eq(){return this;},async maybeSingle(){return {data:null,error:null};}};
  const context = vm.createContext({...finance, ...react, supabase: {from:()=>query, rpc: (...args)=>rpc(...args)}, setTimeout(fn){timers.set(++id, fn);return id;},clearTimeout(i){timers.delete(i);},setInterval(){return 0;},clearInterval(){},window:{addEventListener(){},removeEventListener(){}},document:{visibilityState:'visible'}});
  const code = readFileSync(new URL('../src/hooks/useFinanceData.js', import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'').replace('export function useFinanceData','function useFinanceData');
  vm.runInContext(code, context);
  return {
    render(){cursor=0;output=context.useFinanceData('user','2026-11');while(effects.length)effects.shift()();return output;},
    async ready(){this.render();await new Promise(setImmediate);return this.render();},
    setRpc(fn){rpc=fn;}, tick(){const pending=[...timers.values()];timers.clear();pending.forEach(fn=>fn());},
  };
}
test('autosave waits for edits, serializes requests and preserves edits made in flight', async () => {
  const h=harness();let f=await h.ready();let resolve;const calls=[];
  h.setRpc((_,args)=>{calls.push(args);return new Promise(r=>{resolve=r;});});
  f.add('expense');f=h.render();h.tick();f=h.render();assert.equal(f.saving,true);assert.equal(calls.length,1);
  const row=f.expense[0];f.update('expense',row.id,{value:123});f=h.render();h.tick();assert.equal(calls.length,1);
  resolve({data:1,error:null});await new Promise(setImmediate);f=h.render();assert.equal(f.expense[0].value,123);assert.equal(f.dirty,true);
  h.tick();h.render();assert.equal(calls.length,2);assert.equal(calls[1].p_revision,1);assert.equal(calls[1].p_data.expense[0].value,123);
  resolve({data:2,error:null});await new Promise(setImmediate);f=h.render();assert.equal(f.dirty,false);
});
test('failed save preserves draft and pauses automatic retry', async () => {
  const h=harness();let f=await h.ready();let calls=0;
  h.setRpc(async()=>{calls++;return {error:{message:'CONFLICT'}};});f.add('expense');h.render();h.tick();await new Promise(setImmediate);f=h.render();
  assert.equal(f.dirty,true);assert.match(f.error,/outro dispositivo/);h.tick();assert.equal(calls,1);
});
