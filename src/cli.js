import { generateCli } from './generate';
import { generateModalCli } from './generate-modal';

export async function cli(args) {
    if (args[2] === 'modal') {
        await generateModalCli();
    } else {
        await generateCli();
    }
}