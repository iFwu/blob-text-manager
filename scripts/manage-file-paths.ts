import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';

const SOURCE_PATTERNS = [
  '**/*.ts',
  '**/*.tsx',
  '**/*.js',
  '**/*.jsx',
  '**/*.css',
  '**/*.scss',
  '**/*.less',
];

const IGNORE_PATTERNS = [
  'node_modules/**',
  'dist/**',
  '.next/**',
  'build/**',
  'scripts/manage-file-paths.ts',
];

async function manageFilePathComments(shouldAdd: boolean) {
  const files = await glob(SOURCE_PATTERNS, {
    ignore: IGNORE_PATTERNS,
    absolute: false,
  });

  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    const relativePath = path.relative(process.cwd(), file);

    if (shouldAdd) {
      // Skip if already has path comment
      if (
        content.startsWith(`// File: ${relativePath}`) ||
        content.startsWith(`/* File: ${relativePath}`)
      ) {
        continue;
      }

      const fileExtension = path.extname(file);
      let commentPrefix = '//';

      // Use appropriate comment style based on file type
      if (['.css', '.scss', '.less'].includes(fileExtension)) {
        commentPrefix = '/*';
      }

      const newContent =
        commentPrefix === '//'
          ? `// File: ${relativePath}\n\n${content}`
          : `/* File: ${relativePath} */\n\n${content}`;

      await writeFile(file, newContent, 'utf-8');
      console.log(`✓ Added path comment to ${relativePath}`);
    } else {
      // Remove comments
      let newContent = content;
      // Remove JS/TS style comments
      newContent = newContent.replace(/^\/\/ File: .*?\n\n/, '');
      // Remove CSS style comments
      newContent = newContent.replace(/^\/\* File: .*? \*\/\n\n/, '');

      if (content !== newContent) {
        await writeFile(file, newContent, 'utf-8');
        console.log(`✓ Removed path comment from ${relativePath}`);
      }
    }
  }
}

const action = process.argv[2];
if (action !== 'add' && action !== 'remove') {
  console.error('Usage: pnpm manage-file-paths <add|remove>');
  process.exit(1);
}

manageFilePathComments(action === 'add').catch(console.error);
