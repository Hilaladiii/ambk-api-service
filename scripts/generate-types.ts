import knexConfig from '../knexfile';
import knexInitializer from 'knex';
import { SchemaInspector } from 'knex-schema-inspector';
import * as fs from 'fs';
import * as path from 'path';

const generateTypes = async () => {
  const knex = knexInitializer(knexConfig);
  const inspector = SchemaInspector(knex);

  try {
    const tables = await inspector.tables();
    let typeDefinitions = `
import { Knex } from 'knex';

declare module 'knex' {
  namespace Knex {
    interface Tables {
`;

    for (const table of tables) {
      if (table.includes('knex_migrations')) continue;

      console.log(`Processing table: ${table}`);
      const columns = await inspector.columnInfo(table);

      typeDefinitions += `      '${table}': {\n`;

      for (const col of columns) {
        let tsType = 'string';

        switch (col.data_type) {
          case 'integer':
          case 'smallint':
          case 'bigint':
          case 'numeric':
          case 'real':
          case 'double precision':
            tsType = 'number';
            break;
          case 'boolean':
            tsType = 'boolean';
            break;
          case 'timestamp with time zone':
          case 'timestamp without time zone':
          case 'date':
            tsType = 'Date';
            break;
          case 'json':
          case 'jsonb':
            tsType = 'any';
            break;
          case 'uuid':
          case 'text':
          case 'character varying':
          default:
            tsType = 'string';
        }
        const isNullable = col.is_nullable ? ' | null' : '';
        typeDefinitions += `        ${col.name}: ${tsType}${isNullable};\n`;
      }

      typeDefinitions += `      };\n`;
    }

    typeDefinitions += `    }\n  }\n}\n`;

    const outputPath = path.join(__dirname, '../src/commons/types/knex.d.ts');

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, typeDefinitions);
    console.log(`✅ Success! Types generated at: ${outputPath}`);
  } catch (error) {
    console.error('❌ Error generating types:', error);
  } finally {
    await knex.destroy();
  }
};

generateTypes();
