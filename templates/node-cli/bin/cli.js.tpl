#!/usr/bin/env node
import { program } from 'commander';
program.name('{{name}}').description('{{description}}').version('0.1.0');
program.command('hello').description('say hello').action(()=>console.log('hello from {{name}}'));
program.parse();
