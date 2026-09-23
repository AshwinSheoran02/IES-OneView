export const money=(n:number)=>{const a=Math.abs(n);if(a>=1e6)return`$${(a/1e6).toFixed(2)}M`;if(a>=1e5)return`$${Math.round(a/1e3)}K`;if(a>=1e3){const v=a/1e3;return`$${Number.isInteger(v)?v.toFixed(0):v.toFixed(1)}K`}return`$${a.toLocaleString('en-US')}`};
export const signedMoney=(n:number)=>`${n>=0?'+':'−'}${money(n)}`;
export const exactMoney=(n:number)=>n.toLocaleString('en-US',{style:'currency',currency:'USD'});
export const percent=(n:number)=>`${n>=0?'+':'−'}${Math.abs(n).toFixed(1)}%`;
