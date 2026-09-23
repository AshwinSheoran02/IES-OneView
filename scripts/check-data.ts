import{metrics,explanations}from'../src/data/northstar';
for(const m of metrics){for(const key of ['august','july'] as const){const sum=m.breakdown.reduce((a,b)=>a+b[key],0);if(sum!==m[key])throw Error(`${m.id} ${key}: ${sum} != ${m[key]}`)}}
for(const [id,e]of Object.entries(explanations)){if(e.drivers){const sum=e.drivers.reduce((a,b)=>a+b.change,0);const metric=metrics.find(m=>m.id===id)!;if(sum!==metric.change)throw Error(`${id} drivers: ${sum} != ${metric.change}`)}}console.log('All metric breakdowns and driver lists match their totals.');
