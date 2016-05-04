import GridView from '../grid-view';
import layout from '../layout/index';

export default definePlugin => definePlugin('gridView', [
  'config',
  'projection',
  'renderers',
  'columns',
], function (config, projection, renderers, columns) {
  return new GridView({
    projection,
    el: config.el,
    container: config.container,
    schema: config.dataSource.schema,
    Layout: layout.TableLayout.partial({
      renderers,
      template: layout.templates.table,
      hideHeaders: config.hideHeaders,
      columns,
    }),
  });
});