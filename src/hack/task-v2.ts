import {getServersWithAvailableMem} from './task-v1';
import {NS, Server} from '../NetscriptDefinitions';

// Did I spend way too long trying to get generics to cooperate? Maybe
// Was it worth it? Also maybe.
type ScriptArgMap = {
  '/synced/hack-grow.js': {hostname: string},
  '/synced/hack-hack.js': {hostname: string},
  '/synced/hack-weaken.js': {hostname: string},
};


export class Process<Script extends keyof ScriptArgMap> {
  private exitDelay?: Promise<void>;

  constructor(
    private ns: NS,
    private task: Task<Script>,
    public threads: number,
    public server: Server
  ) {}

  public run() {
    this.ns.exec(this.task.script, this.server.hostname, this.threads, ...[JSON.stringify(this.task.args)]);

    // We can't use ns.sleep & other functions concurrently
    // this.exitDelay = this.ns.sleep(this.expectedExecTime + Task.TimingFudgeDelay);
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    this.exitDelay = new Promise(r => setTimeout(() => r(), this.task.expectedExecTime + Task.TimingFudgeDelay));
  }

  public async exit() {
    await this.exitDelay;

    // TODO implement polling `ps` to check the script has actually finished
    // or some sort of event/callback
  }
}

export class Task<Script extends keyof ScriptArgMap> {
  public static TimingFudgeDelay = 100; // assume things take 50ms longer than expected

  private processes: Process<Script>[] = [];

  constructor(
    private ns: NS,
    public script: Script,
    public args: ScriptArgMap[Script],
    public expectedExecTime: number,
    public threads: number,
    public canSplitAllocate = true // whether we can split the threads across multiple proceses
  ) {
    if (!this.script.startsWith('/')) throw new Error('All scripts must start with a `/`');
  }

  public toString() {
    return `Task(ns, ${this.script}, ${JSON.stringify(this.args)}, ${Math.round(this.expectedExecTime / 100) / 10}s, ${this.threads})`
  }

  public run() {
    this.ns.print(`running ${this.toString()}`);

    const threadMemory = this.threadCost();

    const eligibleHosts = getServersWithAvailableMem(this.ns)
      .filter(([, available]) => available > threadMemory) // filter to schedulable servers
      .sort(([, a], [, b]) => b - a); // sort by which have the most memory available

    let threadsToSchedule = this.threads;
    for (const [server, available] of eligibleHosts) {
      if (threadsToSchedule == 0) break; // We've scheduled all required threads! Yay, we're done

      const maxThreadsAvailable = Math.floor(available / threadMemory);
      const toSchedule = Math.min(threadsToSchedule, maxThreadsAvailable);

      if (toSchedule !== threadsToSchedule && !this.canSplitAllocate) throw new Error('Unable to allocate all threads at once');

      if (toSchedule === 0) {
        // This server didn't have enough memory to run any threads - given we're going in descending order, no others will either
        break;
      }

      this.processes.push(new Process(this.ns, this, toSchedule, server));
      threadsToSchedule -= toSchedule;
    }

    if (threadsToSchedule > 0) throw new Error(`Unable to allocate all threads (${threadsToSchedule} remaining of ${this.threads})`);

    this.processes.forEach(p => p.run());
  }

  public async exit(): Promise<void> {
    await Promise.all(this.processes.map(p => p.exit()));
  }

  public threadCost(): number {
    return this.ns.getScriptRam(this.script);
  }
}