import {runTask} from './tasks';
import {NS} from '../NetscriptDefinitions';

type TaskState = 'CREATED' | 'RUNNING' | 'FINISHED';

export class Task {
  public static TimingFudgeDelay = 50; // assume things take 50ms longer than expected

  public state: TaskState = 'CREATED';

  private exitDelay?: Promise<void>;

  constructor(
    private ns: NS,
    public script: string,
    public args: (string | number)[],
    public expectedExecTime: number,
    public threads: number
  ) {}

  public run() {
    this.ns.print(`Running ${this.script} with ${this.threads} threads, expected to take ${this.expectedExecTime}`);
    runTask(this.ns, this);
    this.state = 'RUNNING';
    // We can't use ns.sleep & other functions concurrently
    // this.exitDelay = this.ns.sleep(this.expectedExecTime + Task.TimingFudgeDelay);
    this.exitDelay = new Promise(r => setTimeout(() => r(), this.expectedExecTime + Task.TimingFudgeDelay));
  }

  public async exit() {
    if (this.state !== 'RUNNING') throw new Error('Task isn\'t running');

    await this.exitDelay;

    this.state = 'FINISHED';

    // TODO implement polling `ps` to check the script has actually finished
    // or some sort of event/callback
  }

  public threadCost(): number {
    return this.ns.getScriptRam(this.script);
  }
}