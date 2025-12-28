import Conf from 'conf';

interface ConfigSchema {
  defaultDataSource?: string;
}

const store = new Conf<ConfigSchema>({
  projectName: 'chartmogul-cli',
});

export const config = {
  getDefaultDataSource(): string | undefined {
    return store.get('defaultDataSource') || process.env.CHARTMOGUL_DATA_SOURCE;
  },

  setDefaultDataSource(dataSourceUuid: string): void {
    store.set('defaultDataSource', dataSourceUuid);
  },

  clearDefaultDataSource(): void {
    store.delete('defaultDataSource');
  },

  clear(): void {
    store.clear();
  },
};
