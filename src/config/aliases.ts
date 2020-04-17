import moduleAlias from 'module-alias';
import path from 'path';

const root = path.resolve(__dirname, '..');

// update alias routes
moduleAlias.addAliases({
  '@modules': path.resolve(root, 'rest/modules'),
  '@services': path.resolve(root, 'services'),
});
