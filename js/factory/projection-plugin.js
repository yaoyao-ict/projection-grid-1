import _ from 'underscore';
import projections from '../projection/index';

const projectionConfigs = {
  JSData(config) {
    return {
      'jsdata.entity': config.dataSource.resource,
      'jsdata.query': config.dataSource.query,
      'jsdata.options': config.dataSource.options,
    };
  },

  ColumnI18n(config) {
    return {
      'column.i18n': _.reduce(config.columns, (columnI18n, column) => {
        columnI18n[column.field] = column.title || column.field;
        return columnI18n;
      }, {}),
    };
  },

  ColumnQueryable(config) {
    const columnIn = _.chain(config.columns)
    .reject(_.property('hidden'))
    .map(_.property('field'))
    .value();
    const columnLock = _.chain(config.columns)
    .filter(_.property('locked'))
    .map(_.property('field'))
    .value();
    const colqConfig = {
      'column.lock': columnLock,
      'column.in': columnIn,
    };

    if (_.has(config.columnShifter, 'totalColumns')) {
      colqConfig.take = config.columnShifter.totalColumns;
    }
    return colqConfig;
  },

  ColumnShifter() {},

  ColumnTemplate(config) {
    return {
      'column.template': _.reduce(config.columns, (columnTmpl, column) => {
        if (column.headerTemplate) {
          columnTmpl[column.field] = column.headerTemplate;
        }
        return columnTmpl;
      }, {}),
    };
  },

  PropertyTemplate(config) {
    return {
      'property.template': _.reduce(config.columns, (propTmpl, column) => {
        if (column.template) {
          propTmpl[column.field] = column.template;
        }
        return propTmpl;
      }, {}),
    };
  },
};

export default definePlugin => definePlugin('projection', [
  'config',
], function (config) {
  let projection = null;

  function pipeProjection(name) {
    const Projection = projections[name];
    const configProj = projectionConfigs[name](config);
    const projectionDest = new Projection(configProj);

    if (projection) {
      projection = projection.pipe(projectionDest);
    } else {
      projection = projectionDest;
    }
  }

  if (config.dataSource.type === 'js-data') {
    pipeProjection('JSData');
  } else {
    throw new Error(`dataSource.type "${config.dataSource.type}" is not supported`);
  }

  pipeProjection('ColumnI18n');
  pipeProjection('ColumnQueryable');

  _.has(config.columnShifter, 'totalColumns') && pipeProjection('ColumnShifter');

  pipeProjection('ColumnTemplate');
  pipeProjection('PropertyTemplate');

  return projection;
});
