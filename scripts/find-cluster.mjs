import fs from 'fs/promises';

async function main() {
  const file = await fs.readFile('perf-trace.json', 'utf8');
  const events = JSON.parse(file).traceEvents || JSON.parse(file);

  const marks = [];
  const longTasks = [];

  for (const ev of events) {
    if (ev.name === 'TimeStamp' && ev.args?.data?.message) {
      marks.push({ msg: ev.args.data.message, ts: ev.ts });
    }
    if (ev.dur > 50000 && !['MessageLoop::RunTask', 'TaskQueueManager::ProcessTaskFromWorkQueue', 'ThreadControllerImpl::RunTask'].includes(ev.name)) {
      longTasks.push(ev);
    }
  }

  marks.sort((a,b) => a.ts - b.ts);
  
  for (const task of longTasks) {
    let context = 'Antes del inicio / Fuera de rango';
    for (let i = 0; i < marks.length; i++) {
      if (task.ts >= marks[i].ts) {
        context = marks[i].msg;
      }
    }
    console.log(`[${(task.dur/1000).toFixed(2)}ms] ${task.name} -> Contexto: ${context}`);
  }
}
main().catch(console.error);
