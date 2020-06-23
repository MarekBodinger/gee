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
        name: 'name',
        message: 'Modal name (e.g. "customers list")',
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
    const kebabCaseName = kebabCase(answers.name);
    const camelCaseName = camelCase(answers.name);
    const pascalCaseName = camelCase(answers.name, { pascalCase: true });
    const context = {
        kebabCaseName,
        camelCaseName,
        pascalCaseName,
    };

    const componentHtmlTemplate = fs.readFileSync(path.resolve(__dirname, '../templates/modal/component-html'), 'utf8');
    const componentHtmlGenerated = mustache.render(componentHtmlTemplate, context);
    const componentTsTemplate = fs.readFileSync(path.resolve(__dirname, '../templates/modal/component-ts'), 'utf8');
    const componentTsGenerated = mustache.render(componentTsTemplate, context);
    const componentScssTemplate = fs.readFileSync(path.resolve(__dirname, '../templates/modal/component-scss'), 'utf8');
    const componentScssGenerated = mustache.render(componentScssTemplate, context);
    const moduleTemplate = fs.readFileSync(path.resolve(__dirname, '../templates/modal/module'), 'utf8');
    const moduleGenerated = mustache.render(moduleTemplate, context);
    const serviceTemplate = fs.readFileSync(path.resolve(__dirname, '../templates/modal/service'), 'utf8');
    const serviceGenerated = mustache.render(serviceTemplate, context);
    const typesTemplate = fs.readFileSync(path.resolve(__dirname, '../templates/modal/types'), 'utf8');
    const typesGenerated = mustache.render(typesTemplate, context);

    const dir = `${kebabCaseName}-modal`;
    const getPath = (fileName) => answers.newFolder ? `${dir}/${fileName}` : fileName;

    const componentHtmlFilename = getPath(`${kebabCaseName}-modal.component.html`)
    const componentTsFilename = getPath(`${kebabCaseName}-modal.component.ts`)
    const componentScssFilename = getPath(`${kebabCaseName}-modal.component.scss`)
    const moduleFilename = getPath(`${kebabCaseName}-modal.module.ts`)
    const serviceFilename = getPath(`${kebabCaseName}-modal.service.ts`)
    const typesFilename = getPath(`${kebabCaseName}-modal.types.ts`)

    if (answers.newFolder) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    }
    await fs.writeFileSync(componentHtmlFilename, componentHtmlGenerated);
    await fs.writeFileSync(componentTsFilename, componentTsGenerated);
    await fs.writeFileSync(moduleFilename, moduleGenerated);
    await fs.writeFileSync(serviceFilename, serviceGenerated);
    await fs.writeFileSync(typesFilename, typesGenerated);
    if (answers.style) {
        await fs.writeFileSync(componentScssFilename, componentScssGenerated);
    }
}

export async function generateModalCli() {
    const answers = await promptForQuestions();
    await generateFiles(answers);
}