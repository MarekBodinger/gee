import camelCase from 'camelcase';
import fs from 'fs';
import inquirer from 'inquirer';
import kebabCase from 'just-kebab-case';
import mustache from 'mustache';
import path from 'path';

async function promptForQuestions() {
    const questions = [];
    questions.push({
        type: 'type',
        name: 'componentName',
        message: 'Component name (e.g. "customers list")',
        validate: input => {
            if (input.trim() === '') {
                return 'Cannot be empty.';
            }
            return true;
        },
    });

    questions.push({
        type: 'confirm',
        name: 'newFolder',
        message: 'Initialize in a new folder?',
        default: true,
    });

    questions.push({
        type: 'confirm',
        name: 'style',
        message: 'Create style?',
        default: true,
    });

    const answers = await inquirer.prompt(questions);
    return answers;
}

async function generateFiles(answers) {
    const kebabCaseComponentName = kebabCase(answers.componentName);
    const camelCaseComponentName = camelCase(answers.componentName);
    const pascalCaseComponentName = camelCase(answers.componentName, { pascalCase: true });
    const context = {
        kebabCaseComponentName,
        camelCaseComponentName,
        pascalCaseComponentName,
    };

    const tsTemplate = fs.readFileSync(path.resolve(__dirname, '../templates/ts'), 'utf8');
    const tsGenerated = mustache.render(tsTemplate, context);
    const scssTemplate = fs.readFileSync(path.resolve(__dirname, '../templates/scss'), 'utf8');
    const scssGenerated = mustache.render(scssTemplate, context);

    const htmlFilename = answers.newFolder
        ? `${kebabCaseComponentName}/${kebabCaseComponentName}.component.html`
        : `${kebabCaseComponentName}.component.html`;
    const tsFilename = answers.newFolder
        ? `${kebabCaseComponentName}/${kebabCaseComponentName}.component.ts`
        : `${kebabCaseComponentName}.component.ts`;
    const scssFilename = answers.newFolder
        ? `${kebabCaseComponentName}/${kebabCaseComponentName}.component.scss`
        : `${kebabCaseComponentName}.component.scss`;

    if (answers.newFolder) {
        const dir = `${kebabCaseComponentName}`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    }
    await fs.writeFileSync(htmlFilename, '');
    await fs.writeFileSync(tsFilename, tsGenerated);
    if (answers.style) {
        await fs.writeFileSync(scssFilename, scssGenerated);
    }
}

export async function cli(args) {
    const answers = await promptForQuestions();
    await generateFiles(answers);
}
